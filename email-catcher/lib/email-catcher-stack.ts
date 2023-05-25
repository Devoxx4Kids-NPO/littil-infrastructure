import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Effect, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { ReceiptRuleSet } from 'aws-cdk-lib/aws-ses';
import { Lambda, S3 } from 'aws-cdk-lib/aws-ses-actions';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';

export class EmailCatcherStack extends Stack {
    constructor(scope: Construct,
                id: string,
                props: StackProps) {
        super(scope, id, props);

        const emailReceivingDomain = 'dev.littil.org';
        const s3BucketEmailObjectPrefix = 'emails/' + emailReceivingDomain;
        const s3BucketName = 'littil-nl-email-incoming';

        const emailReceivingBucket = this.createS3BucketForReceivingEmailsFromSes(s3BucketName, s3BucketEmailObjectPrefix);
        const emailToSlackAction = this.createLambdaFunctionForReadingMailFromS3(emailReceivingBucket, s3BucketEmailObjectPrefix);

        const receiptRules = [
            {
                recipients: [
                    emailReceivingDomain,
                ],
                actions: [
                    /* Store incoming e-mail in S3 bucket. */
                    new S3({
                        bucket: emailReceivingBucket,
                        objectKeyPrefix: s3BucketEmailObjectPrefix,
                    }),
                    /* Invoke lambda function which can retrieve the e-mail from S3. */
                    new Lambda({
                        function: emailToSlackAction,
                    }),
                ],
            },
        ];

        new ReceiptRuleSet(this, 'LITTIL-NL-Dev-Incoming-Ruleset', {
            rules: receiptRules,
        });
    }

    private createLambdaFunctionForReadingMailFromS3(emailReceivingBucket: Bucket,
                                                     s3BucketEmailObjectPrefix: string) {
        const lambdaRole = new Role(this, 'ForwardEmailToSlackLambdaRole',
            {
                assumedBy: new ServicePrincipal('lambda.amazonaws.com')
            });

        const logStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'logs:CreateLogStream',
                'logs:CreateLogGroup',
                'logs:PutLogEvents',
            ],
            resources: [
                '*',
            ],
        });

        const decryptSecretStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'kms:Decrypt',
                'secretsmanager:GetSecretValue'
            ],
            resources: [
                '*',
            ],
        });

        const readBucketStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                's3:GetObject',
            ],
            resources: [
                emailReceivingBucket.bucketArn + '/*',
            ],
        });

        const lambdaPolicy = new Policy(this, 'LambdaToSlackPolicy');
        lambdaPolicy.addStatements(logStatement, readBucketStatement, decryptSecretStatement);
        lambdaPolicy.attachToRole(lambdaRole);

        /* Lambda setup. */
        const lambdaFunctionCode = readFileSync('./functions/forward_function_slack.js', 'utf-8');

        const emailToSlackAction = new Function(this, 'EmailForwardToSlackLambda', {
            // TODO: Update image to a newer version of node, needs to be done together with switching out forward_function_slack.js for forward_function_slack_v3.js
            runtime: Runtime.NODEJS_14_X,
            handler: 'index.handler',
            code: Code.fromInline(lambdaFunctionCode),
            role: lambdaRole,
            timeout: Duration.seconds(30),
            environment: {
                'MailS3Bucket': emailReceivingBucket.bucketName,
                'MailS3Prefix': s3BucketEmailObjectPrefix,
            },
        });
        return emailToSlackAction;
    }

    private createS3BucketForReceivingEmailsFromSes(s3BucketName: string,
                                                    s3BucketEmailObjectPrefix: string) {
        const emailReceivingBucket = new Bucket(this, 'incoming-emails-bucket', {
            bucketName: s3BucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        emailReceivingBucket.addToResourcePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [
                new ServicePrincipal('ses.amazonaws.com'),
            ],
            actions: [
                's3:PutObject',
            ],
            resources: [
                emailReceivingBucket.bucketArn + '/' + s3BucketEmailObjectPrefix + '*',
            ],
            conditions: {
                'StringEquals': {
                    'aws:Referer': this.account,
                },
            },
        }));

        return emailReceivingBucket;
    }
}
