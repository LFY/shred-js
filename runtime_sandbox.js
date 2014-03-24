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

console.log(wrapped_random_integer(5));
console.log(wrapped_random_integer(5));
console.log(wrapped_random_integer(5));
console.log(wrapped_random_integer(5));
console.log(wrapped_random_integer(5));
