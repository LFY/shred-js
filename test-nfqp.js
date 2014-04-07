
__pr = require("./webchurch/probabilistic-js/probabilistic/index"); __pr.openModule(__pr);
__ch = require("./traced_builtins"); __pr.openModule(__ch);
__int = require("./trace_interface");
sh = require("./shred");

function test_nfqp_0() {
    sh.reset_trace_state();
    var S = function () {
        enterfn(0);
        var call0 = wrapped_flip();
        leavefn();
        enterfn(5);
        var call5 = _if(call0, function () {
            enterfn(1);
            var call1 = _const([null]);
            leavefn();
            return call1;
        }, function () {
            enterfn(2);
            var call2 = _const(1);
            leavefn();
            enterfn(3);
            var call3 = S();
            leavefn();
            enterfn(4);
            var call4 = pair(call2, call3);
            leavefn();
            return call4;
        });
        leavefn();
        return call5;
    };
    enterfn(6);
    var call6 = S();
    leavefn();
    var sample = call6;
    return sample;
}

function test_nfqp_1() {
    sh.reset_trace_state();
    var S = function () {
        enterfn(0);
        var call0 = wrapped_flip();
        leavefn();
        enterfn(5);
        var call5 = _if(call0, function () {
            enterfn(1);
            var call1 = _const([null]);
            leavefn();
            return call1;
        }, function () {
            enterfn(2);
            var call2 = _const(1);
            leavefn();
            enterfn(3);
            var call3 = S();
            leavefn();
            enterfn(4);
            var call4 = pair(call2, call3);
            leavefn();
            return call4;
        });
        leavefn();
        return call5;
    };
    enterfn(6);
    var call6 = S();
    leavefn();
    enterfn(7);
    var call7 = S();
    leavefn();
    enterfn(8);
    var call8 = list(call6, call7);
    leavefn();
    var sample = call8;
    return sample;
}

var traces = [];

function next_trace() {
    var tr = newTrace(nfqp, undefined);
    traces.push(tr);
}

var wg = new_worldgraph();

function explore_worldgraph(wg, num_iter, proc) {

    for (var i = 0; i < num_iter; i++) {
        wg.incorp_trace(newTrace(proc, undefined));
    }
}

explore_worldgraph(wg, 10, test_nfqp_1);
console.log(JSON.stringify(wg.transitions));
