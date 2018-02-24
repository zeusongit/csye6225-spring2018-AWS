#!/bin/bash

# update the permission and ownership of WAR file in the tomcat webapps directory
echo "#CSYE6225: doing after install"
cd /var/webapp/csye6225-spring2018
sudo unzip csye6225-spring2018.zip -d ./
cp -a csye6225-spring/. ./
rm -rf csye6225-spring2018.zip csye6225-spring2018
