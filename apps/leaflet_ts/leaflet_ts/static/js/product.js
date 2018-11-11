/**
 * Class used to represent a product in the leaflet app. It represents a set of files
 * that compose a product in HySDS. In this case it is the NSBAS and LS parameter
 * files. The user may want to switch between the two, and thus it must be captured
 * 
 * @author mstarch
 *
 * @param name - name of product submitted in the URL to leaflet
 * @param leaflet - leaflet object used for displays
 */
function Product(name,leaflet)
{
    //Establish non-ambiguous contextual self
    var _self = this;
    //Keep leaflet controls
    _self.leaflet = leaflet;
    //Possible file types for all products
    var POSSIBLE_FILE_TYPES = ["","ls"];  
    //Hold onto the id we render to
    _self.name = name.endsWith(".h5") ? name.substring(0,name.length - ".h5".length) : name;
    //Type of "" is NSBAS, otherwise type is 2 character string representing the file naming scheme
    _self.type = "";

    _self.getFullTypedFile =
        /**
         * Get a full file name that contains the products base and the type
         * @param type - (optional) type to get name for, set to current type
         * @return - a full file name containing current type
         */ 
         function(type)
         {
             //Check for needing to default
             if (typeof(type) === "undefined")
             {
                 type = _self.type;
             }
             return _self.name+((type == "")?"":"-"+type)+".h5";
         };

    _self.getSisterFiles =
        /**
         * Gets all sister files for this given product
         * @return - list of files (in leaflet) that applie to this product
         */
         function()
         {
             var ret = [];
             for (var i = 0; i < POSSIBLE_FILE_TYPES.length; i++)
             {
                 ret.push(_self.getFullTypedFile(POSSIBLE_FILE_TYPES[i]));
             }
             return ret;
         };

    _self.getGodivaUrl =
        /**
         * This function generates the URL to Godiva
         * @return - URL that represents a Godiva URL for the selected file
         */
        function()
        {
            return _self.leaflet.getGodivaUrl();
        };

    _self.getDownloadUrl =
        /**
         * This function generates the URL to download a KML file for using
         * the basename and the selected type for this given product.
         * @return - URL that represents a KML download for the selected file
         */
        function()
        {
            return _self.leaflet.getKmlUrl();
        };

    _self.setType =
        /**
         * Sets the selected type for this product
         * @param type - type of file for this product to display
         */
        function(type)
        {
            _self.type = type;
            _self.leaflet.setName(_self.getFullTypedFile());
        };
}
