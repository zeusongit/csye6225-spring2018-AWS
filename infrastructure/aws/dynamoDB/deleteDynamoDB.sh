#Give csye6225dydb for $1

echo "Deleting CloudFormation Stack"
aws cloudformation delete-stack --stack-name $1
