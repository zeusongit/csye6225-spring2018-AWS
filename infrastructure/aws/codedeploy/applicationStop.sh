#!/bin/bash
echo "#CSYE6225: start application pwd and move into nodeapp dir"
pwd
cd /var/webapp/nodeapp-express
echo "PWD AND FILES"
pwd
ls -lrt
pm2 show web-app
if [ $? -eq 0 ]; then
  sudo pm2 stop web-app
  sudo pm2 delete web-app
else
  exit 0
fi;
