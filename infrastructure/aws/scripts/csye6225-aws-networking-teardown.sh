#!/bin/bash

if [ $# -eq 0 ]; then
	echo " PLEASE PASS <STACK_NAME> as parameter while running this script "
	exit 1
fi

#Retrieving VPC Name
vpc="$1-csye6225-vpc-1"
vpcname=$(aws ec2 describe-vpcs --query "Vpcs[?Tags[?Key=='Name']|[?Value=='$vpc']].Tags[0].Value" --output text)
echo $vpcname

#Retrieving VPC ID
vpc_id=$(aws ec2 describe-vpcs --query "Vpcs[?Tags[?Key=='Name']|[?Value=='$vpcname']].VpcId" --output text)
echo $vpc_id

#Retrieving Internet-Gateway-Id
IGW_Id=$(aws ec2 describe-internet-gateways --query "InternetGateways[?Attachments[?VpcId=='$vpc_id']].InternetGatewayId" --output text)
echo $IGW_Id

#Retrieving Route-Table-Id
route_tbl_id=$(aws ec2 describe-route-tables --query "RouteTables[?VpcId=='$vpc_id'].RouteTableId" --output text)
echo $route_tbl_id

#Detach Internet Gateway
aws ec2 detach-internet-gateway --internet-gateway-id $IGW_Id --vpc-id $vpc_id
echo "Detachment successful!!"

# Delete Internet Gateway
aws ec2 delete-internet-gateway --internet-gateway-id $IGW_Id
echo "Internet Gateway deleted successfully!!"

# Retrieving main route table
main_route_tbl_id=$(aws ec2 describe-route-tables --query "RouteTables[?VpcId=='$vpc_id']|[?Associations[?Main!=true]].RouteTableId" --output text)

echo "id = $main_route_tbl_id"

#Delete Route-Table
for i in $route_tbl_id
do
	echo "Start------ $main_route_tbl_id"
	if [[ $i != $main_route_tbl_id ]]; then
		aws ec2 delete-route-table --route-table-id $i
		echo $i
	fi
	echo "stop----- $main_route_tbl_id"
done
echo "Route table deleted!!"

#Delete vpc
aws ec2 delete-vpc --vpc-id $vpc_id
echo "VPC deleted!!"
