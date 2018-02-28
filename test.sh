#!/bin/bash

pm2 list
status=$(pm2 show web-app)
echo $?
