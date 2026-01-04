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
    const { outTradeNo, refundAmount, refundReason, operatorId } = event;

    // TODO: Verify operatorId permissions (skipped for now)

    if (!outTradeNo || !refundAmount) {
        return { code: 400, message: "Missing required parameters" };
    }

    try {
        // 1. Find Order
        const orderRes = await db.collection('orders')
            .where({ outTradeNo })
            .get();

        if (orderRes.data.length === 0) {
            return { code: 404, message: "Order not found" };
        }

        const order = orderRes.data[0];

        if (order.status !== 'PAID') {
            return { code: 400, message: "Only paid orders can be refunded" };
        }

        if (Number(refundAmount) > Number(order.amount)) {
            return { code: 400, message: "Refund amount exceeds order amount" };
        }

        // 2. Generate Refund No
        const refundNo = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // 3. Call Alipay Refund
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

        const result = await alipaySdk.exec('alipay.trade.refund', {
            bizContent: {
                out_trade_no: outTradeNo,
                refund_amount: Number(refundAmount).toFixed(2),
                out_request_no: refundNo,
                refund_reason: refundReason || '用户申请退款'
            }
        });

        if (result.code !== '10000') {
            return {
                code: 500,
                message: result.sub_msg || 'Refund failed',
                alipayError: result
            };
        }

        // 4. Update Order Status
        const isFullRefund = Number(refundAmount) >= Number(order.amount);

        await db.collection('orders').doc(order._id).update({
            data: {
                status: isFullRefund ? 'REFUNDED' : 'PARTIAL_REFUNDED',
                refundAmount: Number(refundAmount),
                refundNo: refundNo,
                refundAt: db.serverDate(),
                refundBy: operatorId || 'system'
            }
        });

        // 5. Update Application Status
        if (order.userId && isFullRefund) {
            await db.collection('applications').doc(order.userId).update({
                data: {
                    'payment.status': 'refunded',
                    'payment.refundAt': db.serverDate(),
                    'status': 'withdrawn'
                }
            });
        }

        return {
            code: 0,
            message: "Refund successful",
            data: { refundNo, refundAmount }
        };

    } catch (err) {
        console.error("Refund Error:", err);
        return { code: 500, message: err.message };
    }
};
