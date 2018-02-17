#!/bin/bash
#Variables

if [ -z "$1" ]; then
	echo "please provide a stack name"
else
	stackname=$1

	EC2_ID=$(aws ec2 describe-instances \
	    --query "Reservations[].Instances[].InstanceId[]" \
	    --filters "Name=tag-key,Values=aws:cloudformation:stack-name" "Name=tag-value,Values=$stackname" "Name=instance-state-code,Values=16" \
	    --output=text 2>&1)
	EC2_ID_STATUS=$?
	echo "ec2id:$EC2_ID"
	if [ $EC2_ID_STATUS -eq 0 ]; then
		echo "Deletion in progress..."
		aws ec2 modify-instance-attribute --instance-id $EC2_ID --no-disable-api-termination
		terminateOutput=$(aws cloudformation delete-stack --stack-name $stackname)
		EC2_TERMINATE_STATUS=$?
		aws cloudformation wait stack-delete-complete --stack-name $stackname
		if [ $EC2_TERMINATE_STATUS -eq 0 ]; then
			echo "Deletion of stack successful"
		else
			echo "Cannot terminate ec2: $EC2_ID"
			echo " $terminateOutput "
			echo " deletion of stack not possible "
		fi;
	else
	echo "Cannot find EC2 instance for stack: $stackname"
	#echo $terminateOutput
	fi;

fi;
