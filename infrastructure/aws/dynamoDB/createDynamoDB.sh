#Give csye6225_dydb for $1

# Create CloudFormation Stack
echo "Creating CloudFormation Stack"
aws cloudformation create-stack --stack-name $1 --template-body file://./createDynamoDBTemplate.json

aws cloudformation validate-template --template-body file://./createDynamoDBTemplate.json
