This repository contains cloudformation templates and CDK apps for bootstrapping a LITTIL cloud environment in AWS and for any infrastructure resources that are not part of a specific application.

For general information about LITTIL infrastructure and onboarding information, check out the LITTIL [documentation site](https://devoxx4kids-npo.github.io/littil-documentation/platform/infrastructure/).

## Cloud setup

Note: AWS Organizations could be used to automate this process further but is not described here since it was not used for LITTIL NL.

The LITTIL platform allows deployment into the AWS public cloud platform. To set up a new LITTIL organisation's infrastructure:
- Create an AWS account, this will be the "master" or "billing" account. Credits or credit card information will be linked to this account, and thus this account will pay for any infrastructure.
- Within the master account:
  - Create an AWS organisation within this account.
  - Within this organisation, create a staging and a production account. These accounts will not have any payment methods. Costs will be propagated to the master account.
  - Enable the Identity Center
    - Create accounts for any users (administrators, developers, etc)
- For all root accounts (master, staging & production):
  - Enable MFA. Preferably register multiple people's authenticator devices to up the bus-factor.
  - Don't log into these accounts again directly after creating the first administrator account in Identity center. If a root account is taken over, it is lost, and the new owner can launch expensive infrastructure or applications at LITTIL's cost. So the root account's credentials (password & MFA) should only be used in emergencies (to delete compromised Identity Center users).

Configure the following for all root accounts

## Deploying a new environment

### AWS Account CDK bootstrap
- Create an AWS Root account
- Bootstrap the CDK in the AWS account for required regions:
    - Create a cloudformation stack named "Cdk-Bootstrap" with `cf-cdk-bootstrap.yml` in region `eu-west-1`
    - Generate an access key for user `LITTIL-<country>-<account-name>-Cdk`
      - Put the access key and secret access key in `~/.aws/credentials` under `[littil-<country>-<account-name>-bootstrap]`
    - Bootstrap regions
      - Run `cdk bootstrap aws://<AWS-ACCOUNT-ID>/<REGION> --profile littil-<country>-<account-name>-bootstrap --verbose --debug` (either using the AWS CLI or by installing the CDK globally using `npm i -g aws-cdk-lib` and using npx to call the cdk)
        - Once in eu-west-1 (resources)
        - Once in us-east-1 (for ACM / Cloudfront certificates)
      - e.g. `cdk bootstrap aws://123456/eu-west-1 --profile littil-nl-shared-bootstrap --verbose --debug`
- Delete the "Cdk-Bootstrap" Cloudformation stack (and your now-obsolete local bootstrap credentials profile).
- Create a role per repository to allow CDK deployments
  - Create a cloudformation stack named "Github-<Github-repo-name>-CDK" per application Github repository (e.g. frontend and backend) with `cf-github-repository-cdk.yml`
    - This will create a role which the Github repository can assume that can be used to perform CDK actions
  - For the shared account, create a cloudformation stack named "Github-<Github-repo-name>-ECR" per application Github repository with `cf-github-repository-ecr.yml`
    - This will create a role which the Github repository can assume that can be used to push images to ECR

### Auth0 environment
- Create a tenant for the new environment (staging or prod)
- Create roles

### AWS Account configuration
- In Secrets manager, create the following secrets (where environment is `staging` or `production`)
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

## Developer access
To grant individual developers access to for example logs, policies can be set up in Identity Center in the master account.
These policies can be attached to groups and/or users for specific accounts (staging or production).
