const AWS = require('aws-sdk');

const https = require('https');

const bucketName = process.env.MailS3Bucket;
const objectPrefix = process.env.MailS3Prefix;

const getWebhookPath = () => {
    const secretsManager = new AWS.SecretsManager();
    const secretName = 'littil/automation/incomingEmailsSlack';
    console.log('Going to read ' + secretName);
    return new Promise((resolve, reject) => {
        secretsManager.getSecretValue({
            SecretId: secretName,
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data.SecretString).incomingEmailsWebhook);
            }
        });
    });
}

const getEmail = (msgInfo) => {
    const s3 = new AWS.S3();
    console.log('Going to retrieve ' + objectPrefix + msgInfo.mail.messageId + ' from ' + bucketName);
    return new Promise((resolve, reject) => {
        s3.getObject({
            Bucket: bucketName,
            Key: objectPrefix + '/' + msgInfo.mail.messageId
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

const postToSlack = (text,
                     webHookUrl) => {
    const payload = JSON.stringify({
        username: 'LITTIL e-mail robot',
        text,
        icon_emoji: ':robot_face:'
    });

    const options = {
        hostname: 'hooks.slack.com',
        port: 443,
        path: webHookUrl,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    }

    return new Promise((resolve, reject) => {
        const req = https
            .request(options, res => {
                console.log(`statusCode: ${res.statusCode}`);

                res
                    .on('data', d => {
                        resolve(d);
                    });
            });

        req.on('error', error => {
            reject(error);
        });

        req.write(payload);
        req.end();
    });
};

exports.handler = function (event, context) {
    const msgInfo = event.Records[0].ses;

    if (msgInfo.receipt.spamVerdict.status === 'FAIL'
        || msgInfo.receipt.virusVerdict.status === 'FAIL') {
        console.log('Message is spam or contains virus, ignoring.');
        context.succeed();
        return;
    }

    return getEmail(msgInfo)
        .then((email) => {
            var emailBody = email.Body.toString('utf-8');

            const sender = msgInfo.mail.commonHeaders.from[0];
            const recipient = msgInfo.mail.commonHeaders.to[0];

            const passwordRegex = new RegExp('Uw wachtwoord\\:\\s+(.+)', 'i');
            const passwordResult = passwordRegex.exec(emailBody);
            const message = 'From: ' + sender + '\n' +
                'To: ' + recipient + '\n'
                + 'Wachtwoord: ' + (
                    passwordResult
                        ? passwordResult[1]
                        : 'Niet gevonden'
                );

            return getWebhookPath()
                .then((webhookPath) => postToSlack(message, webhookPath));
        })
        .catch((err) => context.fail(err));
};
