function Api(endpoint) {
    let that = {};
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

let api = null;

let inventory = {};

function loadInventory(path) {
    api.get(path).success(function(data) {
        if (data.hasOwnProperty("path")) {
            let path = data.path;
            if (data.hasOwnProperty("dir")) {
                data = data.dir;
                if (path.length > 0) {
                    let i;
                    path = path.split("/");
                    let inv = inventory;
                    for (i = 0; i < path.length; i++) {
                        if (!inv.hasOwnProperty(path[i]) || inv[path[i]] == null) {
                            inv[path[i]] = {};
                        }
                        inv = inv[path[i]];
                    }
                    for (let d in data.dirs) {
                        inv[d] = {};
                    }
                    for (let f in data.files) {
                        inv[f] = data.files[f];
                    }
                } else {
                    let inv = {};
                    for (let d in data.dirs) {
                        inv[d] = {};
                    }
                    for (let f in data.files) {
                        inv[f] = data.files[f];
                    }
                    inventory = inv;
                }
                folderRender($("#inventory"), inventory, "");
            }
        }
    });
}

function sha1(str) {
    let buffer = new TextEncoder("utf-8").encode(str);
    return crypto.subtle.digest("SHA-1", buffer).then(function(hash) {
        return hex(hash);
    });
}

function createFindSpan(parent, path, name, type) {
    let p = path.split("/").join("_");
    let e = $("#" + p);
    if (e.length < 1) {
        e = $("<span>");
        e.attr("id", p);
        e.data("path", path);
        e.append($("<i>").addClass("fas fa-" + type));
        e.addClass(type);
        e.append(" " + name);
        if (type == "folder") {
            e.on("click", function() {
                let f = $(this).next();
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
    let p = path.split("/").join("_") + "___folder";
    let e = $("#" + p);
    if (e.length < 1) {
        e = $("<div>");
        e.data("path", path);
        e.attr("id", p);
        e.addClass("folder-content");
        e.hide();
        e.insertAfter(span);
    }
    return e;
}

function folderRender(parent, folder, path) {
    let p = "";
    let dirs = [];
    let fils = [];
    for (let i in folder) {
        let o = folder[i];
        if (typeof o == "string") {
            fils.push(i);
        } else {
            dirs.push(i);
        }
    }

    fils.sort();
    dirs.sort();

    dirs.push.apply(dirs, fils);
    let items = dirs;

    for (let j in items) {
        let i = items[j];
        p = path + "/" + i;
        let o = folder[i];
        sha1(p).then(function(hash) {
            if (typeof o == "string") {
                let e = createFindSpan(parent, p, hash, i, "file");
            } else {
                let e = createFindSpan(parent, p, hash, i, "folder");
                let d = createFindDiv(e, p);
                folderRender(d, o, p);
            }
        });

    }
}


$(document).ready(function() {
    api = new Api(window.location.href.split("/hifi/html/inv.html")[0]);
    loadInventory("");
});