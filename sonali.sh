#!/bin/bash
#Variables
#usr=null
#policy=null
testseq="Travis"
username=($(aws iam list-users --query "Users[*].UserName" --output text))
	#echo $username

	for j in  ${username[@]};
	do
		shopt -s nocasematch
		#echo "$j"
			if [[ $j == *"$testseq"* ]];
				then
    			usr=$j
    			echo "username= $usr"
			#else
    		#	echo " "
			fi
	done
arr=($(aws iam list-policies --scope Local --only-attached --query "Policies[*].Arn" --output text))
	echo $arr
	for i in  ${arr[@]};
	do
		#echo "$i"
			if [[ $i == *"$testseq"* ]];
				then
				policy=$i
				echo "Username inside policy if = $usr"
				#detach-user-policy --user-name $usr --policy-arn $policy
    			echo "Policy = $policy"
			fi
	done	


echo "Final Policy = $policy"
echo "Final username = $usr"
#detach-user-policy --user-name $usr --policy-arn $policy
