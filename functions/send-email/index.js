const tencentcloud = require("tencentcloud-sdk-nodejs");

const SesClient = tencentcloud.ses.v20201002.Client;

// SECURE CREDENTIALS
// Credentials should be injected via environment variables in the cloud function configuration
const SECRET_ID = process.env.TENCENT_SECRET_ID;
const SECRET_KEY = process.env.TENCENT_SECRET_KEY;
const REGION = process.env.TENCENT_REGION || "ap-guangzhou";

const clientConfig = {
    credential: {
        secretId: SECRET_ID,
        secretKey: SECRET_KEY,
    },
    region: REGION,
    profile: {
        httpProfile: {
            endpoint: "ses.tencentcloudapi.com",
        },
    },
};

const client = new SesClient(clientConfig);

exports.main = async (event, context) => {
    console.log("Receive event:", event);

    const { toEmail, templateId, templateData, subject } = event;

    if (!toEmail) {
        return {
            code: -1,
            message: "Missing toEmail",
        };
    }

    // Construct TemplateParam parameter for SDK
    // SDK expects TemplateParam as a JSON string: "{\"name\":\"Value\"}"
    let templateParam = "";
    if (templateData) {
        // If it's already an object, convert to JSON string
        // If it's already a string, keep it.
        if (typeof templateData === 'object') {
            templateParam = JSON.stringify(templateData);
        } else {
            templateParam = String(templateData);
        }
    }

    const params = {
        FromEmailAddress: "no-reply@jianshanacademy.cn",
        Destination: [toEmail],
        Template: {
            TemplateID: Number(templateId),
            TemplateData: templateParam,
        },
        Subject: subject || "Notification", // SES Template might override this
    };

    console.log("Sending SES with params:", params);

    try {
        const data = await client.SendEmail(params);
        console.log("SES Success:", data);
        return {
            code: 0,
            data: data,
            message: "Email sent successfully",
        };
    } catch (err) {
        console.error("SES Error:", err);
        return {
            code: -1,
            message: "Failed to send email",
            error: err.toString(),
        };
    }
};
