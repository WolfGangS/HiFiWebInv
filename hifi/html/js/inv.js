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

$(document).ready(function() {
    api = new Api(window.location.href.split("/hifi/html/inv.html")[0]);
    $("#inventory").jstree({
        core: {
            data: {
                url: function(node) {
                    var p = "";
                    if(node.hasOwnProperty("a_attr")){
                        if(node.a_attr.hasOwnProperty("data-path")){
                            p = node.a_attr["data-path"];
                        }
                    }
                    return "/" + p;
                },
                data: function(node) {
                    return { 'path': node.id };
                },
            },
            check_callback: true,
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
            "trash" { icon: "glyphicon glyphicon-trash"}
        },
        search: { show_only_matches: true },
        sort: function(a,b){
            a = this.get_node(a);
            b = this.get_node(b);
            if(a.type !== b.type){
                if(a.type === "folder" || b.type == "folder"){
                    return a.type == "folder" ? -1 : 1;
                }
            }
            return a.text > b.text ? 1 : -1;
        },
        plugins: ["contextmenu", "sort", "types", "unique", "wholerow"],
    }).on('paste.jstree',function(e,data){
        console.log("PASTE",e,data);
    }).on('changed.jstree',function(e,data){
        console.log("CHANGED",e,data);
    }).on('copy_node.jstree',function(e,data){
        console.log("COPY_NODE",e,data);
    }).on('move_node.jstree',function(e,data){
        console.log("MOVE_NODE",e,data);
    }).on('rename_node.jstree',function(e,data){
        console.log("RENAME",e,data);
    }).on('delete_node.jstree',function(e,data){
        console.log("DELETE",e,data);
    }).on('create_node.jstree',function(e,data){
        console.log("CREATE",e,data);
    });
});