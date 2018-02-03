#!/bin/bash
#Variables

stackname=$1
aws cloudformation delete-stack --stack-name $stackname
