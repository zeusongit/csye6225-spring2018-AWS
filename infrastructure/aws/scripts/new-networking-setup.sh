#!/bin/bash
#Variables


region="us-east-1"
vpcName="$1-csye6225-vpc-1"
internetGatewayName="$1-csye6225-InternetGateway-1"
vpc_cidr="10.0.0.0/16"
routeTableName="$1-csye6225-public-route-table"


#Create VPC

VPC_ID="$(aws ec2 create-vpc \
  --cidr-block $vpc_cidr \
  --query 'Vpc.{VpcId:VpcId}' \
  --output text \
  --region $region 2>&1)"

VPC_CREATE_STATUS=$?
echo  "VPC : "
echo $VPC_CREATE_STATUS

if [ $VPC_CREATE_STATUS -eq 0 ]; then
  echo " VPC ID '$VPC_ID' CREATED in '$region' region."
  aws ec2 create-tags --resources $VPC_ID --tags "Key=Name,Value=$vpcName" --region $region
  VPC_RENAME_STATUS=$?
  if [ $VPC_RENAME_STATUS -eq 0 ]; then
    echo " VPC ID '$VPC_ID' NAMED as '$vpcName'. "
  else
    echo " VPC RENAME FAILED due to: "
    echo " $VPC_RENAME_STATUS "
    exit VPC_RENAME_STATUS
  fi
else
  echo " VPC CREATION FALIED due to: "
  echo " $VPC_ID "
  exit $VPC_CREATE_STATUS
fi
