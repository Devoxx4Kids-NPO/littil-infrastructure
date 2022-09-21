# Deploying a new environment

## AWS Account
- Create an AWS Root account
- Create IAM user for cdk bootstrap and a role for deployments:
    - Create a cloudformation stack named "Cdk-Facilities" with `cf-cdk-facilities.yml`
    - Generate an access key for user `LITTIL-<country>-<env>-Cdk` and bootstrap eu-west-1 and us-east-1 (for ACM)
