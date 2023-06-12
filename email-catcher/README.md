# LITTIL E-mail catcher

This AWS CDK app contains a stack that receives e-mails through SES, stores them in an S3 bucket and then uses Lambda to extract a password and post that password to a LITTIL Slack channel. This enables testing on without the need for creating an e-mail inbox for each account used for testing.

The Slack webhook used is stored in Secrets Manager and retrieved at runtime by the Lambda function.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
