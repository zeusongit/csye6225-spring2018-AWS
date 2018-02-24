#!/bin/bash
echo "#CSYE6225 running application"
cd /var/
pwd
ls -lrt
cd /var/webapp/csye6225-sprin2018/nodeapp-express
NODE_ENV=dev node app.js
