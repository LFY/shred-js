var __pr = null;
try {
    __pr = require('probabilistic/index');
} catch (e) {
    __pr = require('./probabilistic/index');
}
__pr.openModule(__pr);
var __ch = null;
try {
    __ch = require('test_builtins');
} catch (e) {
    __ch = require('./test_builtins');
}
openModule(__ch);
var my_45pi = 3.141592653589793;
var glp = function (mean, ssq, smp) {
    enterfn(10);
    var call10 = minus(smp, mean);
    leavefn();
    enterfn(11);
    var call11 = function (diff) {
            enterfn(0);
            var call0 = mult(diff, diff);
            leavefn();
            enterfn(1);
            var call1 = mult(2, ssq);
            leavefn();
            enterfn(2);
            var call2 = div(call0, call1);
            leavefn();
            enterfn(3);
            var call3 = minus(call2);
            leavefn();
            enterfn(4);
            var call4 = log(2);
            leavefn();
            enterfn(5);
            var call5 = log(my_45pi);
            leavefn();
            enterfn(6);
            var call6 = log(ssq);
            leavefn();
            enterfn(7);
            var call7 = plus(call4, call5, call6);
            leavefn();
            enterfn(8);
            var call8 = mult(0.5, call7);
            leavefn();
            enterfn(9);
            var call9 = minus(call3, call8);
            leavefn();
            return call9;
        }(call10);
    leavefn();
    return call11;
};
var randint = function (l, h) {
    enterfn(12);
    var call12 = minus(h, l);
    leavefn();
    enterfn(13);
    var call13 = plus(1, call12);
    leavefn();
    enterfn(14);
    var call14 = wrapped_random_integer(call13);
    leavefn();
    enterfn(15);
    var call15 = plus(l, call14);
    leavefn();
    return call15;
};
var index_45in = function (x, xs) {
    var loop = function (x, k, rst) {
        return function () {
            enterfn(16);
            var call16 = is_null(rst);
            leavefn();
            return call16;
        }() ? k : function () {
            return function () {
                enterfn(17);
                var call17 = first(rst);
                leavefn();
                enterfn(18);
                var call18 = is_equal(call17, x);
                leavefn();
                return call18;
            }() ? k : function () {
                enterfn(19);
                var call19 = plus(k, 1);
                leavefn();
                enterfn(20);
                var call20 = rest(rst);
                leavefn();
                enterfn(21);
                var call21 = loop(x, call19, call20);
                leavefn();
                return call21;
            }();
        }();
    };
    enterfn(22);
    var call22 = loop(x, 0, xs);
    leavefn();
    return call22;
};
var my_45length = function (xs) {
    return function () {
        enterfn(23);
        var call23 = is_null(xs);
        leavefn();
        return call23;
    }() ? 0 : function () {
        enterfn(24);
        var call24 = rest(xs);
        leavefn();
        enterfn(25);
        var call25 = my_45length(call24);
        leavefn();
        enterfn(26);
        var call26 = plus(1, call25);
        leavefn();
        return call26;
    }();
};
var data_45loop = function (n) {
    return function () {
        enterfn(27);
        var call27 = eq(n, 51);
        leavefn();
        return call27;
    }() ? function () {
        return [null];
    }() : function () {
        enterfn(28);
        var call28 = list(n, n);
        leavefn();
        enterfn(29);
        var call29 = plus(n, 1);
        leavefn();
        enterfn(30);
        var call30 = data_45loop(call29);
        leavefn();
        enterfn(31);
        var call31 = pair(call28, call30);
        leavefn();
        return call31;
    }();
};
enterfn(32);
var call32 = data_45loop(0);
leavefn();
var data = call32;
enterfn(33);
var call33 = map(first, data);
leavefn();
enterfn(34);
var call34 = sum(call33);
leavefn();
enterfn(35);
var call35 = my_45length(data);
leavefn();
enterfn(36);
var call36 = div(call34, call35);
leavefn();
var xbar = call36;
enterfn(55);
var call55 = wrapped_mh_query(function () {
        enterfn(37);
        var call37 = wrapped_gaussian(0, 10000);
        leavefn();
        var alpha = call37;
        enterfn(38);
        var call38 = wrapped_gaussian(0, 10000);
        leavefn();
        var wrapped_beta = call38;
        enterfn(39);
        var call39 = wrapped_gaussian(0, 10000);
        leavefn();
        enterfn(40);
        var call40 = abs(call39);
        leavefn();
        var tau = call40;
        var gauss_45factor = function (m, v, x) {
            enterfn(41);
            var call41 = glp(m, v, x);
            leavefn();
            enterfn(42);
            var call42 = factor(call41);
            leavefn();
            return call42;
        };
        enterfn(50);
        var call50 = map(function (xy) {
                enterfn(43);
                var call43 = first(xy);
                leavefn();
                enterfn(44);
                var call44 = minus(call43, xbar);
                leavefn();
                enterfn(45);
                var call45 = mult(wrapped_beta, call44);
                leavefn();
                enterfn(46);
                var call46 = plus(alpha, call45);
                leavefn();
                enterfn(47);
                var call47 = div(1, tau);
                leavefn();
                enterfn(48);
                var call48 = second(xy);
                leavefn();
                enterfn(49);
                var call49 = gauss_45factor(call46, call47, call48);
                leavefn();
                return call49;
            }, data);
        leavefn();
        var y_45constrs = call50;
        enterfn(51);
        var call51 = expt(tau, 0.5);
        leavefn();
        enterfn(52);
        var call52 = div(1, call51);
        leavefn();
        enterfn(53);
        var call53 = list(alpha, wrapped_beta, call52, tau);
        leavefn();
        var sample = call53;
        enterfn(54);
        var call54 = condition(true);
        leavefn();
        call54;
        return sample;
    }, 10, 100);
leavefn();
var samples = call55;
console.log(samples);
