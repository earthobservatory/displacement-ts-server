## Apps

This directory represents the applications that run on top of THREDDS inorder to supply the Leaflet JS interface for browsing time series.

Important files and info:

1. This is a flask app, and follows the standard flask setup
2. ![Entry Point](leaflet_ts/static/js/index-2.js) is the entry point of the JavaScript app
3. ![AJAX](leaflet_ts/static/js/ajax.js) handles AJAX requests
4. ![leaflet.js](leaflet_ts/static/js/leaflet.js) sets up the Leaflet maps
5. ![Product Class](leaflet_ts/static/js/product.js) is a class representing our product
6. ![Controls](leaflet_ts/static/js/controls.js) is a class helping with interaction and control of leaflet
