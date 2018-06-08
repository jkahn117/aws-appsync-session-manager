AWS_BUCKET_NAME ?= jkahn-appsync-session-manager
AWS_STACK_NAME ?= appsync-session-manager
AWS_REGION ?= us-east-2

SAM_TEMPLATE = template.yaml
SAM_PACKAGED_TEMPLATE = packaged.yaml

SCHEMA_SEARCH = DefinitionS3Location: INSERT_LOCATION
SCHEMA_REPLACE = DefinitionS3Location: s3:\/\/$(AWS_BUCKET_NAME)\/schema.graphql

SCHEMA := $(shell cat schema.graphql)

create-bucket:
	@ aws s3api create-bucket \
	      --bucket $(AWS_BUCKET_NAME) \
				--region $(AWS_REGION) \
				--create-bucket-configuration LocationConstraint=$(AWS_REGION)

configure:
	@ sed -i '.bak' 's/$(SCHEMA_SEARCH)/$(SCHEMA_REPLACE)/g' template.yaml

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
	@ rm $(SAM_PACKAGED_TEMPLATE)

setup:
	@ node setup/setup.js



# add setup of DDB data, cognito?
