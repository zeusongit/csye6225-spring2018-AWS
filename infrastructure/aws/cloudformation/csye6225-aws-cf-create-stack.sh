#!/bin/bash
#Variables

stackname=$1
aws cloudformation create-stack --stack-name $stackname --template-body file://template.json --parameters ParameterKey=stackname,ParameterValue=$stackname
