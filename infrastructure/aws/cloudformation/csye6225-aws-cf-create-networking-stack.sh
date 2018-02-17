#!/bin/bash
#Variables

stackname=$1
createOutput=$(aws cloudformation create-stack --stack-name $stackname --template-body file://csye6225-cf-networking.json --parameters ParameterKey=stackname,ParameterValue=$stackname)

if [ $? -eq 0 ]; then
	echo "Creating stack..."
	aws cloudformation wait stack-create-complete --stack-name $stackname
	echo "Stack created successfully. Stack Id below: "

	echo $createOutput

else
	echo "Error in creation of stack"
	echo $createOutput
fi;
