function Api(endpoint){
    var that = {};
    that.endpoint = endpoint;

    that.get = function(path){
        $.get(endpoint + path,function(d){that.after(d);});
    }
    that.after = function(d){
        console.log(d);
    }
    that.success = function(cb){
        that.after = cb;
    }
    return that;
}


var api = null;

$(document).ready(function(){
    api = new Api(window.location.href.split("/hifi/html/inv.html")[0]);
    api.get("").success(function(d){
        console.log("SUCCESS",d);
    });
});