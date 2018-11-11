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
//Run on load
window.onload = function()
{
    try {
        //Get the id, and start build all the mechanics
        var id = getParameterByName("id");
        document.getElementById("title").innerHTML = id;
        var controls = new Controls("buttons");
        var leaflet = new LeafHandler(id);
        var product = new Product(id,leaflet);
        controls.render(product);
    } catch (err) {
        document.getElementById("title").innerHTML = "<h4>Error: Could not load Leaflet data</h4>" +
            "<em>The most likely cause is a problem with the automatically supplied ID.</em>"+
            "<p>If you arrived here without the aid of a direct link from: <a href='https://aria-search.jpl.nasa.gov/'>https://aria-search.jpl.nasa.gov/</a>," +
            " please select a time-series product in Aria Search (previous link) and follow the 'Visualize' button to link to this tool."+
            "If the 'Visualize' button does not exist, have patience, it is in the ingestion process.";
        //Remove no functioning components
        document.getElementById("map").innerHTML = "";
        document.getElementById("chart").innerHTML = "";
        document.getElementById("buttons").innerHTML = "";

    }
}
