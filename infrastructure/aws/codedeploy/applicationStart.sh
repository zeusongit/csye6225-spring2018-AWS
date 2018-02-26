#!/bin/bash
echo "#CSYE6225: start application pwd and move into nodeapp dir"
pwd
cd /var/webapp/nodeapp-express
echo "PWD AND FILES"
pwd
ls -lrt
pm2 start app.js --watch
