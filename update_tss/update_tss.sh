#!/bin/bash
# Execute Fabric command to update server
fab -f update_tss.py -R leaflet_serv resolve_role update_ts_server
