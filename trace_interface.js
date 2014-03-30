// Functions for asking simple things of and about traces.

_ = require("underscore");

// Contexts

// assumption: trace_buffer is occupied by the time we get to using this library.

shred_cxt = require("./shred"); 

trace_cxt = require("./traced_builtins");
retrace_cxt = require("./retraced_builtins");
deforest_cxt = require("./deforest_builtins");
slice_cxt = require("./sliced_builtins");

// Queries about statements of certain types====================================

var xrp_names = [
    "gaussian", 
    "uniform", 
    "uniform_draw", 
    "multinomial", 
    "flip", 
    "random_integer", 
    "sample_integer", 
    "gamma", 
    "beta", 
    "dirichlet"
];

var xrp_procs = _.map(xrp_names, function (s) { return "wrapped_" + s; });

function all_xrp_stmts(stmts) {
    return _.filter(stmts, function (s) { return _.contains(xrp_procs, s[1]); });
}

module.exports.all_xrp_stmts = all_xrp_stmts

function all_factors(stmts) {
    return _.filter(stmts, function (s) { return _.contains(["wrapped_factor"], s[1]); });
}

module.exports.all_factors = all_factors

// From webchurch/js_astify.js
var deep_copy = function(x) { return JSON.parse(JSON.stringify(x)); }

// Evaluating traces
function semantics_preamble(semantics_lib) {
    var preamble_str_pre = "__pr = require(\"./probabilistic/index\"); __pr.openModule(__pr); __int = require(\"./trace_interface\"); __ch = require(\"";
    
    var preamble_str_post = "\"); openModule(__ch);\n";

    return preamble_str_pre + semantics_lib + preamble_str_post;
}

function eval_trace(preamble, trace_string, postprocess) { eval(preamble + trace_string + postprocess); } 

// Passes=======================================================================

function reset_contexts() {
    shred_cxt.reset_var_ctr();
    shred_cxt.trace_buffer = [];
    slice_cxt.reset_slice_state();
}

// Initial trace================================================================

// from code generated by evaluate.js
function initial_trace(code) {

    reset_contexts();

    with(trace_cxt) {
        eval.call(this, code);
    }

    // new shred cxt
}

module.exports.initial_trace = initial_trace;

function deforestation() {

    var trace_str = shred_cxt.dump_trace();

    reset_contexts();
    with(deforest_cxt) {
        eval.call(this, trace_str);
    }

    // new shred cxt
}

module.exports.deforestation = deforestation;

function get_nonscoring_stmts() {

    var factors = all_factors(shred_cxt.trace_buffer);
    var xrps = all_xrp_stmts(shred_cxt.trace_buffer);

    var rel_vars = _.map(factors.concat(xrps), function (x) { return x[0]; });

    var trace_str = shred_cxt.dump_trace();

    reset_contexts();
    with(slice_cxt) {
        eval.call(this, trace_str);
    }

    bwd_slice_of(rel_vars);

    shred_cxt.trace_buffer = deep_copy(slice_cxt.state.slice);
}

module.exports.get_nonscoring_stmts = get_nonscoring_stmts;

function gen_slice(all_stmts, xrp_stmt) {

    reset_contexts();
    slice_cxt.set_slice_from(xrp_stmt[0], xrp_stmt[1], xrp_stmt[2]);

    with(slice_cxt) {
        var trace_str = shred_cxt.dump_stmt_list(all_stmts);
        eval.call(this, trace_str);
    }
    return deep_copy(slice_cxt.state.slice);
}

function get_slices() {

    var all_stmts = deep_copy(shred_cxt.trace_buffer);

    var xrps = all_xrp_stmts(shred_cxt.trace_buffer);

    var slices = [];
    // for (var i = 0; i < xrps.length; i++) {
    for (var i = 0; i < xrps.length; i++) {
        slices.push(gen_slice(all_stmts, xrps[i]));
    }

    // for (var i = 0; i < slices.length; i++) {
    //     console.log("SLICE");
    //     console.log(shred_cxt.dump_stmt_list(slices[i]));
    // }
    return slices;
}

module.exports.get_slices = get_slices;
 
// TODO:

// 0. Generation of an environment that contains all state variables.

// 1. Generation of a scoring function given a trace that has some
// wrapped_<xrp> and wrapped_factor statements. It is also against a global
// scope that includes all "state" variables.

// 2. The above function, generate_scorer, can also be used to generate slices.

// 3. Packaging up the scoring functions by associating them with certain
// subsets of XRP addresses. This is going to take some extra looking into
// (step 1: fork probabilistic-js)

