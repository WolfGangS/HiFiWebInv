function Api(endpoint){
    var that = {};
    that.endpoint = endpoint;

    that.get = function(path){
        $.get(endpoint + path,function(response){
            console.log(response);
        });
    }
    return that;
}


var api = null;

$(document).ready(function(){
    api = new Api(window.location.href.split("/html/inv.html")[0]);
    api.get();
});