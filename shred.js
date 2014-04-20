// User-defined primitives for the variable and statement datatypes.

module.exports = {};

// TraceMH object to reference.
var trace_cell = {};
module.exports.trace_cell = trace_cell;

var debugp = false;
module.exports.debug_mode = debugp;

var debug_print = function (x) {
    if (debugp) { console.log(x); } 
}

var var_ctr = 0;

module.exports.reset_var_ctr = function () { var_ctr = 0; }

module.exports.reset_trace_state = function () {
    reset_dssa();
    while (module.exports.trace_buffer.length > 0) {
        module.exports.trace_buffer.pop();
    }
    module.exports.reset_var_ctr();
}

var seq_var_gen = function (arg) {
    if (arg == undefined) {
        var res_var = "X" + (var_ctr.toString());
        var_ctr += 1;
        return res_var;
    } else {
        var res_var = "X" + arg.toString();
        return res_var;
    }
}

var trace_buffer = [];
module.exports.trace_buffer = trace_buffer;

// Under construction-----------------------------------------------------------
// Cursor-based building of dynamic SSA

// var dynamic_ssa = [{br : 'top' t: [.....{ br: ["x3condvar" t : [...], f : [...]}...] } ... etc etc etc 
// dssa = uneval | [stmt] | {br : stmt t: dssa, f : dssa, join : stmt}

// The dynamic SSA state:
//
var dssa_buffer = {br : 'top', t : []};

// buffer: the entire thing
// cursor: the current dssa object in which evaluation is taking place:
// insertion_pt: where to insert statement in the current trace buffer.

var dssa_cursor = dssa_buffer.t;
var dssa_insertion_pt = 0;

// a reset function
var dssa_cursor_start = dssa_buffer.t;

var reset_dssa = function () {
    dssa_cursor = dssa_cursor_start;
    dssa_cursor_prev = dssa_cursor_start;
    dssa_insertion_pt = 0;
}

//  it is allowed three operations:

//  a. append a statement to the current trace, and also move itself to the
//  list of stmts to append to next.

//  b. push a branch (var + val) on the stack, which does the following:
//      i. append a branch object to the end of the current statement list.
//      ii. point to t or f.
//      iii. if they did not exist before, start a new array and move the cursor over to it.

//  c. join (in which case the cursor steps out of the current "branch") ->
//  there is a notion of "previous branch" hence previous cursor:
var dssa_cursor_prev = dssa_cursor;
var dssa_insertion_pt_prev  = dssa_insertion_pt_prev;

// start with convenience functions
var cursor_branchp = function (x) { return x.br != undefined; }
var cursor_stmtsp = function (x) { return (x instanceof Array); }

var dssa_append_stmt = function(resvar, proc, arg_vars) {
    // supposed to only read?
    if (dssa_cursor.length > dssa_insertion_pt + 1) {
        // do nothing
    } else {
        dssa_cursor.push([resvar, proc, arg_vars]);
    }
    dssa_insertion_pt++;
}

var dssa_push_branch = function(cond_var, cond_val) {
    var abstract_val = (cond_val) ? 't' : 'f';
    // No matter what, where to jump back to is always this statement list, at the NEXT position after (b/c of pushed branch).
    dssa_cursor_prev = dssa_cursor;
    dssa_insertion_pt_prev = dssa_insertion_pt + 1;
    // only approximate checks for now
    var branch_existsp = dssa_cursor.length > dssa_insertion_pt + 1; // assume it exists
    if (branch_existsp) {
        var br_obj = dssa_cursor[dssa_insertion_pt];
        var tf_existsp = br_obj[abstract_val] != undefined;
        if (tf_existsp) {
            dssa_cursor = br_obj[abstract_val];
        } else {
            br_obj[abstract_val] = [];
            dssa_cursor = br_obj[abstract_val];
            dssa_insertion_pt = 0;
        }
    } else {
        var br_obj = {};
        br_obj.br = cond_var;
        br_obj[abstract_val] = [];
        dssa_cursor.push(br_obj);

        dssa_cursor = br_obj[abstract_val];
        dssa_insertion_pt = 0;
    }
}

var dssa_join = function(resvar, proc, arg_vars) {
    dssa_cursor = dssa_cursor_prev;
    dssa_insertion_pt = dssa_insertion_pt_prev;
    dssa_append_stmt(resvar, proc, arg_vars);
}

// ///////////////////----------------------------------------------------------

var append_trace_buffer = function (resvar, proc, arg_vars) {
    trace_buffer.push([resvar, proc, arg_vars]);
};

function js_stmt_dump(stmt, scoped) {
    var lhsvar = stmt[0];
    var procname = stmt[1];
    var args = stmt[2];

    var nargs = args.length;

    var res = "";
    if (!scoped) {
        res += "var ";
    }
    res += lhsvar;
    res += " = " + procname + "(";

    for(var i = 0; i < nargs; i++) {
        res += args[i];
        if (i < nargs - 1) {
            res += ", ";
        } else {
            
        }
    }

    res += ");\n";

    return res;
}

// Shred Environment (required to be defined by the user)=======================

// next_var: Support different ways of incrementing variable counter (critical
// for aligning variable names using e.g., addr. scheme)

var next_var = seq_var_gen;

// add_stmt: Support different ways of adding to the trace (critical for doing
// things like trace graphs).

