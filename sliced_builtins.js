// generates a module with traced versions of the church builtins that also 
// perform slicing.
//

_ = require("underscore");
shred = require("./shred");
retraced = require("./retraced_builtins");
church = require("./webchurch/church_builtins");

// Begin module generation======================================================

// Slicing as state-transforming semantics of re-trace statmenets.

var SLICE_START_VAR = "";
var SLICE_STATE = {
    slice_variables : [],
    slice : [],
    depk : [function (x) { return x; }]
}

function advance_slice_state(lhsv, procname, rhsvs) {
    var in_slice = false;
    for (var i = 0; i < rhsvs.length; i++) {
        if (_.contains(SLICE_STATE.slice_variables, rhsvs[i])) {
            in_slice = true;
            break;
        }
    }

    if (in_slice) {
        SLICE_STATE.slice_variables.unshift(lhsv);
        SLICE_STATE.slice.push([lhsv, procname, rhsvs]);
    }
}
