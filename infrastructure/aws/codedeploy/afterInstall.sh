#!/bin/bash

# update the permission and ownership of WAR file in the tomcat webapps directory
echo "#CSYE6225: doing after install"
cd /var
pwd
ls -lrt
echo "#CSYE6225: doing after install: remove webapp if already exist"
sudo rm -rf webapp
echo "#CSYE6225: doing after install: make dir webapp"
sudo mkdir -p webapp
pwd
ls -lrt
echo "#CSYE6225: doing after install: move zip to webapp dir"
sudo mv csye6225-spring2018.zip webapp/
cd webapp/
echo "#CSYE6225: doing after install: go in webapp"
pwd
ls -lrt
echo "#CSYE6225: doing after install: unzip nodeapp"
sudo unzip csye6225-spring2018.zip
echo "#CSYE6225: doing after install: remove zip from webapp folder"
sudo rm -rf csye6225-spring2018.zip
echo "#CSYE6225: doing after install: end"
pwd
ls -lrt
cd ..
sudo cp .env webapp/nodeapp-express
cd webapp/nodeapp-express
sudo chmod 666 .env
pwd
ls -lrt
cd ../..
pwd
ls -lrt
