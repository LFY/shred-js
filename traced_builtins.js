// generates a module with traced versions of the church builtins.

_ = require("underscore");
shred = require("./shred");
church = require("./webchurch/church_builtins");

// Begin module generation======================================================

module.exports.__annotations__ = {};

var untraced_primitives = ["map"];

var list_primitives = function (module) {
    var res = [];
    var non_primitives = untraced_primitives.concat(["__annotations__", "_const", "list_primitives", "args_to_list", "wrapped_mh_query", "wrapped_rejection_query", "wrapped_enumeration_query", "wrapped_eval", "read_file", "read_csv", "bootstrap", "update_list"]);
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
    console.log(name);
    orig_dict = church.__annotations__[name];

    shred_func = shred.shred(name, func);

    shred_dict = copyAnnotationDict(orig_dict);

    shred_dict.fn = shred_func;

    console.log(shred_dict);
    addBuiltin(shred_dict);
}

// Important stuff

module.exports._const = shred._const;
module.exports._if = shred._if;

// Patch things up

var _is_null = module.exports["is_null"];
var _pair = module.exports["pair"];
var _first = module.exports["first"];
var _rest = module.exports["rest"];

var recMap = function(f, xs) {
    return shred._if(_is_null(xs), 
                     function () { return shred._const([null]); },
                     function () { return _pair(f(_first(xs)), recMap(f, _rest(xs))); });
}

replaced_functions = {
    map : {
        name : 'map',
        desc : 'traced map',
        params : [{name : 'f'}, {name : 'xs'}],
        fn : recMap
    }
}

console.log("patching");
for (idx in untraced_primitives) {
    name = untraced_primitives[idx];
    if (name in replaced_functions) {
        addBuiltin(replaced_functions[name])
    } else {
        orig_dict = church.__annotations__[name];
        addBuiltin(orig_dict);
    }
}

module.exports.dump_trace = shred.dump_trace

