const AlipaySdk = require('alipay-sdk').default;
const cloud = require('wx-server-sdk');

const ALIPAY_CONFIG = {
    appId: process.env.ALIPAY_APP_ID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    gateway: 'https://openapi.alipay.com/gateway.do'
};

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
    const { outTradeNo, userId } = event;

    if (!outTradeNo && !userId) {
        return { code: 400, message: "Missing outTradeNo or userId" };
    }

    try {
        // 1. Check local DB
        let query = outTradeNo
            ? { outTradeNo }
            : { userId, status: 'PENDING' };

        const orderRes = await db.collection('orders')
            .where(query)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (orderRes.data.length === 0) {
            return { code: 404, message: "Order not found" };
        }

        const order = orderRes.data[0];

        // 2. If PAID, return immediately
        if (order.status === 'PAID') {
            return {
                code: 0,
                data: {
                    status: 'PAID',
                    outTradeNo: order.outTradeNo,
                    amount: order.amount,
                    payTime: order.payTime
                }
            };
        }

        // 3. If PENDING, query Alipay
        if (order.status === 'PENDING') {
            // Clean keys directly here
            const privateKey = (ALIPAY_CONFIG.privateKey || '').replace(/[\s\n\r]/g, '');
            const publicKey = (ALIPAY_CONFIG.alipayPublicKey || '').replace(/[\s\n\r]/g, '');

            const alipaySdk = new AlipaySdk({
                appId: ALIPAY_CONFIG.appId,
                privateKey: privateKey,
                alipayPublicKey: publicKey,
                gateway: ALIPAY_CONFIG.gateway,
                signType: 'RSA2',
                keyType: 'PKCS1'
            });

            const result = await alipaySdk.exec('alipay.trade.query', {
                bizContent: { out_trade_no: order.outTradeNo }
            });

            // If Alipay says success, sync logic
            if (result.code === '10000' &&
                (result.trade_status === 'TRADE_SUCCESS' || result.trade_status === 'TRADE_FINISHED')) {

                await db.collection('orders').doc(order._id).update({
                    data: {
                        status: 'PAID',
                        transactionId: result.trade_no,
                        payTime: db.serverDate(),
                        syncedBy: 'query-payment-status'
                    }
                });

                // Sync application
                if (order.userId) {
                    await db.collection('applications').doc(order.userId).update({
                        data: {
                            'payment.status': 'paid',
                            'payment.paidAt': db.serverDate(),
                            'payment.orderId': order.outTradeNo,
                            'payment.amount': Number(order.amount),
                            'status': 'paid',
                            'timeline.enrolledAt': db.serverDate()
                        }
                    });
                }

                return {
                    code: 0,
                    data: { status: 'PAID', outTradeNo: order.outTradeNo }
                };
            }

            // Still PENDING
            return {
                code: 0,
                data: {
                    status: 'PENDING',
                    outTradeNo: order.outTradeNo,
                    expireAt: order.expireAt
                }
            };
        }

        // 4. Other Status
        return {
            code: 0,
            data: { status: order.status, outTradeNo: order.outTradeNo }
        };

    } catch (err) {
        console.error("Query Payment Error:", err);
        return { code: 500, message: err.message };
    }
};
