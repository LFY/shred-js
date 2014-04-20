
__pr = require("./webchurch/probabilistic-js/probabilistic/index"); __pr.openModule(__pr);
__ch = require("./traced_builtins"); __pr.openModule(__ch);
__int = require("./trace_interface");
__sh = require("./shred");

function nfqp() {
    __sh.reset_trace_state();
    enterfn(0);
    var call0 = _const(3.141592653589793);
    leavefn();
    var my_45pi = call0;
    var glp = function (mean, ssq, smp) {
        enterfn(14);
        var call14 = minus(smp, mean);
        leavefn();
        enterfn(15);
        var call15 = function (diff) {
            enterfn(1);
            var call1 = mult(diff, diff);
            leavefn();
            enterfn(2);
            var call2 = _const(2);
            leavefn();
            enterfn(3);
            var call3 = mult(call2, ssq);
            leavefn();
            enterfn(4);
            var call4 = div(call1, call3);
            leavefn();
            enterfn(5);
            var call5 = minus(call4);
            leavefn();
            enterfn(6);
            var call6 = _const(0.5);
            leavefn();
            enterfn(7);
            var call7 = _const(2);
            leavefn();
            enterfn(8);
            var call8 = log(call7);
            leavefn();
            enterfn(9);
            var call9 = log(my_45pi);
            leavefn();
            enterfn(10);
            var call10 = log(ssq);
            leavefn();
            enterfn(11);
            var call11 = plus(call8, call9, call10);
            leavefn();
            enterfn(12);
            var call12 = mult(call6, call11);
            leavefn();
            enterfn(13);
            var call13 = minus(call5, call12);
            leavefn();
            return call13;
        }(call14);
        leavefn();
        return call15;
    };
    var randint = function (l, h) {
        enterfn(16);
        var call16 = _const(1);
        leavefn();
        enterfn(17);
        var call17 = minus(h, l);
        leavefn();
        enterfn(18);
        var call18 = plus(call16, call17);
        leavefn();
        enterfn(19);
        var call19 = wrapped_random_integer(call18);
        leavefn();
        enterfn(20);
        var call20 = plus(l, call19);
        leavefn();
        return call20;
    };
    var index_45in = function (x, xs) {
        var loop = function (x, k, rst) {
            enterfn(21);
            var call21 = is_null(rst);
            leavefn();
            enterfn(29);
            var call29 = _if(call21, function () {
                return k;
            }, function () {
                enterfn(22);
                var call22 = first(rst);
                leavefn();
                enterfn(23);
                var call23 = is_equal(call22, x);
                leavefn();
                enterfn(28);
                var call28 = _if(call23, function () {
                    return k;
                }, function () {
                    enterfn(24);
                    var call24 = _const(1);
                    leavefn();
                    enterfn(25);
                    var call25 = plus(k, call24);
                    leavefn();
                    enterfn(26);
                    var call26 = rest(rst);
                    leavefn();
                    enterfn(27);
                    var call27 = loop(x, call25, call26);
                    leavefn();
                    return call27;
                });
                leavefn();
                return call28;
            });
            leavefn();
            return call29;
        };
        enterfn(30);
        var call30 = _const(0);
        leavefn();
        enterfn(31);
        var call31 = loop(x, call30, xs);
        leavefn();
        return call31;
    };
    var my_45length = function (xs) {
        enterfn(32);
        var call32 = is_null(xs);
        leavefn();
        enterfn(38);
        var call38 = _if(call32, function () {
            enterfn(33);
            var call33 = _const(0);
            leavefn();
            return call33;
        }, function () {
            enterfn(34);
            var call34 = _const(1);
            leavefn();
            enterfn(35);
            var call35 = rest(xs);
            leavefn();
            enterfn(36);
            var call36 = my_45length(call35);
            leavefn();
            enterfn(37);
            var call37 = plus(call34, call36);
            leavefn();
            return call37;
        });
        leavefn();
        return call38;
    };
    var data_45loop = function (n) {
        enterfn(39);
        var call39 = _const(51);
        leavefn();
        enterfn(40);
        var call40 = eq(n, call39);
        leavefn();
        enterfn(47);
        var call47 = _if(call40, function () {
            enterfn(41);
            var call41 = _const([null]);
            leavefn();
            return call41;
        }, function () {
            enterfn(42);
            var call42 = list(n, n);
            leavefn();
            enterfn(43);
            var call43 = _const(1);
            leavefn();
            enterfn(44);
            var call44 = plus(n, call43);
            leavefn();
            enterfn(45);
            var call45 = data_45loop(call44);
            leavefn();
            enterfn(46);
            var call46 = pair(call42, call45);
            leavefn();
            return call46;
        });
        leavefn();
        return call47;
    };
    enterfn(48);
    var call48 = _const(0);
    leavefn();
    enterfn(49);
    var call49 = data_45loop(call48);
    leavefn();
    var data = call49;
    enterfn(50);
    var call50 = map(first, data);
    leavefn();
    enterfn(51);
    var call51 = sum(call50);
    leavefn();
    enterfn(52);
    var call52 = my_45length(data);
    leavefn();
    enterfn(53);
    var call53 = div(call51, call52);
    leavefn();
    var xbar = call53;
    var make_45sample = function () {
        enterfn(54);
        var call54 = _const(0);
        leavefn();
        enterfn(55);
        var call55 = _const(10000);
        leavefn();
        enterfn(56);
        var call56 = wrapped_gaussian(call54, call55);
        leavefn();
        var alpha = call56;
        enterfn(57);
        var call57 = _const(0);
        leavefn();
        enterfn(58);
        var call58 = _const(10000);
        leavefn();
        enterfn(59);
        var call59 = wrapped_gaussian(call57, call58);
        leavefn();
        var wrapped_beta = call59;
        enterfn(60);
        var call60 = _const(0);
        leavefn();
        enterfn(61);
        var call61 = _const(10000);
        leavefn();
        enterfn(62);
        var call62 = wrapped_gaussian(call60, call61);
        leavefn();
        enterfn(63);
        var call63 = abs(call62);
        leavefn();
        var tau = call63;
        var gauss_45factor = function (m, v, x) {
            enterfn(64);
            var call64 = glp(m, v, x);
            leavefn();
            enterfn(65);
            var call65 = wrapped_factor(call64);
            leavefn();
            return call65;
        };
        enterfn(74);
        var call74 = map(function (xy) {
            enterfn(66);
            var call66 = first(xy);
            leavefn();
            enterfn(67);
            var call67 = minus(call66, xbar);
            leavefn();
            enterfn(68);
            var call68 = mult(wrapped_beta, call67);
            leavefn();
            enterfn(69);
            var call69 = plus(alpha, call68);
            leavefn();
            enterfn(70);
            var call70 = _const(1);
            leavefn();
            enterfn(71);
            var call71 = div(call70, tau);
            leavefn();
            enterfn(72);
            var call72 = second(xy);
            leavefn();
            enterfn(73);
            var call73 = gauss_45factor(call69, call71, call72);
            leavefn();
            return call73;
        }, data);
        leavefn();
        var y_45constrs = call74;
        enterfn(75);
        var call75 = _const(1);
        leavefn();
        enterfn(76);
        var call76 = _const(0.5);
        leavefn();
        enterfn(77);
        var call77 = expt(tau, call76);
        leavefn();
        enterfn(78);
        var call78 = div(call75, call77);
        leavefn();
        enterfn(79);
        var call79 = list(alpha, wrapped_beta, call78, tau);
        leavefn();
        var sample = call79;
        return sample;
    };
    enterfn(80);
    var call80 = make_45sample();
    leavefn();
    var sample = call80;
    return sample;
}

var tr = newTrace(nfqp, "nothing");
__sh.trace_cell.trace = tr;

tr.reset();

console.log(__sh.dump_dssa());
