# ARIA Displacement Time Series THREDDS Server and Leaflet Viewer

A containerized example of the ARIA Displacement Time Series THREDDS
Server and Leaflet interface.

## Dependencies
- docker v18.06.1-ce or higher
- docker-compose v1.22.0 or higher

## Run it
1. Clone repo:
   ```
   git clone https://github.com/hysds/displacement-ts-server.git
   ```
1. Update `configs/certs/server.cnf` and create self-signed SSL certs:
   ```
   cd displacement-ts-server/configs/certs
   openssl genrsa -des3 -out server.key 1024
   OPENSSL_CONF=server.cnf openssl req -new -key server.key -out server.csr
   cp server.key server.key.org
   openssl rsa -in server.key.org -out server.key
   chmod 600 server.key*
   openssl x509 -req -days 99999 -in server.csr -signkey server.key -out server.crt
   cd ../..
   ```
1. Build docker images:
   ```
   docker build --rm --force-rm -t hysds/displacement-ts-server:latest .
   ```
1. Run in background:
   ```
   docker-compose up -d
   ```
   or foreground:
   ```
   docker-compose up
   ```
1. Graceful shutdown:
   ```
   docker-compose down
   ```

## Displacement Time Series Data
Store GIAnT displacement time series HDF5 products under the 
`datasets/ts` directory or modify `docker-compose.yml` to 
mount a volume containing your data into the `hysds-thredds` 
container, e.g.:

```
--- a/docker-compose.yml
+++ b/docker-compose.yml
@@ -11,7 +11,8 @@ services:
     volumes:
       - ./tomcat/logs/:/usr/local/tomcat/logs/
       - ./tomcat/content/thredds:/usr/local/tomcat/content/thredds
-      - ./datasets/ts:/data/ts
+      #- ./datasets/ts:/data/ts
+      - /my/large/volume/ts:/data/ts
   hysds-leaflet-ts:
     build: .
     hostname: hysds-leaflet-ts
```
