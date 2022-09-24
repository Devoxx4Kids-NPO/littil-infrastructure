# Deploying a new environment

## AWS Account
- Create an AWS Root account
- Bootstrap the CDK in the AWS account for required regions:
    - Create a cloudformation stack named "Cdk-Bootstrap" with `cf-cdk-bootstrap.yml`
    - Generate an access key for user `LITTIL-<country>-<env>-Cdk`
      - Put the access key and secret access key in `~/.aws/credentials` under `[littil-<env>-bootstrap]`
    - Bootstrap regions (eu-west-1 for resources and us-east-1 for ACM)
      - Run `cdk bootstrap aws://<AWS-ACCOUNT-ID>/<REGION> --profile littil-<ENV>-bootstrap --verbose --debug` (either using the AWS CLI or by installing the CDK globally using `npm i -g aws-cdk-lib` and using npx to call the cdk)
      - e.g. `cdk bootstrap aws://123456/eu-west --profile littil-acc-bootstrap --verbose --debug`
- Create a role per repository to allow CDK deployments
  - Create a cloudformation stack named "Cdk-<Github-repo-name>" per Github repository with `cf-cdk-github-repository.yml`
