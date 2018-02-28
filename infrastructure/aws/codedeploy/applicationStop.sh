#!/bin/bash
echo "#CSYE6225: start application pwd and move into nodeapp dir"
pwd
cd /var/webapp/nodeapp-express
echo "SHOWING WEBAPP"
echo "PWD AND FILES"
pwd
ls -lrt
echo "SHOWING WEBAPP"
status=$(pm2 show web-app)
if [ $? -eq 0 ]; then
  sudo pm2 stop web-app
  sudo pm2 delete web-app
else
  exit 0
fi;
