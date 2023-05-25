import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as EmailCatcher from '../lib/email-catcher-stack';

test('E-mail forwarding resources created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new EmailCatcher.EmailCatcherStack(app, 'MyTestStack', {});
    // THEN
    const template = Template.fromStack(stack);

    template
        .hasResourceProperties('AWS::SES::ReceiptRuleSet', {});

    template
        .hasResourceProperties('AWS::S3::Bucket', {});

    template
        .hasResourceProperties('AWS::Lambda::Function', {
            Environment: Match.objectLike({
                Variables: {
                    MailS3Bucket: Match.objectLike({}),
                    MailS3Prefix: 'emails/dev.littil.org',
                }
            }),
            Runtime: 'nodejs14.x',
        });
});
