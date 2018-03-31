#!/bin/bash
#Variables

stackname=$1
netstack=$2
#s3domain=$3
#vpc-b4de0bcf
sid=$(aws cloudformation describe-stacks --stack-name $netstack --query Stacks[0].StackId --output text)
echo "Stack Id: $sid"
vpc=$(aws ec2 describe-vpcs --filter "Name=tag:aws:cloudformation:stack-id,Values=$sid" --query Vpcs[0].VpcId --output text)
echo "VPC Id: $vpc"
subnet1=$(aws ec2 describe-subnets --filter "Name=tag:Name,Values=$netstack-csye6225-ec2-subnet" --query Subnets[0].SubnetId --output text)
echo "Subnet-1: $subnet1"
dbsubnet=$(aws rds describe-db-subnet-groups  --query "DBSubnetGroups[?VpcId=='$vpc'].DBSubnetGroupName"  --output text)
echo "DB Subnet Group Name: $dbsubnet"
sgec2=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$netstack-csye6225-webapp-secuitygroup" --query SecurityGroups[*].GroupId --output text)
echo "EC2 SG: $sgec2"
sgdb=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$netstack-csye6225-db-secuitygroup" --query SecurityGroups[*].GroupId --output text)
echo "DB SG: $sgdb"
iaminstance="EC2ToS3BucketInstanceProfile"
echo "Instance Profile Name: $iaminstance"
domain=$(aws route53 list-hosted-zones --query HostedZones[0].Name --output text)
trimdomain=${domain::-1}
s3domain="web-app.$trimdomain"
echo "S3 Domain: $s3domain"

fnName="lambdaFn"
lambdaArn=$(aws lambda get-function --function-name $fnName --query Configuration.FunctionArn --output text)
echo "lambdaArn: $lambdaArn"

createOutput=$(aws cloudformation create-stack --stack-name $stackname --template-body file://csye6225-cf-application.json --parameters ParameterKey=stackname,ParameterValue=$stackname ParameterKey=dbsubnet,ParameterValue=$dbsubnet ParameterKey=s3domain,ParameterValue=$s3domain ParameterKey=ec2Subnet,ParameterValue=$subnet1 ParameterKey=ec2SecurityGroup,ParameterValue=$sgec2 ParameterKey=dbSecurityGroupId,ParameterValue=$sgdb ParameterKey=iaminstance,ParameterValue=$iaminstance ParameterKey=domainname,ParameterValue=$trimdomain ParameterKey=lambdaArn,ParameterValue=$lambdaArn)


if [ $? -eq 0 ]; then
	echo "Creating stack..."
	aws cloudformation wait stack-create-complete --stack-name $stackname
	echo "Stack created successfully. Stack Id below: "

	echo $createOutput

else
	echo "Error in creation of stack"
	echo $createOutput
fi;