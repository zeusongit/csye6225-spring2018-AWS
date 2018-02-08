#!/bin/bash
#Variables


if [ $# -eq 0 ]; then
echo "PLEASE PASS <STACK_NAME> as parameter while running your script"
exit 1
fi

region="us-east-1"
vpcName="$1-csye6225-vpc-1"
internetGatewayName="$1-csye6225-InternetGateway-1"
vpc_cidr="10.0.0.0/16"
routeTableName="$1-csye6225-public-route-table"

#Create VPC

VPC_ID=$(aws ec2 create-vpc \
  --cidr-block $vpc_cidr \
  --query 'Vpc.{VpcId:VpcId}' \
  --output text \
  --region $region 2>&1)
VPC_CREATE_STATUS=$?
if [ $VPC_CREATE_STATUS -eq 0 ]; then
  echo " VPC ID '$VPC_ID' CREATED in '$region' region."
else
	echo "Error:VPC not created!!"
  echo " $VPC_ID "
	exit $VPC_CREATE_STATUS
fi

#add name to vpc
VPC_RENAME=$(aws ec2 create-tags \
  --resources $VPC_ID \
  --tags "Key=Name,Value=$vpcName" \
  --region $region 2>&1)
VPC_RENAME_STATUS=$?
if [ $VPC_RENAME_STATUS -eq 0 ]; then
  echo "  VPC ID '$VPC_ID' NAMED as '$vpcName'."
else
    echo "Error:VPC name not added!!"
    echo " $VPC_RENAME "
    exit $VPC_RENAME_STATUS
fi

# Create Internet gateway
echo "Creating Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
  --query 'InternetGateway.{InternetGatewayId:InternetGatewayId}' \
  --output text \
  --region $region 2>&1)
IGW_CREATE_STATUS=$?
if [ $IGW_CREATE_STATUS -eq 0 ]; then
  echo "  Internet Gateway ID '$IGW_ID' CREATED."
else
    echo "Error:Gateway not created"
    echo " $IGW_ID "
    exit $IGW_CREATE_STATUS
fi

#add name to internet gateway
IGW_RENAME=$(aws ec2 create-tags \
  --resources $IGW_ID \
  --tags "Key=Name,Value=$internetGatewayName" 2>&1)
IGW_RENAME_STATUS=$?
if [ $IGW_RENAME_STATUS -eq 0 ]; then
  echo "  Internet gateway ID '$IGW_ID' NAMED as '$internetGatewayName'."
else
    echo "Error:internetGatewayName name not added!!"
    echo " $IGW_RENAME "
    exit $IGW_RENAME_STATUS
fi

# Attach Internet gateway to your VPC
IGW_ATTACH=$(aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID \
  --region $region 2>&1)
IGW_ATTACH_STATUS=$?
if [ $IGW_ATTACH_STATUS -eq 0 ]; then
  echo "  Internet Gateway ID '$IGW_ID' ATTACHED to VPC ID '$VPC_ID'."
else
    echo "Error:Gateway not attached to VPC: $?"
    echo " $IGW_ATTACH "
    exit $IGW_ATTACH_STATUS
fi

# Create Route Table
echo "Creating Route Table..."
ROUTE_TABLE_ID=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --query 'RouteTable.{RouteTableId:RouteTableId}' \
  --output text \
  --region $region 2>&1)
  ROUTE_TABLE_CREATE_STATUS=$?
if [ $ROUTE_TABLE_CREATE_STATUS -eq 0 ]; then
  echo "  Route Table ID '$ROUTE_TABLE_ID' CREATED."
else
    echo "Error:Route table not created!!"
    echo " $ROUTE_TABLE_ID "
    exit $ROUTE_TABLE_CREATE_STATUS
fi

#add name to Route Table
ROUTE_TABLE_RENAME=$(aws ec2 create-tags \
  --resources $ROUTE_TABLE_ID \
  --tags "Key=Name,Value=$routeTableName" 2>&1)
ROUTE_TABLE_RENAME_STATUS=$?
if [ $ROUTE_TABLE_RENAME_STATUS -eq 0 ]; then
  echo "  Route table ID '$ROUTE_TABLE_ID' NAMED as '$routeTableName'."
else
    echo "Error:ROUTE_TABLE name not added!!"
    echo " $ROUTE_TABLE_RENAME "
    exit $ROUTE_TABLE_RENAME_STATUS
fi

#Create route to Internet Gateway
RESULT=$(aws ec2 create-route \
  --route-table-id $ROUTE_TABLE_ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID \
  --region $region 2>&1)
RESULT_STATUS=$?
if [ $RESULT_STATUS -eq 0 ]; then
  echo "  Route to '0.0.0.0/0' via Internet Gateway ID '$IGW_ID' ADDED to Route Table ID '$ROUTE_TABLE_ID'."
else
    echo "Error:Route to Internet gateway not created!!"
    echo " $RESULT "
    exit $RESULT_STATUS
fi
