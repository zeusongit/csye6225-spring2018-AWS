#!/bin/bash
echo "#CSYE6225 running application"
cd /var/webapp/csye6225-spring2018/nodeapp-express
NODE_ENV=dev node app.js
