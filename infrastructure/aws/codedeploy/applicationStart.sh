#!/bin/bash
echo "#CSYE6225 running application"
cd /var/
pwd
ls -lrt
cd /var/webapp/csye6225-spring2018/nodeapp-express
echo "PWD AND FILES"
pwd
ls -lrt
NODE_ENV=dev node app.js
