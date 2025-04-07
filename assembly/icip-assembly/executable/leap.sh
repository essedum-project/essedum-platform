#!/bin/sh
#
# @ 2018 - 2019 Infosys Limited, Bangalore, India. All Rights Reserved.
# Version: 1.0
# Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
# this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
# rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
# transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
# recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
# criminal penalties, and will be prosecuted to the maximum extent possible under the law.
#
SERVICE_NAME=leap
CLASSPATH=leap.jar:lib/*:modules/*:plugins/*
PATH_TO_LIB=/var/leap3rdparty/*
PID_PATH_NAME=/tmp/leap-pid
JAVA_ARGS="-Xmx7G -Dserver.ssl.key-store-type=jks -Dserver.ssl.key-store=file:/etc/ssl/victsecst07.jks -Dserver.ssl.key-store-password=infy123 -Dserver.ssl.key-alias=1  -Dencryption.key="leap\$123##" -Dencryption.salt=NB9+lv0guQXYrZYbTmcS20Vd5FxW1h75b8CaI8r+nnPvYrIIHfYu05JVQf9qtJNCS0Vznh692VhUW9HeCPd2IA=="
CONFIG_FILE="-Dspring.config.location=/var/leap/conf/"
LOG_FILE_PATH="-Dlogging.path=/var/log/leap"
SERVER_PORT="-Dserver.port=8089"
ENABLE_QUARTZ="-Dspring.quartz.enabled=true"
DEFAULT_LICENSE_PATH=/var/iamp-default-license/iampLicense1year
ACTIVE_PROFILE=$PROFILE_NAME
case $1 in
    start)
        echo "Starting $SERVICE_NAME ..."
        if [ ! -f $PID_PATH_NAME ]; then
            cd /var/leap
            #source /root/leap/bin/activate
            nohup java $LOG_FILE_PATH $JAVA_ARGS $CONFIG_FILE $SERVER_PORT $ENABLE_QUARTZ -cp $CLASSPATH:$PATH_TO_LIB com.infosys.IAMP $DEFAULT_LICENSE_PATH 2>> /dev/null >> /dev/null & echo $! > $PID_PATH_NAME
            echo "$SERVICE_NAME started ..."
        else
            echo "$SERVICE_NAME is already running ..."
        fi
    ;;
    stop)
        if [ -f $PID_PATH_NAME ]; then
            PID=$(cat $PID_PATH_NAME);
            echo "$SERVICE_NAME stoping ..."
            kill $PID;
            echo "$SERVICE_NAME stopped ..."
            rm $PID_PATH_NAME
        else
            echo "$SERVICE_NAME is not running ..."
        fi
    ;;
    restart)
        if [ -f $PID_PATH_NAME ]; then
            PID=$(cat $PID_PATH_NAME);
            echo "$SERVICE_NAME stopping ...";
            kill $PID;
            echo "$SERVICE_NAME stopped ...";
            rm $PID_PATH_NAME
            echo "$SERVICE_NAME starting ..."
            cd /var/leap
            #source /root/leap/bin/activate
            nohup java $LOG_FILE_PATH $JAVA_ARGS $CONFIG_FILE $SERVER_PORT $ENABLE_QUARTZ -cp $CLASSPATH:$PATH_TO_LIB com.infosys.IAMP $DEFAULT_LICENSE_PATH 2>> /dev/null >> /dev/null & echo $! > $PID_PATH_NAME
            echo "$SERVICE_NAME started ..."
        else
            echo "$SERVICE_NAME is not running ..."
        fi
    ;;
esac
