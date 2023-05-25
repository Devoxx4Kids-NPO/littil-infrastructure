/**
 * This file uses AWS SDK V3+. Switch out forward_function_slack.js for this one when upgrading to a newer version of
 * Node. The newer Node images include the SDK v3 whereas older images will provide V2.
 */

const {S3Client, GetObjectCommand} = require("@aws-sdk/client-s3");
const {SecretsManagerClient, GetSecretValueCommand} = require("@aws-sdk/secrets-manager");
const https = require('https');

const bucketName = process.env.MailS3Bucket;
const objectPrefix = process.env.MailS3Prefix;

const getWebhookPath = () => {
    const secretsManager = new SecretsManagerClient();
    const secretName = 'littil/automation/incomingEmailsSlack';
    return secretsManager.send(
        new GetSecretValueCommand({
            SecretId: secretName,
        }))
        .then((output) => {
            const secret = output.SecretString;
            console.log(JSON.parse(secret).testKey);
            return JSON.parse(data).incomingEmailsWebhook;
        });
}

const getEmail = (msgInfo) => {
    const s3 = new S3Client();
    return s3.send(
        new GetObjectCommand({
            Bucket: bucketName,
            Key: objectPrefix + msgInfo.mail.messageId
        })
    )
        .then((getObjectOutput) => {
            return getObjectOutput.Body;
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

    const req = https
        .request(options, res => {
            console.log(`statusCode: ${res.statusCode}`);

            res.on('data', d => {
                process.stdout.write(d)
            });
        });

    req.on('error', error => {
        console.error(error);
    });

    req.write(payload);
    req.end();
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
            console.log('Source email');
            console.log(emailBody);

            let headers = "*" + msgInfo.mail.commonHeaders.subject + "*\r\n"
                + "Reply-To: " + msgInfo.mail.commonHeaders.from[0] + "\r\n"
                + "X-Original-To: " + msgInfo.mail.commonHeaders.to[0] + "\r\n";

            if (emailBody) {
                var res;
                res = emailBody.match(/Content-Type:.+\s*boundary.*/);
                if (res) {
                    headers += res[0] + "\r\n";
                } else {
                    res = emailBody.match(/^Content-Type:(.*)/m);
                    if (res) {
                        headers += res[0] + "\r\n";
                    }
                }

                res = emailBody.match(/^Content-Transfer-Encoding:(.*)/m);
                if (res) {
                    headers += res[0] + "\r\n";
                }

                res = emailBody.match(/^MIME-Version:(.*)/m);
                if (res) {
                    headers += res[0] + "\r\n";
                }

                var splitEmail = emailBody.split("\r\n\r\n");
                splitEmail.shift();

                emailBody = headers + "\r\n" + splitEmail.join("\r\n\r\n");
            } else {
                emailBody = headers + "\r\n" + "Empty email";
            }

            return getWebhookPath()
                .then((webhookPath) => postToSlack(emailBody, webhookPath));
        })
        .catch((err) => context.fail(err));
};
