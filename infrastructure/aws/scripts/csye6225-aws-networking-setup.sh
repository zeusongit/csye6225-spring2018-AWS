#!/bin/bash
#Variables

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
  --region $region)
if [ $? -eq 0 ]; then
  echo " VPC ID '$VPC_ID' CREATED in '$region' region."
else
	echo "Error:VPC not created!!"
	exit $?
fi

#add name to vpc
aws ec2 create-tags \
  --resources $VPC_ID \
  --tags "Key=Name,Value=$vpcName" \
  --region $region
if [ $? -eq 0 ]; then
  echo "  VPC ID '$VPC_ID' NAMED as '$vpcName'."
else
    echo "Error:VPC name not added!!"
    exit $?
fi

# Create Internet gateway
echo "Creating Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
  --query 'InternetGateway.{InternetGatewayId:InternetGatewayId}' \
  --output text \
  --region $region)
if [ $? -eq 0 ]; then
  echo "  Internet Gateway ID '$IGW_ID' CREATED."
else
    echo "Error:Gateway not created"
    exit $?
fi

#add name to internet gateway
aws ec2 create-tags \
  --resources $IGW_ID \
  --tags "Key=Name,Value=$internetGatewayName"
if [ $? -eq 0 ]; then
  echo "  Internet gateway ID '$IGW_ID' NAMED as '$internetGatewayName'."
else
    echo "Error:internetGatewayName name not added!!"
    exit $?
fi

# Attach Internet gateway to your VPC
aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID \
  --region $region
if [ $? -eq 0 ]; then
  echo "  Internet Gateway ID '$IGW_ID' ATTACHED to VPC ID '$VPC_ID'."
else
    echo "Error:Gateway not attached to VPC: $?"
    exit $?
fi

# Create Route Table
echo "Creating Route Table..."
ROUTE_TABLE_ID=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --query 'RouteTable.{RouteTableId:RouteTableId}' \
  --output text \
  --region $region)
if [ $? -eq 0 ]; then
  echo "  Route Table ID '$ROUTE_TABLE_ID' CREATED."
else
    echo "Error:Route table not created!!"
    exit $?
fi

#add name to Route Table
aws ec2 create-tags \
  --resources $ROUTE_TABLE_ID \
  --tags "Key=Name,Value=$routeTableName"
if [ $? -eq 0 ]; then
  echo "  Route table ID '$ROUTE_TABLE_ID' NAMED as '$routeTableName'."
else
    echo "Error:ROUTE_TABLE name not added!!"
    exit $?
fi

#Create route to Internet Gateway
RESULT=$(aws ec2 create-route \
  --route-table-id $ROUTE_TABLE_ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID \
  --region $region)
if [ $? -eq 0 ]; then
  echo "  Route to '0.0.0.0/0' via Internet Gateway ID '$IGW_ID' ADDED to Route Table ID '$ROUTE_TABLE_ID'."
else
    echo "Error:Route to Internet gateway not created!!"
    exit $?
fi
