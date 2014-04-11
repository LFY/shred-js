# shred-js

shred.js - lightweight tracing for the Church probabilistic programming language.

## This function...

	// shred: Transform a given primitive PROC with NUM_ARGS arguments into a
	// traced version that has name NAME
	//	
	function shred(name, proc) {
	    function call() {
	        var num_args = arguments.length;
	        var vars = [];
	        var vals = [];
	        for (var i = 0; i < num_args; i++) {
	            var arg = arguments[i];
	            vars.push(var_of(arg));
            	vals.push(val_of(arg));
	        }
        	var retval = proc.apply(this, vals);
        	var retvar = next_var();
        	add_stmt(retvar, name, vars);
        	return [retvar, retval];
    	}
    	return call;
	}


## + module transformers (introducing polymorphism to JS)

    var orig_prims = functions_i_care_aboutt(orig_module.exports);;list_primitives(orig_builtins);

    for (idx in orig_prims) {

        name = orig_prims[idx][0];
        func = orig_prims[idx][1];
        orig_dict = orig_module.__annotations__[name];

        // primitive_transformer: does anything: tracing, slicing, whatever
        transformed_func = primitive_transformer(name, func);
        transformed_dict = copyAnnotationDict(orig_dict);
        transformed_dict.fn = transformed_func;

        addBuiltin(module, transformed_dict);
    }

## + lifting if statements and constants

	function _if(c, t, e) {
	    var cvar = var_of(c);
	    var cval = val_of(c);

	    if (cval) {
	        return t();
	    } else {
	        return e();
	    }
	}

	function _const(cval) {
	    var new_cell = cell_ret(cval);
	    add_stmt(var_of(new_cell), "_const", [val_of(new_cell)]);
	    return new_cell;
	}

## = tracing, deforestation, slicing...

### Tracing semantics

	synth_builtins = bt.synthesize_builtins(church, shred.shred, untraced_primitives);

### Deforestation/allocation removal semantics

Compose a tracer (actually a re-tracer) with the builtins that use the original list primitives.

	synth_builtins = bt.synthesize_builtins(retraced, shred.reshred, []);

	replaced_functions = {
	    pair : church.__annotations__.pair,
	    list : church.__annotations__.list,
	
	    is_null : church.__annotations__.is_null,
	
	    first : church.__annotations__.first,
	    rest : church.__annotations__.rest,
	
	    second : church.__annotations__.second,
	    third : church.__annotations__.third,
	    fourth : church.__annotations__.fourth
	}

	for (k in replaced_functions) {
	    bt.addBuiltin(module, replaced_functions[k]);
	}

	// TODO: Deal with re-introduction of lists.

### Slicing semantics

Make the primitives transform a global "slice state" that tracks dependencies.

	function sliced(name, trace_proc) {
    	var call = function () {
        	var call_vars = [];
        	for (var i = 0; i < arguments.length; i++) {
            	call_vars.push(arguments[i]);
        	}
	
        	var retvar = trace_proc.apply(this, arguments);
	
        	var stmt = [retvar, name, call_vars];

			// atomic steps of dependency analyses	
        	advance_slice_state(retvar, name, call_vars);
        	retract_slice_state(retvar, name, call_vars);
	
        	return retvar;
    	}
    	return call;
	}

	synth_builtins = bt.synthesize_builtins(retraced, sliced, []);

## In general

One can lift function definitions as well to obtain (in JS, dynamically-)
type-directed partial evaluation or really any other source transformation:

[Typed Tagless Intepretations](http://okmij.org/ftp/tagless-final/)

The above is for statically typed languages, but one can _Poorly Write Lisp, err ML/Haskell In Any Language_.
In general the only requirements for doing this are:

	1. a programming language with functions as values
	2. ... 

(OK, being generous: mutation or polymorphism)

## Key idea: initial vs. final

How is it lightweight?

1. Didn't have to consider the subset of JS syntax that this works on.
2. Doesn't specify execution order or binding discipline. If you `shred` object methods it still Just Works.
3. With module transformations, cares minimally about the set of language primitives. It's pretty much parameterized on the language primitives, assuming some kind of CBV functional language (Scheme/ML-like) as a substrate.

This strategy again makes it clear why _anyone dealing with software should
study category theory_.

In category theory, given some space in which you are working, the definitions
of initial and final points are roughly the following, and their consequences
for software are:

1. _from_ an _initial_ point, there is one way to get _any other point_. In
other words your language implementation takes one type of input and you take
care of EVERYTHING THAT MIGHT HAPPEN TO IT (recursing on syntax cases,
variable binding, execution order, replicating how JS does
coercions.........................)

2. there is one way to get _to_ an _final_ point from _any other point_. In
other words your language implementation is more like a function in a useful
sense, it has many possible inputs and it really just does ONE THING, and if
you have to do more than ONE THING you write different language
implementations (which are all lightweight and composable)

Humans have finite resources (time, energy, etc) and there are already
_libraries (that most people call "languages")_ out there that do all of the
boring stuff so I recommend #2.
