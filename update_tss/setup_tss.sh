#!/bin/bash
###### RUN SCRIPT ON MOZART ######
# Purpose: Setup time-series leaflet server

# Clone or update displacement-ts-server
cd /home/ops/mozart/ops
export TSS_REPO_DIR=/home/ops/mozart/ops/displacement-ts-server
if [ ! -d "$TSS_REPO_DIR" ]; then
    git clone https://github.com/hysds/displacement-ts-server.git -b dev
else
    sudo rm -rf $TSS_REPO_DIR
    git clone https://github.com/hysds/displacement-ts-server.git -b dev
fi

# Update configs/certs/server.cnf and create self-signed SSL certs
cd /home/ops/mozart/ops/displacement-ts-server/configs/certs
openssl genrsa -des3 -passout pass:$PASS_PHRASE -out server.key 1024
OPENSSL_CONF=server.cnf openssl req -passin pass:$PASS_PHRASE -new -key server.key -out server.csr
cp server.key server.key.org
openssl rsa -passin pass:$PASS_PHRASE -in server.key.org -out server.key
chmod 600 server.key*
openssl x509 -req -days 99999 -in server.csr -signkey server.key -out server.crt

# Update time-series leaflet server
cd /home/ops/mozart/ops/displacement-ts-server/update_tss
bash update_tss.sh
