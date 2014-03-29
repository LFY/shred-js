// generates a module with traced versions of the church builtins that also 
// perform allocation removal.

_ = require("underscore");
shred = require("./shred");
retraced = require("./retraced_builtins");
church = require("./webchurch/church_builtins");

// Begin module generation======================================================

// Deforestation on traces as composition of transformations on builtins
// deforest = orig_church_list_funcs . re_trace

// get the re-tracing primitives and apply the re-tracing transform again (it
// is idempotent)

synth_builtins = bt.synthesize_builtins(retraced, shred.reshred, []);
module.exports = synth_builtins.exports;
module.exports.__annotations__ = synth_builtins.exports.__annotations__;

// Same _const as before
module.exports._const = retraced._const;

// Use original church list functions on the trace statements, otherwise
// re-trace, thus recovering a significant portion of allocation removal.

// TODO: Deal with re-introduction of lists.

// First, re-introduction is not needed if we are dealing with
// straight line code, is_null results are not used non_trivially and the final
// value is not a list.

replaced_functions = {
    pair : church.__annotations__.pair,
    list : church.__annotations__.list,

    is_null : church.__annotations__.is_null,

    first : church.__annotations__.first,
    rest : church.__annotations__.rest,

    second : church.__annotations__.second,
    third : church.__annotations__.third,
    fourth : church.__annotations__.fourth
}

for (k in replaced_functions) {
    bt.addBuiltin(module, replaced_functions[k]);
}

module.exports.dump_trace = shred.dump_trace;
