MY_EMAIL ?= me@example.com

AWS_BUCKET_NAME ?= jkahn-appsync-session-manager
AWS_STACK_NAME ?= appsync-session-manager
AWS_REGION ?= us-east-2

SAM_TEMPLATE = template.yaml
SAM_PACKAGED_TEMPLATE = packaged.yaml

.PHONY: create-bucket
create-bucket:
	@ aws s3api create-bucket \
	      --bucket $(AWS_BUCKET_NAME) \
	      --region $(AWS_REGION) \
	      --create-bucket-configuration LocationConstraint=$(AWS_REGION)

.PHONY: configure
configure:
	@ cd stream && npm install
	@ cd ..

.PHONY: package
package:
	@ sam package \
	      --template-file $(SAM_TEMPLATE) \
	      --s3-bucket $(AWS_BUCKET_NAME) \
	      --region $(AWS_REGION) \
	      --output-template-file $(SAM_PACKAGED_TEMPLATE)

.PHONY: deploy
deploy:
	@ make package
	@ sam deploy \
	      --template-file $(SAM_PACKAGED_TEMPLATE) \
	      --region $(AWS_REGION) \
	      --capabilities CAPABILITY_NAMED_IAM \
	      --stack-name $(AWS_STACK_NAME) \
	      --force-upload

.PHONY: describe
describe:
	@ aws cloudformation describe-stacks \
	      --region $(AWS_REGION) \
	      --stack-name $(AWS_STACK_NAME)

.PHONY: outputs
outputs:
	@ make describe \
	      | jq -r '.Stacks[0].Outputs'

.PHONY: cleanup
cleanup:
	@ aws cloudformation delete-stack \
	      --stack-name $(AWS_STACK_NAME)

## Loads sample session data to the DynamoDB table
.PHONY: load-session-data
load-session-data:
	@ node setup/setup.js


## Helper functions to create a Session Manager user and editor in Cognito
.PHONY: create-user
create-user:
	@ aws cognito-idp sign-up \
	      --region $(AWS_REGION) \
	      --client-id $(shell make outputs | jq '.[] | select(.OutputKey=="CognitoClientId") | .OutputValue') \
	      --username user --password NewPassword1% \
	      --user-attributes Name=email,Value=$(MY_EMAIL) Name=name,Value=user

	@ aws cognito-idp admin-confirm-sign-up \
	      --region $(AWS_REGION) \
	      --user-pool-id $(shell make outputs | jq '.[] | select(.OutputKey=="CognitoUserPoolId") | .OutputValue') \
	      --username user

.PHONY: create-editor
create-editor:
	@ aws cognito-idp sign-up \
	      --region $(AWS_REGION) \
	      --client-id $(shell make outputs | jq '.[] | select(.OutputKey=="CognitoClientId") | .OutputValue') \
	      --username editor --password NewPassword1% \
	      --user-attributes Name=email,Value=$(MY_EMAIL) Name=name,Value=editor

	@ aws cognito-idp admin-confirm-sign-up \
	      --region $(AWS_REGION) \
	      --user-pool-id $(shell make outputs | jq '.[] | select(.OutputKey=="CognitoUserPoolId") | .OutputValue') \
	      --username editor

	@ aws cognito-idp admin-add-user-to-group \
	      --region $(AWS_REGION) \
	      --user-pool-id $(shell make outputs | jq '.[] | select(.OutputKey=="CognitoUserPoolId") | .OutputValue') \
	      --group-name Editors \
	      --username editor

