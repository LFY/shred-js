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

function retract_slice_state(lhsv, procname, rhsvs) {
    function remove_elt(items, item) {
        while (items.indexOf(item) !== -1) {
            items.splice(items.indexOf(item), 1);
        }
        return items
    }

    var call = function(deplist, k) {
        if (deplist == []) { return k([]); } else {
            console.log(deplist)
            if (_.contains(deplist, lhsv)) {
                SLICE_STATE.slice.push([lhsv, procname, rhsvs]);
                // var next_deplist = _.filter(deplist, function (x) { x != lhsv });
                for (var i = 0; i < rhsvs.length; i++) {
            console.log("PUSH");
                    if (!(_.contains(deplist, rhsvs[i]))) {
                        deplist.push(rhsvs[i]);
                    }
                }
                return k(deplist);
            } else {
                return k(deplist);
            }
        }
    }
    var curr_idx = SLICE_STATE.depk.length - 1;
    var next_step = function (deplist) {
        return call(deplist, SLICE_STATE.depk[curr_idx]);
    };
    SLICE_STATE.depk.push(next_step);
}
function set_slice_from(retv, procname, callvs) { 
    SLICE_STATE.slice_variables = [retv]; 
    SLICE_STATE.slice = [[retv, procname, callvs]];
}

function bwd_slice_of(v, procname, callvs) {
    SLICE_STATE.depk[SLICE_STATE.depk.length - 1]([v]);
}
function dump_slice() { 
    return shred.dump_stmt_list(SLICE_STATE.slice); 
}

function fwdsliced(name, trace_proc) {
    var call = function () {
        var call_vars = [];
        for (var i = 0; i < arguments.length; i++) {
            call_vars.push(arguments[i]);
        }

        var retvar = trace_proc.apply(this, arguments);

        var stmt = [retvar, name, call_vars];

        advance_slice_state(retvar, name, call_vars);
        retract_slice_state(retvar, name, call_vars);

        return retvar;
    }
    return call;
}
synth_builtins = bt.synthesize_builtins(retraced, fwdsliced, []);
module.exports = synth_builtins.exports;
module.exports.__annotations__ = synth_builtins.exports.__annotations__;
// Same _const as before
module.exports._const = retraced._const;
module.exports.dump_trace = shred.dump_trace;
module.exports.set_slice_from = set_slice_from;
module.exports.bwd_slice_of = bwd_slice_of;
module.exports.dump_slice  = dump_slice;
