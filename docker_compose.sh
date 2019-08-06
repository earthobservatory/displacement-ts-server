#!/bin/bash
docker-compose down --volumes 
#docker system prune -f --volumes
docker-compose up -d
