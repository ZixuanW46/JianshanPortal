const AlipaySdk = require('alipay-sdk').default;
const cloud = require('wx-server-sdk');
const querystring = require('querystring');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();




// Standard Response Wrapper
const response = (body) => ({
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body
});

exports.main = async (event, context) => {
    console.log("Alipay Notify Received:", JSON.stringify(event));

    // 1. Parse form-urlencoded data (Alipay mostly uses this)
    let params;
    try {
        if (event.body) {
            const bodyStr = event.isBase64Encoded
                ? Buffer.from(event.body, 'base64').toString()
                : event.body;
            // Use querystring.parse for standard POST bodies from Alipay
            params = querystring.parse(bodyStr);
        } else {
            params = event;
        }
    } catch (e) {
        console.error("Parse body failed:", e);
        return response('fail');
    }

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

    try {
        // 2. Verify Signature
        const isValid = alipaySdk.checkNotifySign(params);
        if (!isValid) {
            console.error("Alipay Signature Verification Failed");
            return response('fail');
        }

        const { out_trade_no, trade_status, trade_no, total_amount } = params;

        // 3. Handle Status
        // SUCCESS or FINISHED
        if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
            const orderRes = await db.collection('orders').where({ outTradeNo: out_trade_no }).get();

            if (orderRes.data.length === 0) {
                console.error("Order not found:", out_trade_no);
                // Return success to stop Alipay from retrying if order not found (might be test or mismatch)
                return response('success');
            }

            const order = orderRes.data[0];

            // Amount Check
            if (Math.abs(Number(total_amount) - Number(order.amount)) > 0.01) {
                console.error("Amount mismatch:", total_amount, order.amount);
                return response('fail');
            }

            // Idempotency
            if (order.status === 'PAID') {
                return response('success');
            }

            // Update Order (Wrapped in data)
            await db.collection('orders').doc(order._id).update({
                data: {
                    status: 'PAID',
                    transactionId: trade_no,
                    payTime: db.serverDate(),
                    notifyData: params
                }
            });

            // Update Application (Wrapped in data)
            if (order.userId) {
                await db.collection('applications').doc(order.userId).update({
                    data: {
                        'payment.status': 'paid',
                        'payment.orderId': out_trade_no,
                        'payment.paidAt': db.serverDate(),
                        'payment.amount': Number(total_amount),
                        'status': 'paid',
                        'timeline.enrolledAt': db.serverDate()
                    }
                });
            }

            console.log("Payment Success Processed for:", out_trade_no);
        } else if (trade_status === 'TRADE_CLOSED') {
            const orderRes = await db.collection('orders').where({ outTradeNo: out_trade_no }).get();
            if (orderRes.data.length > 0) {
                const order = orderRes.data[0];
                if (order.status === 'PENDING') {
                    // Update Local to CLOSED
                    await db.collection('orders').doc(order._id).update({
                        data: {
                            status: 'CLOSED',
                            closedAt: db.serverDate()
                        }
                    });
                }
            }
        }

        return response('success');
    } catch (err) {
        console.error("Alipay Notify Error:", err);
        return response('fail');
    }
};
