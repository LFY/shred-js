var util = require("./util")

/*
Callsite name management
*/

// Different version with simplified address naming.

var idstack = [""]
var curr_addr = ["top"]

function enterfn(id) { 
    idstack.push(idstack[idstack.length-1] + ":" + id) ;
    curr_addr.push(id);
}

function leavefn(id) { 
    idstack.pop();
    curr_addr.pop();
}

// Run length encoding.
function run_length(xs) {
    var loop = function(rst, curr, ct, acc) {
        // console.log([rst, curr, ct, acc]);
        if (rst.length == 0) {
            return acc.concat([[curr, ct]]);
        }

        var next_val = rst[0];

        var next_acc;
        var next_curr;
        var next_ct;

        if (next_val != curr) {
            next_curr = next_val;
            next_ct = 1;
            next_acc = acc.concat([[curr, ct]]);
        } else {
            next_curr = curr;
            next_ct = ct + 1;
            next_acc = acc;
        }

        return loop(rst.slice(1, rst.length), 
                next_curr,
                next_ct,
                next_acc);
    }

    return loop(xs.slice(1,xs.length), xs[0], 1, []);
}

// Hashing RLE'd addresses to a string. And you might as well store the mapping
// back to the original list.

function rl_addr_string_hash(rl_addr) {
    var res_str = "(";
    // console.log('rladdr');
    // console.log(rl_addr);
    for (var i = 0; i < rl_addr.length; i++) {
        var cell = rl_addr[i];
        var addr = cell[0];
        var len = cell[1];
        var addrlen = addr.toString() + "^" + len.toString();
        res_str += addrlen;
        if (i < rl_addr.length - 1) {
            res_str += ", ";
        } 
    }
    res_str += ")";

    return [res_str, rl_addr];
}


// Return the current structural name, as determined by the interpreter stack and loop counters of the trace:
function currentName(trace){
    // var id = idstack[idstack.length-1]
    // var loopnum = trace.loopcounters[id] || 0
    // trace.loopcounters[id] = loopnum + 1
	// return id + ":" + loopnum

    var res = [];
    var rl_addr = run_length(curr_addr);
    var name_map = rl_addr_string_hash(rl_addr);
    var addr_name = name_map[0];

    var loopnum = trace.loopcounters[addr_name] || 0;
    trace.loopcounters[addr_name] = loopnum + 1;

    var final_name = addr_name + "." + loopnum.toString(); 

    return final_name;
}

//Return the current structural name, as determined by the interpreter stack and loop counters of the trace:
// function currentName(trace){
//     var id = idstack[idstack.length-1]
//     var loopnum = trace.loopcounters[id] || 0
//     trace.loopcounters[id] = loopnum + 1
// 	return id + ":" + loopnum
// }


/*
Variables generated by ERPs
*/
function RandomVariableRecord(name, erp, params, val, logprob, structural, conditioned)
{
	this.name = name
	this.erp = erp
	this.params = params
	this.val = val
	this.logprob = logprob
	this.active = false //this is true if var is touched by traceUpdate (for keeping track of unused vars after MH proposal)
	this.structural = structural
	this.conditioned = conditioned
}

RandomVariableRecord.prototype.copy = function copy()
{
	return new RandomVariableRecord(this.name, this.erp, this.params, this.val,
									this.logprob, this.structural, this.conditioned)
}


/*
Execution trace generated by a probabilistic program.
Tracks the random choices made and accumulates probabilities.
*/
function RandomExecutionTrace(computation, init)
{
	init = (init == undefined ? "rejection" : init)
	this.computation = computation
	this.vars = {}
	this.varlist = []
	this.currVarIndex = 0
	this.logprob = 0.0
	this.newlogprob = 0.0
	this.oldlogprob = 0.0
	this.loopcounters = {}
	this.conditionsSatisfied = false
	this.returnValue = null
    this.structureIsFixed = false
    this.enumerate = false //Enumeration mode sets new ERP calls to start of domain.
    
	if (init == "rejection") {
		while (!this.conditionsSatisfied)
		{
			this.reset()
		}
	} else if (init == "nothing") {
        // literally do nothing except exist
    } else if (init=="enumerate") {
        this.enumerate=true
        this.traceUpdate()
        this.enumerate=false
        while (!this.conditionsSatisfied) {
            if (!this.nextEnumState()) //try going to next state.
            {this.reset()} //if we didn't find a satsfying state, reset.
        }
    } else if (init=="lessdumb") {
        //if(this.enumerate) throw error("how did enumerate get turned on?")
        this.traceUpdate()
        var i=1, esteps=1
        while (!this.conditionsSatisfied) {
            if(i%esteps == 0) {
                //reset and initialize randomly:
                this.reset()
                //do more enumeration after every restart:
                esteps += 10
            } else {
                if (!this.nextEnumState()) //try going to next state.
                {this.reset()} //if we didn't find a satsfying state, reset.
            }
            i += 1
        }
    }
}

