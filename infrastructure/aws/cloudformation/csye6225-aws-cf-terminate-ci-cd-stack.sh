#!/bin/bash
#Variables


if [ -z "$1" ]; then
	echo "please provide ci cd stack name"
else
	stackname=$1

	domain=$(aws route53 list-hosted-zones --query HostedZones[0].Name --output text)
	trimdomain=${domain::-1}
	s3domain="code-deploy.$trimdomain"
	#Emptying S3 bucket
	aws s3 rm s3://$s3domain --recursive
	#Removing S3 bucket
	aws s3 rb s3://$s3domain --force
	#To make Travis insensitive
	shopt -s nocasematch
	testseq="Travis"

	username=($(aws iam list-users --query "Users[*].UserName" --output text))
	#echo $username

	for j in  ${username[@]};
	do
			if [[ $j == *"$testseq"* ]];
				then
    			usr=$j
    			echo "username= $usr"
			fi
	done

	#Policy Arn List
	arr=($(aws iam list-policies --scope Local --only-attached --query "Policies[*].Arn" --output text))
	echo $arr
	for i in  ${arr[@]};
	do
			if [[ $i == *"$testseq"* ]];
				then
				policy=$i
				echo "Username = $usr"
				echo "Policy = $policy"
				aws iam detach-user-policy --user-name $usr --policy-arn $policy    			
			fi
	done

	terminateOutput=$(aws cloudformation delete-stack --stack-name $stackname)
	if [ $? -eq 0 ]; then
		echo "Deletion in progress..."
		aws cloudformation wait stack-delete-complete --stack-name $stackname
		echo $terminateOutput
		echo "Deletion of stack successful"
	else
	echo "Deletion failed"
	echo $terminateOutput
	fi;

fi;
