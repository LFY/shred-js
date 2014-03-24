// generates a module with traced versions of the church builtins.

_ = require("underscore");
shred = require("./shred");
church = require("./webchurch/church_builtins");

// Begin module generation======================================================

module.exports.__annotations__ = {};

var list_primitives = function (module) {
    var res = [];
    var non_primitives = ["__annotations__", "_const", "list_primitives", "args_to_list", "wrapped_mh_query", "wrapped_rejection_query", "wrapped_enumeration_query", "wrapped_eval", "read_file", "read_csv", "bootstrap", "update_list"];
    for (name in module) {
        if (!_.contains(non_primitives, name)) {
            res.push([name, module[name]]);
        }
    }
    return res;
}

var addBuiltin = function(dict) {
  var fWrapped = dict.fn;
  
  module.exports[dict.name] = fWrapped;
  module.exports.__annotations__[dict.name] = dict;
  return fWrapped;
};

// From webchurch/js_astify.js
var deep_copy = function(x) { return JSON.parse(JSON.stringify(x)); }

var copyAnnotationDict = function(dict) {
    res = {}
    res.name = dict.name
    res.alias = dict.alias
    res.params = deep_copy(dict.params)
    res.fn = "NYI"
    return res
}

var churchprims = list_primitives(church);

for (idx in churchprims) {

    name = churchprims[idx][0];
    func = churchprims[idx][1];
    orig_dict = church.__annotations__[name];

    shred_func = shred.shred(name, orig_dict.params.length, func);

    shred_dict = copyAnnotationDict(orig_dict);

    shred_dict.fn = shred_func;

    console.log(shred_dict);
    addBuiltin(shred_dict);
}

