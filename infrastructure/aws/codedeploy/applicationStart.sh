#!/bin/bash
echo "#CSYE6225 running application"
cd /var/webapp/csye6225-spring2018/nodeapp-express
echo "PWD AND FILES"
pwd
ls -lrt
NODE_ENV=development node app.js