// var add_stmt = append_trace_buffer;
// var add_stmt = append_trace_buffer;
var add_stmt = dssa_append_stmt;

// dump_stmt: Output format of each trace statement. 

var dump_stmt = js_stmt_dump;

module.exports.dump_stmt = js_stmt_dump;

// Shred Functions==============================================================

// Basic datatype: Every val in the program augmented to a "cell": [var, val].

// Constructor

var make_cell = function (var_, val) { return [var_, val]; }
var cell_ret = function (val) { return [next_var(curr_addr()), val] }

// Accessors

var var_of = function (x) { if (x == undefined) { return x; } else { return x[0]; } }
var val_of = function (x) { if (x == undefined) { return x; } else { return x[1]; } }

// shred: Transform a given primitive PROC with NUM_ARGS arguments into a
// traced version that has name NAME

var curr_addr = function () {
    var res = undefined;
    if (trace_cell.trace != undefined) {
        res = currentName(trace_cell.trace);
    }
    return res;
}

function shred(name, proc) {
    function call() {
        debug_print("call " + name);
        debug_print(proc);
        debug_print(arguments);

        // Address
        var address = curr_addr();

        var num_args = arguments.length;

        var vars = [];
        var vals = [];
        for (var i = 0; i < num_args; i++) {
            var arg = arguments[i];
            debug_print("arg");
            debug_print(arg);
            vars.push(var_of(arg));
            vals.push(val_of(arg));
        }
            debug_print("vals");
            debug_print(vals);
            debug_print(proc);
        var retval = proc.apply(this, vals);
        debug_print("retval");
        debug_print(retval);

        var retvar = next_var(address);
        add_stmt(retvar, name, vars);
        return [retvar, retval];
    }
    return call;
}

module.exports.shred = shred

// Retracing====================================================================

function reshred(name, proc) {
    function call() {
        debug_print("reshred-call " + name);
        debug_print(proc);
        debug_print(arguments);

        var num_args = arguments.length;

        var vars = [];
        for (var i = 0; i < num_args; i++) {
            var arg = arguments[i];
            debug_print("arg");
            debug_print(arg);
            vars.push(arg);
        }
        var retvar = next_var();
        add_stmt(retvar, name, vars);
        return retvar;
    }
    return call;
}

module.exports.reshred = reshred

// A simple language
// const_: Transform a given regular JS value into a singular statement.

function const_(cval) {
    var new_cell = cell_ret(cval);
    add_stmt(var_of(new_cell), "_const", [val_of(new_cell)]);
    return new_cell;
}

module.exports._const = const_;

// Branches---------------------------------------------------------------------

// untraced_if: Trace through if-statements, ignoring them.

function untraced_if(c, t, e) {
    var cvar = var_of(c);
    var cval = val_of(c);

    if (cval) {
        return t();
    } else {
        return e();
    }
}


var bstack = [["top", true]];
var bcells = {};


function set_default_val(d, k, v) {
    if (d[k] == undefined) {
        d[k] = v;
        return;
    } else {
        return;
    }
}

// traced_if: almost an oxymoron

function deep_copy(obj) { return JSON.parse(JSON.stringify(obj)); }

function traced_if(c, t, e) {
    var cvar = var_of(c);
    var cval = val_of(c);

    bstack.push([cvar, cval]);
    dssa_push_branch(cvar, cval);

    var res_cell;
    var then_res_var = "uneval";
    var else_res_var = "uneval";

    set_default_val(bcells, cvar, {});

    bcells[cvar]["cond"] = deep_copy(bstack);

    set_default_val(bcells[cvar], "then", "uneval");
    set_default_val(bcells[cvar], "else", "uneval");
  
    if (cval) {
        res_cell = t();
        then_res_var = var_of(res_cell);
        bcells[cvar]["then"] = then_res_var;
    } else {
        res_cell = e();
        else_res_var = var_of(res_cell);
        bcells[cvar]["else"] = else_res_var;
    }

    bstack.pop();

    var addr = curr_addr();
    var res_var = "PHI_" + next_var(addr);
    var ret_cell = make_cell(res_var, val_of(res_cell));

    dssa_join(res_var, "ifte", [cvar, bcells[cvar]["then"], bcells[cvar]["else"]]);

    return ret_cell;
}

module.exports._if = traced_if;

// Trace output-----------------------------------------------------------------

function dump_stmt_list(stmts, opt) {
    res = "";
    var nstmts = stmts.length;

    for (var i = 0; i < nstmts; i++) {
        res += dump_stmt(stmts[i], opt);
    }

    return res;
}

module.exports.dump_stmt_list = dump_stmt_list

// dump_trace: Print the trace.
function dump_trace() {
    dump_stmt_list(trace_buffer, false);
    return res;
}

module.exports.dump_trace = dump_trace

// End Shred Functions==========================================================

// Tests =======================================================================
// Arithmetic language: Adding/subtracing numbers + comparing equality

// var add = shred("add", 2, function (x, y) { return x + y; });
// var sub = shred("sub", 2, function (x, y) { return x - y; });
// var eq = shred("=", 2, function (x, y) { return x == y; });
// var if_ = untraced_if;
// 
// // Tracing the sum function:
// 
// function sum_from(n) {
//     return if_(eq(n, const_(0)), 
//             function () { return const_(0); },
//             function () { return add(n, sum_from(sub(n, const_(1)))); });
// }
// 
// sum_from(const_(10));
// 
// console.log(dump_trace());
