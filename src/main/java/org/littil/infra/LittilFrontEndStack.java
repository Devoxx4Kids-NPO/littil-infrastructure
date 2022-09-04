package org.littil.infra;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.constructs.Construct;

public class LittilFrontEndStack extends Stack {

    public LittilFrontEndStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public LittilFrontEndStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);
    }
}
