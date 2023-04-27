## Cloud setup

The LITTIL platform allows deployment into the AWS public cloud platform. To set up a new LITTIL organisation's infrastructure:
- Create an AWS account, this will be the "master" or "billing" account. Credits or credit card information will be linked to this account, and thus this account will pay for any infrastructure.
- Within the master account:
  - Create an AWS organisation within this account.
  - Within this organisation, create a staging and a production account. These accounts will not have any payment methods. Costs will be propagated to the master account.
  - Enable the Identity Center
    - Create accounts for any users (administrators, developers, etc)
- For all root accounts (master, staging & prod):
  - Enable MFA. Preferably register multiple people's authenticator devices to up the bus-factor.
  - Don't log into these accounts again directly after creating the first administrator account in Identity center. If a root account is taken over, it is lost, and the new owner can launch expensive infrastructure or applications at LITTIL's cost. So the root account's credentials (password & MFA) should only be used in emergencies (to delete compromised Identity Center users).

Configure the following for all root accounts

## Deploying a new environment

### AWS Account CDK bootstrap
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

### Auth0 environment
- Create a tenant for the new environment (staging or prod)
- Create roles

### AWS Account configuration
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

## Developer access
To grant individual developers access to for example logs, policies can be set up in Identity Center in the master account.
These policies can be attached to groups and/or users for specific accounts (staging or prod).
