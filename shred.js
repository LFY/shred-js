// User-defined primitives for the variable and statement datatypes.

var var_ctr = 0;
var seq_var_gen = function () {
    var res_var = "X" + (var_ctr.toString());
    var_ctr += 1;
    return res_var;
}

var trace_buffer = [];
var append_trace_buffer = function (resvar, proc, arg_vars) {
    trace_buffer.push([resvar, proc, arg_vars]);
}

function simple_stmt_dump(stmt) {
    var lhsvar = stmt[0];
    var procname = stmt[1];
    var args = stmt[2];

    var nargs = args.length;

    var res = "";
    res += lhsvar;
    res += " <- " + procname + "(";

    for(var i = 0; i < nargs; i++) {
        res += args[i];
        if (i < nargs - 1) {
            res += ", ";
        } else {
            
        }
    }

    res += ")\n";

    return res;
}

// Shred Environment (required to be defined by the user)=======================

// next_var: Support different ways of incrementing variable counter (critical
// for aligning variable names using e.g., addr. scheme)

var next_var = seq_var_gen;

// add_stmt: Support different ways of adding to the trace (critical for doing
// things like trace graphs).

var add_stmt = append_trace_buffer;

// dump_stmt: Output format of each trace statement. 

var dump_stmt = simple_stmt_dump;

// Shred Functions==============================================================

// Basic datatype: Every val in the program augmented to a "cell": [var, val].

// Constructor

var make_cell = function (var_, val) { return [var_, val]; }
var cell_ret = function (val) { return [next_var(), val] }

// Accessors

var var_of = function (x) { return x[0]; }
var val_of = function (x) { return x[1]; }

// shred: Transform a given primitive PROC with NUM_ARGS arguments into a
// traced version that has name NAME

function shred(name, num_args, proc) {
    function call() {
        var vars = [];
        var vals = [];
        for (var i = 0; i < num_args; i++) {
            var arg = arguments[i];
            vars.push(var_of(arg));
            vals.push(val_of(arg));
        }
        var retval = proc.apply(this, vals);
        var retvar = next_var();
        add_stmt(retvar, name, vars);
        return [retvar, retval];
    }
    return call;
}

// const_: Transform a given regular JS value into a singular statement.

function const_(cval) {
    var new_cell = cell_ret(cval);
    add_stmt(var_of(new_cell), "const", [val_of(new_cell)]);
    return new_cell;
}

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

// dump_trace: Print the trace.
function dump_trace() {
    res = "";
    var nstmts = trace_buffer.length;

    for (var i = 0; i < nstmts; i++) {
        res += dump_stmt(trace_buffer[i]);
    }

    return res;
}



// End Shred Functions==========================================================


// Tests =======================================================================
// Arithmetic language: Adding/subtracing numbers + comparing equality

var add = shred("add", 2, function (x, y) { return x + y; });
var sub = shred("sub", 2, function (x, y) { return x - y; });
var eq = shred("=", 2, function (x, y) { return x == y; });
var if_ = untraced_if;

// Tracing the sum function:

function sum_from(n) {
    return if_(eq(n, const_(0)), 
            function () { return const_(0); },
            function () { return add(n, sum_from(sub(n, const_(1)))); });
}

sum_from(const_(10));

console.log(dump_trace());