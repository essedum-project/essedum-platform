#!/bin/bash
echo "Staring nginx"
/opt/bitnami/nginx/sbin/nginx
echo $*
$*