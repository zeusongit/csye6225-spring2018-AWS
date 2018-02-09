#!/bin/bash
#Variables

if [ -z "$1" ]; then
	echo "please provide a stack name"
else
	stackname=$1

	EC2_ID=$(aws ec2 describe-instances --filter "Name=tag:StackName,Values=$stackname" --query 'Reservations[*].Instances[*].{id:InstanceId}' --output text)
	echo "ec2id--> $EC2_ID"
	#aws ec2 modify-instance-attribute --instance-id $EC2_ID --no-disable-api-termination
	#terminateOutput=$(aws cloudformation delete-stack --stack-name $stackname)
	if [ $? -eq 0 ]; then
		echo "Deletion in progress..."
		#aws cloudformation wait stack-delete-complete --stack-name $stackname
		#echo $terminateOutput
		echo "Deletion of stack successful"
	else
	echo "Deletion failed"
	#echo $terminateOutput
	fi;

fi;
