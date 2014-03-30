// Functions for asking simple things of and about traces.

_ = require("underscore");
shred = require("./shred");

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
    return _.filter(stmts, function (s) { return _.contains(xrp_procs, s); });
}

function all_factors(stmts) {
    return _.filter(stmts, function (s) { return _.contains(["wrapped_factor"], s); });
}

module.exports.all_xrp_stmts = all_xrp_stmts
module.exports.all_factors = all_factors

