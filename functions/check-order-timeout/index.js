const AlipaySdk = require('alipay-sdk').default;
const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
    // Format keys: strip whitespace for raw base64
    const privateKey = (process.env.ALIPAY_PRIVATE_KEY || '').replace(/[\s\n\r]/g, '');
    const publicKey = (process.env.ALIPAY_PUBLIC_KEY || '').replace(/[\s\n\r]/g, '');

    const alipaySdk = new AlipaySdk({
        appId: process.env.ALIPAY_APP_ID,
        privateKey: privateKey,
        alipayPublicKey: publicKey,
        gateway: 'https://openapi.alipay.com/gateway.do',
        signType: 'RSA2',
        keyType: 'PKCS1'
    });

    const now = new Date();

    try {
        const expiredRes = await db.collection('orders')
            .where({
                status: 'PENDING',
                expireAt: _.lt(now)
            })
            .limit(100)
            .get();

        const orders = expiredRes.data;
        console.log(`Checking timeout for ${orders.length} orders`);

        for (const order of orders) {
            await processOrder(order, alipaySdk);
        }

        return { success: true, processed: orders.length };
    } catch (err) {
        console.error("Check Timeout Failed:", err);
        return { success: false, error: err.message };
    }
};

async function processOrder(order, alipaySdk) {
    const { outTradeNo, _id, userId } = order;
    console.log(`Processing Order: ${outTradeNo}`);

    try {

        // 0. Optimistic Lock
        // Mark as PROCESSING to prevent other triggers from picking it up
        const updateLock = await db.collection('orders').where({
            _id: _id,
            status: 'PENDING' // Ensure it's still pending
        }).update({
            data: {
                status: 'PROCESSING',
                processingAt: db.serverDate()
            }
        });

        // CloudBase wx-server-sdk returns { stats: { updated: 1 } }
        if (updateLock.stats.updated === 0) {
            console.log(`Order ${outTradeNo} lock failed (already processed).`);
            return;
        }

        // 2. Query Alipay Status
        const result = await alipaySdk.exec('alipay.trade.query', {
            bizContent: { out_trade_no: outTradeNo }
        });

        // Check API call success
        if (result.code !== '10000') {
            // API connection failed or business failure
            if (result.code === '40004' && result.sub_code === 'ACQ.TRADE_NOT_EXIST') {
                // Trade does not exist in Alipay -> Close local
                console.log(`Order ${outTradeNo} not found in Alipay. Closing local.`);
                await db.collection('orders').doc(_id).update({
                    data: {
                        status: 'CLOSED',
                        closedAt: db.serverDate()
                    }
                });
            } else {
                console.error(`Alipay Query Failed for ${outTradeNo}: ${result.msg} - ${result.sub_msg}`);
                await db.collection('orders').doc(_id).update({
                    data: {
                        status: 'PENDING', // Retry next cycle
                        lastError: `${result.code}:${result.sub_code}`
                    }
                });
            }
            return;
        }

        const tradeStatus = result.trade_status;

        if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
            // Paid but we missed notification
            console.log(`Order ${outTradeNo} was PAID (Sync).`);
            await db.collection('orders').doc(_id).update({
                data: {
                    status: 'PAID',
                    transactionId: result.trade_no,
                    payTime: db.serverDate(),
                    syncedBy: 'check-order-timeout'
                }
            });
            if (userId) {
                await db.collection('applications').doc(userId).update({
                    data: {
                        'payment.status': 'paid',
                        'payment.paidAt': db.serverDate(),
                        'payment.orderId': outTradeNo,
                        'payment.amount': Number(order.amount),
                        'status': 'paid',
                        'timeline.enrolledAt': db.serverDate()
                    }
                });
            }

        } else if (tradeStatus === 'WAIT_BUYER_PAY') {
            // 3. Close Order in Alipay and Locally
            console.log(`Order ${outTradeNo} is WAIT_BUYER_PAY (Timeout). Closing.`);

            // Try to close in Alipay
            try {
                await alipaySdk.exec('alipay.trade.close', {
                    bizContent: { out_trade_no: outTradeNo }
                });
            } catch (closeErr) {
                console.error("Alipay Close Error:", closeErr);
            }

            await db.collection('orders').doc(_id).update({
                data: {
                    status: 'CLOSED',
                    closedAt: db.serverDate()
                }
            });

        } else if (tradeStatus === 'TRADE_CLOSED') {
            // Already closed in Alipay
            await db.collection('orders').doc(_id).update({
                data: {
                    status: 'CLOSED',
                    closedAt: db.serverDate()
                }
            });
        }

    } catch (err) {
        console.error(`Error processing ${outTradeNo}:`, err);

        // Handle specific Alipay SDK errors if thrown
        // If error, revert lock to PENDING
        await db.collection('orders').doc(_id).update({
            data: {
                status: 'PENDING',
                lastError: err.message
            }
        });
    }
}
