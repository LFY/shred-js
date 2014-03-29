// generates a module with RE-traced versions of the church builtins.
// Meant to take an existing trace as input.

_ = require("underscore");
shred = require("./shred");
church = require("./webchurch/church_builtins");
bt = require("./builtin_transformations");

// Begin module generation======================================================

synth_builtins = bt.synthesize_builtins(church, shred.reshred, []);
module.exports = synth_builtins.exports;
module.exports.__annotations__ = synth_builtins.exports.__annotations__;

module.exports._const = function (x) { 
    var cell = shred._const(x);
    return cell[0];
}

module.exports.dump_trace = shred.dump_trace

