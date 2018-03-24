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

function loadInventory(path) {
    api.get(path).success(function(data) {
        if (data.hasOwnProperty("path")) {
            var path = data.path;
            if (data.hasOwnProperty("dir")) {
                data = data.dir;
                if (path.length > 0) {
                    var i;
                    path = path.split("/");
                    var inv = inventory;
                    for (i = 0; i < path.length; i++) {
                        if (!inv.hasOwnProperty(path[i]) || inv[path[i]] == null) {
                            inv[path[i]] = {};
                        }
                        inv = inv[path[i]];
                    }
                    for (var d in data.dirs) {
                        inv[d] = data.dirs[d] > 0 ? {} : null;
                    }
                    for (var f in data.files) {
                        inv[f] = data.files[f];
                    }
                } else {
                    var inv = {};
                    for (var d in data.dirs) {
                        inv[d] = data.dirs[d] > 0 ? {} : null;
                    }
                    for (var f in data.files) {
                        inv[f] = data.files[f];
                    }
                    inventory = inv;
                }
            }
        }
    });
}

$(document).ready(function() {
    api = new Api(window.location.href.split("/hifi/html/inv.html")[0]);
    loadInventory("");
});