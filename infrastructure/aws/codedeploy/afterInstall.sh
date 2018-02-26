#!/bin/bash

# update the permission and ownership of WAR file in the tomcat webapps directory
echo "#CSYE6225: doing after install"
cd /var
pwd
ls -lrt
sudo rm -rf webapp
mkdir webapp
pwd
ls -lrt
mv csye6225-spring2018.zip webapp/
cd /webapp
pwd
ls -lrt
sudo unzip csye6225-spring2018.zip -d ./webapp/
sudo rm -rf csye6225-spring2018.zip
pwd
ls -lrt
#echo pwd
#pwd
#echo "now copying"
#sudo cp -a csye6225-spring/. ./
#chmod -R 777 csye6225-spring2018
#sudo rm -rf csye6225-spring2018.zip csye6225-spring2018
#echo "pwd and final files"
#pwd
#ls -lrt
