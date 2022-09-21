# Deploying a new environment

## AWS Account
- Create an AWS Root account
- Bootstrap the CDK in the AWS account for required regions:
    - Create a cloudformation stack named "Cdk-Bootstrap" with `cf-cdk-bootstrap.yml`
    - Generate an access key for user `LITTIL-<country>-<env>-Cdk`
    - Bootstrap regions (eu-west-1 for resources and us-east-1 for ACM)
- Create a role per repository to allow CDK deployments
  - Create a cloudformation stack named "Cdk-<Github-repo-name>" per Github repository with `cf-cdk-github-repository.yml`
