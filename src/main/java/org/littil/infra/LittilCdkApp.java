package org.littil.infra;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Environment;
import software.amazon.awscdk.StackProps;

public class LittilCdkApp {

    public static void main(final String[] args) {
        final var app = new App();

        new LittilFrontEndStack(app, "TestStack", StackProps.builder()
            .env(Environment.builder()
                     .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
                     .region(System.getenv("CDK_DEFAULT_REGION"))
                     .build())
            .build());

        app.synth();
    }
}

