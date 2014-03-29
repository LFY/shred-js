// generates a module with traced versions of the church builtins.

_ = require("underscore");
shred = require("./shred");
church = require("./webchurch/church_builtins");
bt = require("./builtin_transformations.js");

// Begin module generation======================================================

var untraced_primitives = [
        "iota", "make_list", "repeat", "map", "for_each", "reverse", // more constructive
        "filter", "take", "length", "sum", // more destructive
        "append", "flatten", // construct/destruct lists of lists
        "fold" // everything
            ];

module.exports.untraced_primitives = untraced_primitives;

synth_builtins = bt.synthesize_builtins(church, shred.shred, untraced_primitives);

module.exports = synth_builtins.exports;
module.exports.__annotations__ = synth_builtins.exports.__annotations__;

// Important stuff

module.exports._const = shred._const;
module.exports._if = shred._if;
module.exports.dump_trace = shred.dump_trace

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

// console.log("patching");
for (idx in untraced_primitives) {
    name = untraced_primitives[idx];
    if (name in replaced_functions) {
        addBuiltin(replaced_functions[name])
    } else {
        orig_dict = church.__annotations__[name];
        addBuiltin(orig_dict);
    }
}


