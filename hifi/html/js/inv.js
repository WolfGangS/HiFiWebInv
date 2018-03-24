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
                        inv[d] = {};
                    }
                    for (var f in data.files) {
                        inv[f] = data.files[f];
                    }
                } else {
                    var inv = {};
                    for (var d in data.dirs) {
                        inv[d] = {};
                    }
                    for (var f in data.files) {
                        inv[f] = data.files[f];
                    }
                    inventory = inv;
                }
                folderRender($("#inventory"),inventory,"");
            }
        }
    });
}

function createFindSpan(parent, path, name, type) {
    var p = path.split("/").join("_");
    var e = $("#" + p);
    if (e.length < 1) {
        e = $("<span>");
        e.attr("id", p);
        e.data("path",path);
        e.append($("<i>").addClass("fas fa-" + type));
        e.addClass(type);
        e.append(" " + name);
        if (type == "folder") {
            e.on("click", function() {
                var f = $(this).next();
                loadInventory($(this).data("path"));
                if (f.hasClass("folder-content")) {
                    f.slideToggle(100);
                }
            });
        }
        parent.append(e);
    }
    return e;
}

function createFindDiv(span, path) {
    var p = path.split("/").join("_") + "___folder";
    var e = $("#" + p);
    if (e.length < 1) {
        e = $("<div>");
        e.data("path",path);
        e.attr("id", p);
        e.addClass("folder-content");
        e.hide();
        e.insertAfter(span);
    }
    return e;
}

function folderRender(parent, folder, path) {
    var p = "";
    var dirs = [];
    var fils = [];
    for (var i in folder) {
        var o = folder[i];
        if (typeof o == "string") {
            fils.push(i);
        } else {
            dirs.push(i);
        }
    }

    fils.sort();
    dirs.sort();

    dirs.push.apply(dirs, fils);
    var items = dirs;

    for (var j in items) {
        var i = items[j];
        p = path + "/" + i;
        var o = folder[i];
        if (typeof o == "string") {
            var e = createFindSpan(parent, p, i, "file");
        } else {
            var e = createFindSpan(parent, p, i, "folder");
            var d = createFindDiv(e, p);
            //e.hide();
            folderRender(d, o, p);
        }
    }
}


$(document).ready(function() {
    api = new Api(window.location.href.split("/hifi/html/inv.html")[0]);
    loadInventory("");
});