/**
 * Gets a GET url by merging parameters into the URL by making them
 * query parameters.
 * @param url - base url to add query params to
 * @param params - parameters to be added as query params
 * @return - constructed URL
 */
function getGetUrl(url,params)
{
    var delim = "?";
    for (var key in params)
    {
        url=url+delim+encodeURIComponent(key).toUpperCase()+"="+encodeURIComponent(params[key]);
        console.log(url);
        delim = "&";
    }
    return url;
}
/**
 * Preform an AJAX request, if callback is provided then this will be asynchronouse
 * otherwise this will be syncronous and return the result
 * @param url - url to GET, should be complete with parameters
 * @param callback - (optional) callback to call (making asynchronous)
 * @return - null if asynchronous, or response text
 */
function ajaxGet(url,callback)
{
    //New request and set the callback
    var xhttp = new XMLHttpRequest();
    var ret = null;
    xhttp.onreadystatechange = function()
    {
        //What to do on success
        if (this.readyState == 4 && this.status == 200)
        {
            ret = (this.responseText);
            if (typeof(callback) !== "undefined")
            {
                callback(ret);
            }
        }
    };
    xhttp.open("GET", url, typeof(callback) !== "undefined");
    xhttp.send();
    return ret;
}
