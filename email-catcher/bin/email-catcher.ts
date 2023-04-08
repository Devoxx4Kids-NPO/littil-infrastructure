#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EmailCatcherStack } from '../lib/email-catcher-stack';

const app = new cdk.App();
new EmailCatcherStack(app, 'EmailCatcherStack', {
    env: {
        region: 'eu-west-1',
    }
});
