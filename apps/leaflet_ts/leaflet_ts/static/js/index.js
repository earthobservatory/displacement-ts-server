var startDate = new Date();
startDate.setUTCHours(0, 0, 0, 0);

/**
 * Borrowed from StackOverflow at:
 *
 * http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/901144#901144
 */
function getParameterByName(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(window.location.href);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
/**
 * Gets the coordinates from the input query params
 */
function getCenter()
{
    var coords = getParameterByName("coords");
    var temp = coords.split(",");

    var lat = 0;
    var lon = 0;

    var maxLat = -99999;
    var maxLon = -99999;

    var minLat = 99999;
    var minLon = 99999;
    //Split off pairs of coordinates
    while (temp.length > 2)
    {
        lon = parseFloat(temp.shift());
        lat = parseFloat(temp.shift());
        if (lon < minLon) {
            minLon = lon;
        }
        if (lon > maxLon) {
            maxLon = lon;
        }
        if (lat < minLat) {
            minLat = lat;
        }
        if (lat > maxLat) {
            maxLat = lat;
        }
    }
    return [ (maxLat + minLat)/2,(minLon + maxLon)/2 ]
}
//Configuration
var WMS_URL="//"+location.hostname+"/thredds/wms/ts/"+getParameterByName("id");
//NSBAS-PARAMS.h5";
var LAYERS_CONFIG = [
    {
        "name":"RAW Displacement Time Series (mm)",
        "id":"rawts",
        "colorscalerange":"-100,100"
    },
    {
        "name":"Filtered Displacement Time Series (mm)",
        "id":"recons",
        "colorscalerange":"-100,100"
    }

];

/**
 * Create leaflet base map, to witch we will add overlays
 */
var map = L.map('map', {
    zoom: 8,
    center: getCenter(),
    //Special timeseries map parameters
    fullscreenControl: true,
    timeDimensionControl: true,
    timeDimensionControlOptions: {
        position: 'bottomleft',
        playerOptions: {
            transitionTime: 1000,
        }
    },
    timeDimension: true
});
//Empty marker variable
var markers = [ ];

//For every configuration, add layers to map
var overlays = {};
var legends = {};
for (var i = 0; i < LAYERS_CONFIG.length; i++) {
    var config = LAYERS_CONFIG[i];
    var layer = L.tileLayer.wms(WMS_URL,
      {
        layers: config["id"],
        format: 'image/png',
        transparent: true,
        colorscalerange: config["colorscalerange"],
        abovemaxcolor: "extend",
        belowmincolor: "extend",
        numcolorbands: 100,
        styles: 'boxfill/revrainbow'
      }
    );
   var legend = L.control(
      {
        position: 'bottomright'
      }
   );
   legends[config["name"]] = legend;
   //Add callbacks for legend
   legend.onAdd = function(map) {
       var src = WMS_URL+"?REQUEST=GetLegendGraphic&LAYER="+config["id"]+"&PALETTE=revrainbow&colorscalerange="+config["colorscalerange"]+"&numcolorbands=100&transparent=TRUE";
       var div = L.DomUtil.create('div', 'info legend');
       div.innerHTML +='<img src="' + src + '" alt="legend">';
       return div;
   };

   //make our layer into a time series
   var tsLayer = L.timeDimension.layer.wms.timeseries(layer,
     {
       updateTimeDimension: true,
       markers: markers,
       name: config["name"],
       units: "mm",
       enableNewMarkers: true
    }
  );
  //Add this layer to the overlay
  overlays[config["name"]] = tsLayer;
}

//Code to add and remove legends
map.on('overlayadd', function(eventLayer) {
    legends[eventLayer.name].addTo(this);    
});

map.on('overlayremove', function(eventLayer) {
        map.removeControl(legends[eventLayer.name]);
});
//Gets the basic layers: Bathometry, streetview
var baseLayers = getCommonBaseLayers(map); // see baselayers.js
L.control.layers(baseLayers, overlays).addTo(map);
L.control.coordinates({
    position: "bottomright",
    decimals: 3,
    labelTemplateLat: "Latitude: {y}",
    labelTemplateLng: "Longitude: {x}",
    useDMS: true,
    enableUserInput: false
}).addTo(map);
//Adding one
overlays[LAYERS_CONFIG[0]["name"]].addTo(map);
