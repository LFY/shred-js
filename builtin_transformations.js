
function addBuiltin(module, dict) {
    var fWrapped = dict.fn;

    module.exports[dict.name] = fWrapped;
    module.exports.__annotations__[dict.name] = dict;
    return fWrapped;
}

module.exports.addBuiltin = addBuiltin

function synthesize_builtins(orig_builtins, primitive_transformer, untraced_primitives) {

    var module = {};
    module.exports = {};
    module.exports.__annotations__ = {};

    var list_primitives = function (module) {
        var res = [];
        var non_primitives = untraced_primitives.concat(["__annotations__", "_const", "list_primitives", "args_to_list", "wrapped_mh_query", "wrapped_rejection_query", "wrapped_enumeration_query", "wrapped_eval", "read_file", "read_csv", "bootstrap", "update_list", "dump_trace"]);
        for (name in module) {
            if (!_.contains(non_primitives, name)) {
                res.push([name, module[name]]);
            }
        }
        return res;
    }

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

    var orig_prims = list_primitives(orig_builtins);

    for (idx in orig_prims) {

        name = orig_prims[idx][0];
        func = orig_prims[idx][1];
        orig_dict = orig_builtins.__annotations__[name];

        transformed_func = primitive_transformer(name, func);

        transformed_dict = copyAnnotationDict(orig_dict);

        transformed_dict.fn = transformed_func;

        addBuiltin(module, transformed_dict);
    }

    return module;
}

module.exports.synthesize_builtins = synthesize_builtins