RandomExecutionTrace.prototype.reset = function reset()
{
    this.vars = {}
    this.varlist = []
    this.traceUpdate()
}


RandomExecutionTrace.prototype.deepcopy = function deepcopy()
{
	var newdb = new RandomExecutionTrace(this.computation, false)
	newdb.logprob = this.logprob
	newdb.oldlogprob = this.oldlogprob
	newdb.newlogprob = this.newlogprob
	newdb.conditionsSatisfied = this.conditionsSatisfied
	newdb.returnValue = this.returnValue

	for (var i = 0; i < this.varlist.length; i++)
	{
		var newvar = this.varlist[i].copy()
		newdb.varlist.push(newvar)
		newdb.vars[newvar.name] = newvar
	}

	return newdb
}

//RandomExecutionTrace.prototype.freeVarNames = function freeVarNames(structural, nonstructural)
//{
//	structural = (structural == undefined ? true : structural)
//	nonstructural = (nonstructural == undefined ? true : nonstructural)
//	var names = []
//	for (var i=0, rec; rec = this.varlist[i]; i++)
//	{
//		if ()
//        {names.push(rec.name)}
//    }
//	return names
//}
RandomExecutionTrace.prototype.freeVarNames = function freeVarNames(pred)
{
	pred = (pred == undefined ? function(r){return true} : pred)
	var names = []
	for (var i=0, rec; rec = this.varlist[i]; i++)
	{
		if (!rec.conditioned && pred(rec)) {names.push(rec.name)}
    }
	return names
}

/*
Names of variables that this trace has that the other does not
*/
RandomExecutionTrace.prototype.varDiff = function varDiff(other)
{
	var arr = []
	for (var name in this.vars)
	{
		if (!other.vars[name])
			arr.push(name)
	}
	return arr
}

/*
Difference in log probability between this trace and the other
due to variables that this one has that the other does not
*/
RandomExecutionTrace.prototype.lpDiff = function lpDiff(other)
{
	return this.varDiff(other)
		.map(function(name) {return this.vars[name].logprob}.bind(this))
		.reduce(function(a,b) {return a+b}, 0)
}

/*
The singleton trace object
*/
var trace = null

/*
Run computation and update this trace accordingly
*/
RandomExecutionTrace.prototype.traceUpdate = function traceUpdate(structureIsFixed)
{
    structureIsFixed = (structureIsFixed===undefined?false:structureIsFixed)
    
	var origtrace = trace
	trace = this

	this.logprob = 0.0
	this.newlogprob = 0.0
	this.genlogprob = 0.0
	this.loopcounters = {}
	this.conditionsSatisfied = true
	this.currVarIndex = 0
    this.structureIsFixed = structureIsFixed
    
	// If updating this trace can change the variable structure, then we
	// clear out the flat list of variables beforehand
	if (!structureIsFixed) {
        var oldvarlist = this.varlist
        this.varlist=[]
    }
    
	// Run the computation, creating/looking up random variables
	this.returnValue = this.computation()

	// Clean up
	this.loopcounters = {}

    this.oldlogprob = 0.0
    if (!structureIsFixed) {
        // Clear out any random values that are no longer reachable
        for(var i=0,rec; rec = oldvarlist[i]; i++) {
            if(!rec.active) {
                this.oldlogprob += rec.logprob
                delete this.vars[rec.name]
            }
        }
    }
    
    //reset active record marks for next traceUpdate..
    for(var i=0, v; v=this.varlist[i]; i++) {v.active = false}
    
	// Reset the original singleton trace
	trace = origtrace
}

/*
Propose a random change to a random variable 'varname'
Returns a new sample trace from the computation and the
forward and reverse probabilities of this proposal
*/
RandomExecutionTrace.prototype.proposeChange = function proposeChange(varname)
{
	var nextTrace = this.deepcopy()
	var v = nextTrace.getRecord(varname)
	var propval = v.erp.proposal(v.val, v.params)
	var fwdPropLP = v.erp.logProposalProb(v.val, propval, v.params)
	var rvsPropLP = v.erp.logProposalProb(propval, v.val, v.params)
	v.val = propval
	v.logprob = v.erp.logprob(v.val, v.params)
    nextTrace.traceUpdate(!v.structural)
	fwdPropLP += nextTrace.newlogprob
	rvsPropLP += nextTrace.oldlogprob
	return [nextTrace, fwdPropLP, rvsPropLP]
}


