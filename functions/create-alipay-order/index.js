const AlipaySdk = require('alipay-sdk').default;
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
    const { userId, amount, subject, returnUrl } = event;

    if (!amount || !userId) {
        return { code: 400, message: "Missing required parameters: userId, amount" };
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return { code: 400, message: "Invalid amount" };
    }
    const totalAmount = numAmount.toFixed(2);

    // 直接用环境变量，清理空白字符即可
    const privateKey = (process.env.ALIPAY_PRIVATE_KEY || '').replace(/[\s\n\r]/g, '');
    const publicKey = (process.env.ALIPAY_PUBLIC_KEY || '').replace(/[\s\n\r]/g, '');

    const alipaySdk = new AlipaySdk({
        appId: process.env.ALIPAY_APP_ID,
        privateKey: privateKey,
        alipayPublicKey: publicKey,
        gateway: 'https://openapi.alipay.com/gateway.do',
        signType: 'RSA2',
        keyType: 'PKCS1'  // 你已经转换成 PKCS1 了
    });

    const outTradeNo = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 1. Create Local Order
    try {
        await db.collection('orders').add({
            data: {
                outTradeNo,
                userId,
                amount: Number(totalAmount),
                subject: subject || 'Jianshan Camp Tuition',
                status: 'PENDING',
                createdAt: db.serverDate(),
                expireAt: new Date(Date.now() + 30 * 60 * 1000),
                clientIp: event.clientIp || '0.0.0.0'
            }
        });
    } catch (err) {
        console.error("DB Create Order Failed", err);
        return { code: 500, message: "Failed to create order record" };
    }

    // 2. Call Alipay SDK
    try {
        const result = await alipaySdk.pageExec('alipay.trade.page.pay', {
            method: 'GET',
            bizContent: {
                out_trade_no: outTradeNo,
                product_code: 'FAST_INSTANT_TRADE_PAY',
                total_amount: totalAmount,
                subject: subject || 'Tuition Payment',
                timeout_express: '30m',
            },
            return_url: returnUrl || 'https://jianshanacademy.cn/dashboard/payment/success',
            notify_url: 'https://jianshanacademy.cn/payment/notify'
        });

        return {
            code: 0,
            data: { payUrl: result, outTradeNo }
        };
    } catch (err) {
        console.error("Alipay SDK Execute Failed", err);
        return { code: 500, message: "Alipay Signature Failed", error: err.message };
    }
};
