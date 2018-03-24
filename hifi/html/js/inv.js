function Api(endpoint) {
    var that = {};
    that.endpoint = endpoint;

    that.get = function(path) {
        $.get(endpoint + path, function(d) { that.after(d); });
        return that;
    }
    that.after = function(d) {
        console.log(d);
    }
    that.success = function(cb) {
        that.after = cb;
        return that;
    }
    return that;
}


var api = null;

var inventory = {};

function loadInventory(data) {
    console.log(data);return;
    if (data.hasOwnProperty("path")) {
        if (data.hasOwnProperty("dir")) {
            data = data.dir;
            if (path.length > 0) {
                var i;
                path = path.split("/");
                //for (i = 0;)
            } else {
                if ()
                    inventory
            }
        }
    }
}

$(document).ready(function() {
    api = new Api(window.location.href.split("/hifi/html/inv.html")[0]);
    api.get("").success(function(d) {
        loadInventory("", d);
    });
});