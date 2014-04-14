var util = require("./util");

// data Trie k v = 
//      TrieRoot [Trie k v] | TrieLeaf v | TrieNode k [Trie k v]

var start_trie = function () { return trie_root([]) };

function list2trie(xs, v) {
    if (xs == []) {
        return trie_leaf(v)
    } else {
        var xs = xs.slice(1,xs.length);
        var x = xs[0];
        return trie_node(x, [list2trie(xs, v)]);
    }
}


