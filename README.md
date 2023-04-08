# Deploying a new environment

## AWS Account CDK bootstrap
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

## Auth0 environment
- Create a tenant for the new environment (staging or prod)
- Create roles

## AWS Account configuration
- In Secrets manager, create the following secrets (where environment is `staging` or `prod`)
  - `littil/backend/<environment>/oicd`: Secret type "Other type of secret"
    - Values:
      - oidcClientId
      - oidcClientSecret
      - oidcTenant
      - m2mClientId
      - m2mClientSecret
  - `littil/backend/<environment>/smtp`: Secret type "Other type of secret"
    - Values:
      - smtpHost
      - smtpUsername
      - smtpPassword
  - `littil/backend/<environment>/databaseCredentials`: Secret type Credentials for Amazon RDS
