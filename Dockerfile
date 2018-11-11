FROM hysds/pge-base

MAINTAINER gmanipon "gmanipon@jpl.nasa.gov"
LABEL description="ARIA Displacement Time Series Leaflet Viewer"

USER ops

COPY apps/leaflet_ts /home/ops/verdi/ops/leaflet_ts
RUN set -ex \
  && sudo chown -R ops:ops /home/ops/verdi/ops/leaflet_ts \
  && source ~/verdi/bin/activate \
  && cd ~/verdi/ops/leaflet_ts \
  && pip install --process-dependency-links -e . \ 
  && rm -rf /home/ops/.cache

COPY configs/supervisord.conf /home/ops/verdi/etc/supervisord.conf
COPY configs/inet_http_server.conf /home/ops/verdi/etc/conf.d/inet_http_server.conf
COPY configs/leaflet_ts.conf /home/ops/verdi/etc/conf.d/leaflet_ts.conf
CMD ["supervisord"]
