/**
 * Class used to handle the HySDS custom controls for the leaflet page. Thse include
 * download buttons, switch product bttons, etc. 
 * 
 * @author mstarch
 *
 * @param id - id of div to use as a control block
 */
function Controls(id)
{
    //Establish non-ambiguous contextual self
    var _self = this;
    //Hold onto the id we render to
    _self.id = id;

    _self.render =
        /**
         * This function renders the buttons div for the given product
         * letting it show sister products, update the download vutton URL
         * etc.
         * @param product - product to render the controls for
         */
        function(product)
        {
            /*var prods = product.getSisterFiles();
            //Genrate buttons for every product type
            var buttonsHtml = "";
            for (var i = 0; i < prods.length; i++)
            {
                //Set type for sister products
                var tmp = prods[i].slice(-6,-3);
                var type = tmp.startsWith("-")?tmp.slice(1,3):"";
                buttonsHtml += "<button id='"+prods[i]+"' class='product-button' type='"+type+"'>"+type+"</button>";
            }
            //Set the product-buttons div to hold the newly minted buttons
            document.getElementById("product-buttons").innerHTML = buttonsHtml;*/
            //Bind the product to the buttons
            var buttons = document.getElementById(_self.id).getElementsByTagName("button")
            for (var i = 0; i < buttons.length; i++)
            {
                buttons[i].product = product;
            }
            //Set function callbacks
            /*var pbuttons = document.getElementById(_self.id).getElementsByClassName("product-button");
            for (var i = 0; i < pbuttons.length; i++)
            {
                pbuttons[i].onclick = _self.onProductClick;
            }*/
            //document.getElementById("download").onclick = _self.onDownloadClick;
            document.getElementById("godiva").onclick = _self.onGodivaClick;
        }
    _self.onProductClick =
        /**
         * When we change the file type on the product, we need to update the product
         * to reflect this change and to update the button display propertly to 
         * look "pressed"
         */
        function()
        {
            var button = this;
            button.product.setType(button.type);
        }
    _self.onGodivaClick =
        /**
         * What to do on a godiva click
         */
        function()
        {
            var button = this;
            window.location = button.product.getGodivaUrl(); 
        }
    _self.onDownloadClick =
        /**
         * What to do on a download click
         */
        function()
        {
            var button = this;
            window.location = button.product.getDownloadUrl(); 
        }
}
