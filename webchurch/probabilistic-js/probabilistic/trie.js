var util = require("./util");

module.exports = {};

// data Trie k v = 
//      TrieRoot [Trie k v] | TrieLeaf v | TrieNode k [Trie k v]

// Constructors-----------------------------------------------------------------

function trie_root(ts) {
    return { tag : "trie_root", ts : ts };
}

module.exports.trie_root = trie_root;

function trie_leaf(x) {
    return { tag : "trie_leaf", v : x };
}

module.exports.trie_leaf = trie_leaf;

function trie_node(x, rst) {
    return { tag : "trie_node", k : x, ts : rst };
}

module.exports.trie_node = trie_node;

var start_trie = function () { return trie_root([]) };

module.exports.start_trie = start_trie();

// Predicates and accessors-----------------------------------------------------

var _export = function (n, f) { module.exports[n] = f; };

var trie_rootp = function (t) { return (t.tag == "trie_root"); };
var trie_root_subtries = function (t) { return t.ts; };

var trie_leafp = function (t) { return (t.tag == "trie_leaf"); };
var trie_leaf_value = function (t) { return t.v; };

var trie_nodep = function (t) { return (t.tag == "trie_node"); };
var trie_node_head = function (t) { return t.k; };
var trie_node_subtries = function (t) { return t.ts; };

_export("trie_rootp", trie_rootp);
_export("trie_root_subtries", trie_root_subtries);
_export("trie_leafp", trie_leafp);
_export("trie_leaf_value", trie_leaf_value);
_export("trie_nodep", trie_nodep);
_export("trie_node_head", trie_node_head);
_export("trie_node_subtries", trie_node_subtries);

// Construction primitive-------------------------------------------------------

function list2trie(xs, v) {
    if (xs.length == 0) {
        return trie_leaf(v);
    } else {
        var rst = xs.slice(1,xs.length);
        var x = xs[0];
        return trie_node(x, [list2trie(rst, v)]);
    }
}

_export("list2trie", list2trie);

// Movement primitives----------------------------------------------------------

// trie_step: k -> Trie k v -> Trie k v
// think derivative of a data type

function trie_step(k, t) {
    if (trie_nodep(t)) {
        var y = trie_node_head(t);
        if (y == k) {
            var next = trie_root(trie_node_subtries(t));
            return next;
        } else {
            return undefined;
        }
    } else if (trie_rootp(t)) {
        var ss = trie_root_subtries(t);

        for (var i = 0; i < ss.length; i++) {
            // return the first matching node
            if (trie_nodep(ss[i]) && trie_node_head(ss[i]) == k) {
                return trie_step(k, ss[i]);
            }
        }
        return undefined;
    } else {
        return t;
    }
}

_export("trie_step", trie_step);

// lookup primitive-------------------------------------------------------------

function nullp(xs) { return xs.length == 0; }
function rest(xs) { return xs.slice(1, xs.length); }

function trie_lkup(key, trie) {
    // console.log(JSON.stringify([key,trie]));
    if (nullp(key)) {
        if (trie_leafp(trie)) { 
            // console.log("leaf-case2"); 
            return trie_leaf_value(trie); 
        }
        if (trie_rootp(trie)) { 
            // console.log("root-case2");
            var t = trie_root_subtries(trie)[0]; 
            return trie_lkup(key, t); 
        }
    } else {
        if (trie_leafp(trie)) {
            // console.log("leaf-case"); 
            return undefined; 
        }
        if (trie_rootp(trie) && nullp(trie_root_subtries(trie))) {
            // console.log("root-case");
            return undefined; 
        } else if (trie_rootp(trie)) {
            // console.log("root-case-1");
            var res = trie_lkup(key, trie_root_subtries(trie)[0]);
            if (res == undefined) {
                // console.log("undef-case");
                return trie_lkup(key, trie_root(rest(trie_root_subtries(trie))));
            } else {
                // console.log("def-case");
                return res;
            }
        } else if (trie_nodep(trie)) {
            // console.log("@ node");
            var y = trie_node_head(trie);
            var x = key[0];
            if (x == y) {
                // console.log("match");
                return trie_lkup(rest(key), trie_root(trie_node_subtries(trie)));
            } else {
                // console.log("mismatch");
                return undefined;
            }
        }
    }
}

_export("trie_lkup", trie_lkup);

// update primitives------------------------------------------------------------

function trie_write(k, v, t) {
    var i = 0;
    var curr = t;
    while(i < k.length) {
        var next = trie_step(k[i], curr);
        if (next == undefined) {
            curr.ts.unshift(trie_node(k[i], []));
        } else {
            curr = next;
            i++;
        }
    }

    if (curr.ts.length > 0 && v == curr.ts[0].v) { return t; }
    curr.ts.unshift(trie_leaf(v));
    return t;
}

_export("trie_write", trie_write);

function trie_update(k, f, t) {
    return trie_write(k, f(trie_lkup(k, t)), t);
}

_export("trie_update", trie_update);

// Tests------------------------------------------------------------------------

function test_tries() {
    var test_trie = list2trie([0, 1, 2], "A");
    console.log(JSON.stringify(test_trie));
    console.log(JSON.stringify(trie_lkup([0, 1, 2], test_trie)));

    console.log(test_trie);
    console.log(JSON.stringify(trie_write([0, 1], "C", test_trie)));

    console.log(JSON.stringify(trie_update([0,1], function (old) { return "D"; }, test_trie)));
    console.log(JSON.stringify(trie_update([0,1], function (old) { return "E"; }, test_trie)));
    console.log(JSON.stringify(trie_update([0,3], function (old) { return "F"; }, test_trie)));
}


