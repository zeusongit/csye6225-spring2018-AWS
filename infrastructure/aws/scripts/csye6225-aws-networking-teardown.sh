#!/bin/bash

#Retrieving VPC Name
vpc="$1-csye6225-vpc-1"
vpcname=$(aws ec2 describe-vpcs --query "Vpcs[?Tags[?Key=='Name']|[?Value=='$vpc']].Tags[0].Value" --output text)
if [ $? -eq 0 ]; then
  echo "  VPC Name: '$vpcname'"
else
    echo "Error:Could not retrieve VPC Name!!"
    exit $?
fi

#Retrieving VPC ID
vpc_id=$(aws ec2 describe-vpcs --query "Vpcs[?Tags[?Key=='Name']|[?Value=='$vpcname']].VpcId" --output text)
if [ $? -eq 0 ]; then
  echo " VPC Id '$vpc_id'"
else
    echo "Error:Could not retrieve VPC Id!!"
    exit $?
fi

#Retrieving Internet-Gateway-Id
IGW_Id=$(aws ec2 describe-internet-gateways --query "InternetGateways[?Attachments[?VpcId=='$vpc_id']].InternetGatewayId" --output text)
if [ $? -eq 0 ]; then
  echo "Internet Gateway ID '$IGW_Id'"
else
    echo "Error:Could not retrieve Internet Gateway ID!!"
    exit $?
fi

#Retrieving Route-Table-Id
route_tbl_id=$(aws ec2 describe-route-tables --query "RouteTables[?VpcId=='$vpc_id'].RouteTableId" --output text)
if [ $? -eq 0 ]; then
  echo "  Route Table ID '$route_tbl_id'"
else
    echo "Error:Could not retrieve Route Table ID!!"
    exit $?
fi

#Detach Internet Gateway
aws ec2 detach-internet-gateway --internet-gateway-id $IGW_Id --vpc-id $vpc_id
if [ $? -eq 0 ]; then
  echo "Internet Gateway Detached!"
else
    echo "Error:Could not detach Internet Gateway!!"
    exit $?
fi

# Delete Internet Gateway
aws ec2 delete-internet-gateway --internet-gateway-id $IGW_Id
if [ $? -eq 0 ]; then
  echo "Internet Gateway deleted successfully!!"
else
    echo "Error:Could not delete Internet Gateway!!"
    exit $?
fi

# Retrieving main route table
main_route_tbl_id=$(aws ec2 describe-route-tables --query "RouteTables[?VpcId=='$vpc_id']|[?Associations[?Main -ne true]].RouteTableId" --output text)
if [ $? -eq 0 ]; then
  echo "  Route Table ID '$main_route_tbl_id'"
else
    echo "Error:Could not retrieve Route Table Id!!"
    exit $?
fi

#Delete Route-Table
for i in $route_tbl_id
do
	if [[ $i -ne $main_route_tbl_id ]]; then
		aws ec2 delete-route-table --route-table-id $i
		echo "Route Table Deleted: $i"
	fi
done
if [ $? -eq 0 ]; then
  echo "  Route Table Deletion Complete"
else
    echo "Error: Could not delete Route Table!!"
    exit $?
fi

#Delete vpc
aws ec2 delete-vpc --vpc-id $vpc_id
if [ $? -eq 0 ]; then
  echo "  VPC Deleted"
else
    echo "Could not delete vpc!!"
    exit $?
fi
