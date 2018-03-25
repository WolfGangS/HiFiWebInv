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
    that.copy = function(oldpath, newpath) {
        $.ajax({
            url: "/copy",
            method: "POST",
            async: false,
            data: { oldpath: oldpath, newpath: newpath },
            success: function(response) {
                console.log(response);
            }
        });
    }
    that.rename = function(node, oldpath, newpath) {
        let success = false;
        $.ajax({
            url: "/rename",
            method: "POST",
            async: false,
            data: { oldpath: oldpath, newpath: newpath },
            success: function(response) {
                console.log(response);
                success =  response.status == "success";
            }
        });
        return success;
    }
    that.move = function(node, path, name) {
        return that.rename(node, path, name);
    }
    that.delete = function(node,path){
        let success = false;
        let msg = "";
        $.ajax({
            url: "/rename",
            method: "POST",
            async: false,
            data: { path: path },
            success: function(response) {
                console.log(response);
                msg = response.message;
                success =  response.status == "success";
            }
        });
        if(!success){
            $("#alert-modal").modal('show');
        }
        return success;
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

$(document).ready(function() {
    api = new Api(window.location.href.split("/hifi/html/inv.html")[0]);
    $("#inventory").jstree({
        core: {
            data: {
                url: function(node) {
                    let p = "";
                    if (node.hasOwnProperty("data")) {
                        if (node.data.hasOwnProperty("path")) {
                            p = node.data.path;
                        }
                    }
                    return "/" + p;
                },
                data: function(node) {
                    return { 'path': node.id };
                },
            },
            check_callback: function(op, node, parent, data, extra) {
                switch (op) {
                    case "rename_node":
                        let oldpath = node.data.path;
                        let newpath = oldpath;
                        if (oldpath.length == node.data.name) {
                            newpath = data;
                        } else {
                            newpath = newpath.substring(0, newpath.length - node.data.name.length) + data;
                        }
                        return api.rename(node, oldpath, newpath);
                        break;
                    case "delete_node":
                        return api.delete(node,node.data.path);
                        break;
                    default:
                        console.log(op, node.data.path, data);
                        break;
                }
            },
        },
        types: {
            "folder": { icon: "glyphicon glyphicon-folder-open" },
            "file": { icon: "glyphicon glyphicon-file", max_children: 0 },
            "fbx": { icon: "glyphicon glyphicon-file", max_children: 0 },
            "fst": { icon: "glyphicon glyphicon-file", max_children: 0 },
            "png": { icon: "glyphicon glyphicon-picture", max_children: 0 },
            "jpg": { icon: "glyphicon glyphicon-picture", max_children: 0 },
            "jpeg": { icon: "glyphicon glyphicon-picture", max_children: 0 },
            "bmp": { icon: "glyphicon glyphicon-picture", max_children: 0 },
            "trash": { icon: "glyphicon glyphicon-trash" }
        },
        search: { show_only_matches: true },
        sort: function(a, b) {
            a = this.get_node(a);
            b = this.get_node(b);
            if (a.type !== b.type) {
                if (a.type === "folder" || b.type == "folder") {
                    return a.type == "folder" ? -1 : 1;
                }
            }
            return a.text > b.text ? 1 : -1;
        },
        plugins: ["contextmenu", "sort", "types", "unique", "wholerow"],
    });
});