/* global require */

var escodegen = require('escodegen');
var esprima = require('esprima');
var estraverse = require('escodegen/node_modules/estraverse');
var source_map = require('source-map');

var tokenize = require('./tokenize.js').tokenize;
var church_astify = require('./church_astify.js').church_astify;
var js_astify = require('./js_astify.js').church_tree_to_esprima_ast;

var precompile = require('./precompile.js').precompile;
var wctransform = require('./wctransform');
var util = require('./util.js');


// Note: escodegen zero-indexes columns, while JS evaluators and the Church
// tokenizer uses 1-indexed columns.

function get_js_to_church_site_map(src_map) {
	var site_map = {};
	var smc = new source_map.SourceMapConsumer(JSON.parse(JSON.stringify(src_map)));
	smc.eachMapping(function(m) {
                    // Some of the mappings map to undefined locations for some reason, ignore those
                    if (m.originalLine) {
                    site_map[m.generatedLine] = site_map[m.generatedLine] || {};
                    site_map[m.generatedLine][m.generatedColumn] = m.originalLine + ":" + m.originalColumn;
                    }
                    });
	return site_map;
}

function get_church_sites_to_tokens_map(tokens) {
	var map = {}
	for (var i = 0; i < tokens.length; i++) {
		map[tokens[i].start] = tokens[i];
	}
	return map;
}

function get_sites_from_stack(split_stack) {
	var sites = [];
	for (var i = 0; i < split_stack.length; i++) {
		// This makes the fairly safe assumption that the first run of consecutive
		// stack frames containing "<anonymous>" belong to the generated code
		if (split_stack[i].match("<anonymous>")) {
			var site = split_stack[i].match(/(\d+:\d+)[^:]*$/)[1].split(":");
			sites.push([site[0], parseInt(site[1]-1)]); //See above note on indexing.
		} else if (sites.length > 0) {
			break;
		}
	}
	return sites;
}

function evaluate(church_codestring,precomp,argstring) {
  sideEffects = [];
  gensymCount = 0;
  var tokens = tokenize(church_codestring);
	var result;    
   
   var js_ast;
  var preambled_transformed_js_ast;

  //flag for precompilation pass:
  if(precomp) {
    console.log("pre-compiling...");
    var js_precompiled = precompile(church_codestring);
    js_ast = esprima.parse(js_precompiled);
    preambled_transformed_js_ast = wctransform.probTransformAST(js_ast); //new wc transform
  } else {
    var church_ast = church_astify(tokens);
    js_ast = js_astify(church_ast);
    preambled_transformed_js_ast = wctransform.probTransformAST(js_ast); //new wc transform
  }
   
 var preamble = preambled_transformed_js_ast[0];
 var preamble_code = escodegen.generate(preamble)

 js_ast = preambled_transformed_js_ast[1];

  var code_and_source_map = escodegen.generate(js_ast, {"sourceMap": "whatever", "sourceMapWithCode": true, "format": {"compact" : false}});
    
  // console.log(preamble_code)
  console.log(code_and_source_map.code);
    
	// try {
    // var d1 = new Date()
    result = eval(preamble_code +  code_and_source_map.code);
    // var d2 = new Date()
    // console.log("transformed source run time: ", (d2.getTime() - d1.getTime()) / 1000)    
// 	} catch (err) {
//     
// 		var js_to_church_site_map = get_js_to_church_site_map(code_and_source_map.map);
//     var churchLines = church_codestring.split("\n");
// 		var church_sites_to_tokens_map = get_church_sites_to_tokens_map(tokens);
// 		var stack = err.stack.split("\n");
// 		var msg = stack[0].split(":");
//     
// 		var js_sites = get_sites_from_stack(stack.slice(1));
// 		var church_sites = [];
// 		for (var i = 0; i < js_sites.length; i++) {
// 			var js_site = js_sites[i];
// 			var church_site = js_to_church_site_map[js_site[0]] && js_to_church_site_map[js_site[0]][js_site[1]];
//       
// 			if(church_site){church_sites.push(church_site);};
// 		}
//     
//     //        console.log("js source ",code_and_source_map.code)
//     //        console.log("error stack ", msg)
//     //        console.log("js_sites ",js_sites)
//     //        console.log("source map ", code_and_source_map.map)
//     //        console.log("js to church site map ", js_to_church_site_map)
//     //        console.log("church sites ot tokens ", church_sites_to_tokens_map)
//     //        console.log("church_sites ", church_sites)
//     
//     // 		church_sites = church_sites.filter(function (x) {return x});
//     
//  		if (church_sites.length == 0) {
//             console.log("NO CHURCH SITES");
//  			throw err;
//  		} else {
//       
// 			var token = church_sites_to_tokens_map[church_sites[0]],
//           displayedMessage = err.message;
//       
//       // error sometimes matches on starting paren rather than the function name
//       // so seek to next token, which willbe the function name
//       var fntoken;
//       if (token.text == "(") {
//         var tokStart = token.start,
//             tokEnd = token.end,
//             tokeNum;
//         
//         for(var j = 0, jj = tokens.length; j < jj; j++) {
//           if (tokens[j].start == tokStart && tokens[j].end == tokEnd) {
//             tokeNum = j;
//           }
//         }
//         fntoken = tokens[tokeNum + 1];
//       }
// 
//       
//       if (msg[0] == "ReferenceError") {
//         token = fntoken?fntoken:token;
//         displayedMessage = token.text + " is not defined";
//         
//       }
//       
//       if (msg[0] == "TypeError") {
//         token = fntoken?fntoken:token;
//         displayedMessage = token.text + " is not a function";
//       } 
//       
//       if (msg[1].match(/functionName/)) {
//         token = fntoken?fntoken:token;
//         
//         displayedMessage = err.message.replace('<<functionName>>', token.text);
//       };
//       
// 			var e = util.make_church_error(msg[0], token.start, token.end, displayedMessage);
// 			e.stack = church_sites.map(function(x) {
//         var tok = church_sites_to_tokens_map[x];
//         return tok.start + "-" + tok.end;
//       }).join(",");
//       e.stackarray = church_sites.map(function(x) {return church_sites_to_tokens_map[x]})
//       
//  			throw e;
//  		}
// 	}
  
	return result;
}

module.exports = {
evaluate: evaluate,
format_result: util.format_result
};

// evaluate("(for-each display '(1 2 3 4 5)) (newline)", false, "");
