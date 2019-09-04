/**
 * The class handles the leaflet interface for us.
 * @author mstarch
 */
function LeafHandler(name)
{
    var _self = this;
    var THREDDS_URL="//"+location.hostname+"/thredds/";
    var WMS_URL="//"+location.hostname+"/thredds/wms/ts/";
    /**
     * Base parameters sent directly to Leaflet
     */  
    var BASE = 
        {
            transparent: true,
            abovemaxcolor: "extend",
            belowmincolor: "extend",
            numcolorbands: 100,
            version: "1.1.1",
            service: "WMS",
            styles: "boxfill/revrainbow",
            logscale: false,
            colorscalerange: "-100,100",
            format: "image/png",
        };
    /**
     * KML parameters, used to generate the KML document
     */ 
    var KML =
        {
            request: "GetMap",
            format: "application/vnd.google-earth.kmz",
            exceptions: "application/vnd.ogc.se_inimage",
            srs: "EPSG:4326", //Google uses different projection from OpenStreetMaps
        };
    /**
     * Parameters sent to legend request
     */
    var LEGEND =
        {
            request: "GetLegendGraphic",
            palette: "revrainbow",
        };
    /**
     * Capabilities request.
     * Note: not merged with BASe
     */  
    var CAPS =
        {
            version: "1.1.1",
            service: "WMS",
            request: "GetCapabilities"
        };
    //Markers to push in
    var MARKERS = [];
    //Merge BASE into KML and LEGEND
    for (var key in BASE)
    {
        if (!(key in KML))
        {
            KML[key] = BASE[key];
        }
    }
    for (var key in BASE)
    {
        if (!(key in LEGEND))
        {
            LEGEND[key] = BASE[key];
        }
    }
    //Initial blank values;
    _self.name = null;
    _self.times = [];
    _self.bbox = [];
    _self.center = [];
    _self.active = [];

    _self.setName =
        /**
         * Setup the name of the file that is being actively displayed
         * and reload leaflet to setup the stuff.
         * @param name - name of the file that is setup
         * @param begin - (optional) is this a new setup?
         */
        function(name,begin)
        {
            _self.name = name.endsWith(".h5")?name:name+".h5";
            _self.times = [];
            _self.bbox = [];
            _self.center = [];
            _self.applyCaps();
            _self.setupMap(typeof(begin) === "undefined" || !begin);
        };
    _self.getGodivaUrl =
        /**
         * Get the Godiva URL for the current series
         */
        function()
        {
            var godiva_url = THREDDS_URL + "/godiva2/godiva2.html?server=" + WMS_URL + _self.name;
            return godiva_url;
        }
    _self.getKmlUrl =
        /**
         * Get the KML URL for the current time
         */
        function()
        {
            KML.layers = _self.active.join(",");
            KML.time = _self.times[0]+"/"+_self.times[_self.times.length-1];
            KML.bbox = _self.bbox.join(",");
            KML.height = Math.round((_self.bbox[3] - _self.bbox[1])*200);
            KML.width = Math.round((_self.bbox[2] - _self.bbox[0])*200);
            var ret = getGetUrl(WMS_URL+_self.name,KML);
            //Undo sets
            KML.layers = undefined;
            KML.time = undefined;
            KML.bbox = undefined;
            KML.height = undefined;
            KML.width = undefined;
            return ret;
        }
    _self.applyCaps =
        /**
         * Gets the time and bounding box parameters
         */ 
        function()
        {
            var params = ["minx","miny","maxx","maxy"];
            var bbox = [-180,-90,180,90];
            var text = ajaxGet(getGetUrl(WMS_URL+_self.name,CAPS));
            //Parse the lat-lon min-max etc
            var half = text.substring(text.indexOf("<LatLonBoundingBox"));
            for (var i = 0; i < params.length; i++)
            {
                bbox[i] = parseFloat(half.substring(half.indexOf(params[i]+"=\"")+6));
            }
            //Now get the timings
            half = text.substring(text.indexOf("<Extent name=\"time\" multipleValues=\"1\"")+86,text.indexOf("</Extent>"));
            times = half.replace(/^\s+|\s+$/g, "").split(",");
            _self.times = times;
            _self.bbox = bbox;
            _self.center = [(bbox[3]+bbox[1])/2,(bbox[2]+bbox[0])/2];
            //TODO: could read this from caps...but no titles yet
            _self.layers =  [
                {
                    "name":"RAW Displacement Time Series (mm)",
                    "id":"rawts",
                },
                {
                    "name":"Filtered Displacement Time Series (mm)",
                    "id":"recons",
                }
            ];
            //MARKERS.push({"name":"Center","position":_self.center});
        };
    _self.setupMap =
        /**
         * Setup the map for the leaflet stuff
         * @param refresh - (optional) should we only refresh?
         */
        function(refresh)
        {
            var startDate = new Date();
            startDate.setUTCHours(0, 0, 0, 0);
            //Map starts with no markers, nor overlays, nor legends
            if (typeof(refresh) === "undefined" || !refresh)
            {
                //Create the map object
                _self.map = L.map('map',
                {
                    zoom: 8,
                    center: _self.center,
                    //Special timeseries map parameters
                    fullscreenControl: true,
                    timeDimensionControl: true,
                    timeDimensionControlOptions: {
                        position: 'bottomleft',
                        playerOptions:
                        {
                            transitionTime: 1000,
                            startOver: true,
                        },
                    },
                    timeDimension: true,
                });
            }
            _self.overlays = {};
            _self.legends = {};
            //Loop through and add layers and legends
            for (var i = 0; i < _self.layers.length; i++)
            {
                //Layer setup
                var config = _self.layers[i];
                BASE.layers = config["id"];
                BASE.cache = 100;
                var layer = L.tileLayer.wms(WMS_URL+_self.name,BASE);
                //Legend setup
                var legend = L.control({
                    position: 'bottomright'
                });
                _self.legends[config["name"]] = legend;
                //The legend is an image, thus "on add" create an image and set
                //the source to the WMS server legen URL
                function getLegend(id) {
                    return function(map) {
                        LEGEND.layer = id;
                        var src = getGetUrl(WMS_URL+_self.name,LEGEND);
                        LEGEND.layer = undefined;
                        var div = L.DomUtil.create('div', 'info legend');
                        div.innerHTML +='<img src="' + src + '" alt="legend">';
                        return div;
                    };
                };
                legend.onAdd = getLegend(config["id"]);
                //Now setup the overlays for the given layer
                var tsLayer = L.timeDimension.layer.wms.timeseries(layer,
                {
                    cache: 100,
                    updateTimeDimension: true,
                    markers: MARKERS,
                    name: config["name"],
                    units: "mm",
                    enableNewMarkers: true
                });
                _self.overlays[config["name"]] = tsLayer;
            }
            //Unset changes to legend, and BASE stuff
            BASE.layers = undefined;
            BASE.cache = undefined;
            LEGEND.layer = undefined;
            //Code to handle layer adding and removal
            _self.map.on('overlayadd', 
                function(eventLayer)
                {
                    var k = 0;
                    eventLayer.layer.addTo(_self.map);
                    _self.legends[eventLayer.name].addTo(this);    
                    for (k = 0; k < _self.layers.length; k = k + 1)
                    {
                        if (_self.layers[k].name == eventLayer.name)
                        {
                            _self.active.push(_self.layers[k].id);
                        }
                    }
                });
            _self.map.on('overlayremove',
                function(eventLayer)
                {
                    var y = 0;
                    var inx = -1;
                    _self.map.removeControl(_self.legends[eventLayer.name]);
                    for (y = 0; y < _self.layers.length; y = y + 1)
                    {
                        if (_self.layers[y].name == eventLayer.name && _self.active.indexOf(_self.layers[y].id))
                        {
                            inx = _self.active.indexOf(_self.layers[y].id);
                            _self.active.splice(inx,1);
                        }
                    }
                });
            //Setup the basic layers for leaflet to look pretty
            //Gets the basic layers: Bathometry, streetview
            var baseLayers = getCommonBaseLayers(_self.map); // see baselayers.js
            L.control.layers(baseLayers, _self.overlays).addTo(_self.map);
            L.control.coordinates({
                position: "bottomright",
                decimals: 3,
                labelTemplateLat: "Latitude: {y}",
                labelTemplateLng: "Longitude: {x}",
                useDMS: true,
                enableUserInput: false
            }).addTo(_self.map);
            //Add one overlay to the map
            _self.overlays[_self.layers[0]["name"]].addTo(_self.map);
            //_self.overlays[_self.layers[1]["name"]].addTo(_self.map);
            //Setup start time
            setTimeout(function(){_self.map.timeDimension.setCurrentTime(_self.map.timeDimension.getAvailableTimes()[0]);},500);
        };
    if (name != null) {
        //Load this on initialization
        _self.setName(name,true);
    } else {
        throw new Error("ID not specified");
    }
};
