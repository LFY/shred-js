
__pr = require("./webchurch/probabilistic-js/probabilistic/index"); __pr.openModule(__pr);
__ch = require("./traced_builtins"); __pr.openModule(__ch);
__int = require("./trace_interface");
sh = require("./shred");

function nfqp() {
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

var tr = newTrace(nfqp, undefined);
console.log(tr.vars);
var wg = new_worldgraph(tr);
console.log(JSON.stringify(wg.transitions));