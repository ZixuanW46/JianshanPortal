const tencentcloud = require("tencentcloud-sdk-nodejs");

const SmsClient = tencentcloud.sms.v20210111.Client;

// Secrets from environment variables
const SECRET_ID = process.env.TENCENT_SECRET_ID;
const SECRET_KEY = process.env.TENCENT_SECRET_KEY;
const REGION = process.env.TENCENT_REGION || "ap-guangzhou";

const clientConfig = {
    credential: {
        secretId: SECRET_ID,
        secretKey: SECRET_KEY,
    },
    region: REGION,
    signMethod: "HmacSHA256",
    profile: {
        httpProfile: {
            reqMethod: "POST", // 请求方法
            reqTimeout: 10, // 请求超时时间，默认60s
            endpoint: "sms.tencentcloudapi.com",
        },
    },
};

const client = new SmsClient(clientConfig);

exports.main = async (event, context) => {
    console.log("Receive event:", event);

    /*
      Expected event structure:
      {
        phoneNumber: string, // e.g., "+8613800000000" or "13800000000"
        templateId: string,  // e.g., "2577415"
        templateParams: string[], // e.g., ["John Doe"]
      }
    */
    const { phoneNumber, templateId, templateParams } = event;

    if (!phoneNumber) {
        return {
            code: -1,
            message: "Missing phoneNumber",
        };
    }

    if (!templateId) {
        return {
            code: -1,
            message: "Missing templateId",
        };
    }

    // Ensure phone number starts with +86 if it's a Chinese number without +
    // Although Tencent SMS usually requires +86 for Mainland China, local usage might vary.
    // Let's safe guard: If it's 11 digits and starts with 1, assume CN (+86)
    let finalPhoneNumber = String(phoneNumber);
    if (/^1[3-9]\d{9}$/.test(finalPhoneNumber)) {
        finalPhoneNumber = `+86${finalPhoneNumber}`;
    }

    const params = {
        SmsSdkAppId: "1401071137",
        SignName: "咖彼上海文化科技",
        TemplateId: String(templateId),
        PhoneNumberSet: [finalPhoneNumber],
    };

    console.log("Sending SMS with params:", params);

    try {
        const data = await client.SendSms(params);
        console.log("SMS Success:", data);

        // Tencent SMS API always returns 200 OK even if delivery failed partially.
        // Needs to check SendStatusSet[0].Code == "Ok"
        if (data.SendStatusSet && data.SendStatusSet[0] && data.SendStatusSet[0].Code === "Ok") {
            return {
                code: 0,
                data: data,
                message: "SMS sent successfully",
            };
        } else {
            return {
                code: -1,
                data: data,
                message: `SMS API returned error: ${data.SendStatusSet?.[0]?.Code} - ${data.SendStatusSet?.[0]?.Message}`,
            };
        }

    } catch (err) {
        console.error("SMS Error:", err);
        return {
            code: -1,
            message: "Failed to send SMS",
            error: err.toString(),
        };
    }
};
