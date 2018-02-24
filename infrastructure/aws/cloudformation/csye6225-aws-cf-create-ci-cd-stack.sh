#!/bin/bash
#Variables

stackname=$1
<<<<<<< HEAD
#domain=$(aws route53 list-hosted-zones --query HostedZones[0].Name --output text)
#s3domain="web-app.$s3domain"
s3domain="code-deploy.csye6225-spring2018-aggarwalash.me"
echo "S3 Domain Name: $s3domain"

createOutput=$(aws cloudformation create-stack --stack-name $stackname --capabilities CAPABILITY_NAMED_IAM --template-body file://csye6225-cf-ci-cd.json --parameters ParameterKey=s3domain,ParameterValue=$s3domain)
=======

domain=$(aws route53 list-hosted-zones --query HostedZones[0].Name --output text)
trimdomain=${domain::-1}
s3domain="code-deploy.$trimdomain"
echo "S3 Domain: $s3domain"
appname="csye6225CodeDeployApplication"
echo $appname
depname="csye6225CodeDeployApplication-depgroup"
echo $depname
accid=929262208135
echo "AccountId: $accid"


createOutput=$(aws cloudformation create-stack --stack-name $stackname --capabilities CAPABILITY_NAMED_IAM --template-body file://csye6225-cf-ci-cd.json --parameters ParameterKey=s3domain,ParameterValue=$s3domain  ParameterKey=appname,ParameterValue=$appname ParameterKey=depname,ParameterValue=$depname ParameterKey=accid,ParameterValue=$accid)
>>>>>>> 377973ee3d90e0bdedc134c90b9df0e2edb729ce


if [ $? -eq 0 ]; then
	echo "Creating stack..."
	aws cloudformation wait stack-create-complete --stack-name $stackname
	echo "Stack created successfully. Stack Id below: "

	echo $createOutput

else
	echo "Error in creation of stack"
	echo $createOutput
fi;