/*
Looks up the value of a random variable.
Creates the variable if it does not already exist
*/
RandomExecutionTrace.prototype.lookup = function lookup(erp, params, isStructural, conditionedValue)
{
    var record = null
    var name = null
    
    // If structure of this trace is fixed get variable from flatlist, otherwise do slower structural lookup
    if (this.structureIsFixed) {
        record = this.varlist[this.currVarIndex]
    } else {
        name = currentName(this)
        record = this.vars[name]
        if (record) {
          if (record.erp !== erp) {
            record = null
          } else {
            if ( record.structural !== isStructural || 
                 // if this ERP compares supports but we fail the
                 // comparison, say that there's no record
                 (erp.compareSupport && !erp.compareSupport(params, record.params))
               ) {
              record = null;
            } 
          } 
        } 
    } 
    
	// If we didn't find the variable, create a new one
	if (!record)
	{
        if (this.enumerate && typeof erp.nextVal === 'function') { // If we are doing ennumeration init new vars to first val in domain:
            var val = erp.nextVal(null, params)
        } else {
            var val = (conditionedValue == undefined) ? erp.sample_impl(params) : conditionedValue
        }
		var ll = erp.logprob(val, params)
		this.newlogprob += ll
		if (conditionedValue == undefined) this.genlogprob += ll
		record = new RandomVariableRecord(name, erp, params, val, ll, isStructural, conditionedValue !== undefined)
		this.vars[name] = record
	}
	// Otherwise, reuse the variable we found, but check if its parameters/conditioning
	// status have changed
	else {
		record.conditioned = (conditionedValue != undefined)
		var hasChanges = false
		if (!util.arrayEquals(record.params, params))
		{
			record.params = params
			hasChanges = true
		}
		if (conditionedValue && conditionedValue != record.val)
		{
			record.val = conditionedValue
			record.conditioned = true
			hasChanges = true
		}
		if (hasChanges) {record.logprob = erp.logprob(record.val, record.params)}
    }
    
	// Finish up and return
    this.currVarIndex++
    this.logprob += record.logprob
    record.active = true
    if (!this.structureIsFixed){ this.varlist.push(record)}
    return record.val
}

// Simply retrieve the variable record associated with 'name'
RandomExecutionTrace.prototype.getRecord = function getRecord(name)
{
	return this.vars[name]
}

// Add a new factor into the log-likelihood of this trace
RandomExecutionTrace.prototype.addFactor = function addFactor(num)
{
	this.logprob += num
}

// Condition the trace on the value of a boolean expression
RandomExecutionTrace.prototype.conditionOn = function conditionOn(boolexpr)
{
	this.conditionsSatisfied &= boolexpr
}


//Next state for enumeration:
RandomExecutionTrace.prototype.nextEnumState = function nextEnumState() {
    this.enumerate=true
    var names = this.freeVarNames()
    
    var newval = null
    while (newval == null) {
        // if we are out of names it means we're done enumerating with no satisfying execution, return null.
        if (names.length == 0) {this.enumerate=false; return null}
        
        //otherwise get next var:
        var varname = names.pop()
        var v = this.getRecord(varname)
        
        //if the domain is enumerable, go to next value:
        if (typeof v.erp.nextVal === 'function') {
            var newval = v.erp.nextVal(v.val, v.params)
            if (newval == null) {
                v.val = v.erp.nextVal(null, v.params) //get first in domain
            } else {
                v.val = newval
            }
            v.logprob = v.erp.logprob(v.val, v.params)
        }
    }
    this.traceUpdate()
    this.enumerate=false
    return this
}


// Exported functions for interacting with the global trace

function lookupVariableValue(erp, params, isStructural, conditionedValue)
{
	if (!trace)
	{
		return conditionedValue || erp.sample_impl(params)
	}
	else
	{
		return trace.lookup(erp, params, isStructural, conditionedValue)
	}
}

function newTrace(computation, init)
{
	return new RandomExecutionTrace(computation, init)
}

function factor(num)
{
	if (trace)
		trace.addFactor(num)
}

function condition(boolexpr)
{
	if (trace)
		trace.conditionOn(boolexpr)
}


module.exports =
{
	enterfn: enterfn,
	leavefn: leavefn,
    currentName: currentName,
//    setmaxid: setmaxid,
	lookupVariableValue: lookupVariableValue,
	newTrace: newTrace,
	factor: factor,
	condition: condition
}
