var util = require("./util");
var trie = require("./trie");

function disp_addrval_string(addrs, vals) {
	console.log("Addr-vals:");
	console.log("\t" + JSON.stringify(addrs));
	console.log("\t" + JSON.stringify(vals));
}

function get_seq_addr_vals(trace) {

	var res_addrs = [];
	var res_vals = [];

	for (addr in trace.vars) {
		res_addrs.push(addr);
		res_vals.push(trace.vars[addr].val);
	}

	var res = [res_addrs, res_vals];
	return res;
}

WorldGraph.prototype.update_transitions = function update_transitions(addr_vals) {
    var addrs = addr_vals[0];
    var vals = addr_vals[1];

    var t = this.time;

    var trs = this.transitions;

    for (var i = 0; i < addrs.length; i++) {
        if (trs == undefined) {
            this.transitions = trie.trie_root(trie.list2trie(vals, "HALT_ADDR").ts)
        } else {
            var addrs_up_to = addrs.slice(0, i + 1);
            var vals_up_to = vals.slice(0, i + 1);
            var k = _.map(_.zip(addrs_up_to, vals_up_to), function (av) {
                return av[0] + ":" + av[1].toString();
            });

            trie.trie_update(k, function (old) { if (i < addrs.length - 1) { return addrs[i + 1]; } else { return "HALT"; }}, this.transitions);
        }
    }

	this.time++;
}

// Function to incorporate one trace. Worldgraph transitions are then based
// off of it.

WorldGraph.prototype.incorp_trace = function incorp_trace(input_trace) {

	var addr_vals = get_seq_addr_vals(input_trace);
	this.update_transitions(addr_vals);
}

WorldGraph.prototype.deepcopy = function deepcopy() {
	var copy_traces = [];
	for (var i = 0; i < this.traces.length; i++) {
		copy_traces.push(this.traces[i].deepcopy());
	}
}

function WorldGraph(initial_trace) {
	if (undefined == initial_trace) {
		this.traces = []; 
	} else {
		this.traces = [initial_trace.deepcopy()];
	}

	this.transitions = undefined;
	this.time = 0;

	for (i in this.traces) {
		this.incorp_trace(this.traces[i]);
	}
}

function new_worldgraph(first_trace) {
	return new WorldGraph(first_trace);
}

module.exports = {
	new_worldgraph : new_worldgraph
};
