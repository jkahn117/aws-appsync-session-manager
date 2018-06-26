MY_EMAIL ?= me@example.com

AWS_BUCKET_NAME ?= jkahn-appsync-session-manager
AWS_STACK_NAME ?= appsync-session-manager
AWS_REGION ?= us-east-2

SAM_TEMPLATE = template.yaml
SAM_PACKAGED_TEMPLATE = packaged.yaml

SCHEMA_SEARCH = DefinitionS3Location: s3:\/\/INSERT_LOCATION
SCHEMA_REPLACE = DefinitionS3Location: s3:\/\/$(AWS_BUCKET_NAME)

SCHEMA := $(shell cat schema.graphql)

create-bucket:
	@ aws s3api create-bucket \
	      --bucket $(AWS_BUCKET_NAME) \
	      --region $(AWS_REGION) \
	      --create-bucket-configuration LocationConstraint=$(AWS_REGION)

setup:
	@ cd stream && npm install
	@ cd ..
	@ sed -i '.bak' 's/$(SCHEMA_SEARCH)/$(SCHEMA_REPLACE)/g' template.example.yaml
	@ mv template.example.yaml template.yaml

upload-schema:
	@ aws s3 cp \
	      schema.graphql \
	      s3://$(AWS_BUCKET_NAME)/schema.graphql

package:
	@ aws cloudformation package \
	      --template-file $(SAM_TEMPLATE) \
	      --s3-bucket $(AWS_BUCKET_NAME) \
	      --region $(AWS_REGION) \
	      --output-template-file $(SAM_PACKAGED_TEMPLATE)

deploy:
	@ make package
	@ make upload-schema
	@ aws cloudformation deploy \
	      --template-file $(SAM_PACKAGED_TEMPLATE) \
	      --region $(AWS_REGION) \
	      --capabilities CAPABILITY_NAMED_IAM \
	      --stack-name $(AWS_STACK_NAME) \
	      --force-upload

describe:
	@ aws cloudformation describe-stacks \
	      --region $(AWS_REGION) \
	      --stack-name $(AWS_STACK_NAME)

outputs:
	@ make describe \
	      | jq -r '.Stacks[0].Outputs'

cleanup:
	@ aws cloudformation delete-stack \
	      --stack-name $(AWS_STACK_NAME)

## Loads sample session data to the DynamoDB table
load-session-data:
	@ node setup/setup.js


## Helper functions to create a Session Manager user and editor in Cognito
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

