#!/bin/bash

# update the permission and ownership of WAR file in the tomcat webapps directory
echo "#CSYE6225: doing after install"
cd /var/webapp/csye6225-spring2018
sudo unzip csye6225-spring2018.zip -d ./
jar xvf csye6225-spring2018.zip
#echo pwd
#pwd
#echo "now copying"
#sudo cp -a csye6225-spring/. ./
#chmod -R 777 csye6225-spring2018
#sudo rm -rf csye6225-spring2018.zip csye6225-spring2018
#echo "pwd and final files"
#pwd
#ls -lrt
