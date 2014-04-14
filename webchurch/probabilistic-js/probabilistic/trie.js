var util = require("./util");

module.exports = {};

// data Trie k v = 
//      TrieRoot [Trie k v] | TrieLeaf v | TrieNode k [Trie k v]

// constructors

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

// predicates and accessors-----------------------------------------------------

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

// construction primitive-------------------------------------------------------

function list2trie(xs, v) {
    if (xs.length == 0) {
        return trie_leaf(v);
    } else {
        var rst = xs.slice(1,xs.length);
        var x = xs[0];
        return trie_node(x, [list2trie(rst, v)]);
    }
}


function test() {
    var test_trie = list2trie([0, 1, 2], "A");
    console.log(JSON.stringify(test_trie));
}

