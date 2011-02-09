/**
 * Unit-testing utility functions.
 * 
 * Dependencies:
 *     - qunit
 */

if (!window.core)
	window.core = {};
if (!window.core.testutils)
	window.core.testutils = {};
	
(function(ns) {

	var assertImplements = function() {
		var impl = arguments[0] || {};
		for (var i = 1; i < arguments.length; i++) {
			var supertype = arguments[i];
			for (var member in supertype) {
				ok(member in impl, "subclass contains member \"" + member + "\" defined in superclass");
				strictEqual(typeof impl[member], typeof supertype[member],
						"subclass member \"" + member + "\" has the same datatype as superclass's member");
				if (typeof supertype[member] === "function") {
					ok(hasFunctionBody(impl, member), "subclass implements superclass method \"" + member 
							+ "\" (method body isn't empty)");
				}
			}
		}
	};
	ns.assertImplements = assertImplements;
	
	var hasFunctionBody = function(o, functionName) {
		return functionName && o && functionName in o 
			? getFunctionImpl(o[functionName]).length > 0
			: false;
	};
	ns.hasFunctionBody = hasFunctionBody;
	
	var getFunctionImpl = function(fn) {
		if (typeof fn !== "function") {
			return "";
		}
		var fnDeclAndBody = "" + fn;
		var bodyBeginIdx = fnDeclAndBody.indexOf("{") + 1;
		var bodyEndIdx = fnDeclAndBody.lastIndexOf("}");
		return bodyEndIdx > bodyBeginIdx ? jQuery.trim(fnDeclAndBody.substring(bodyBeginIdx, bodyEndIdx)) : "";
	};
	ns.getFunctionImpl = getFunctionImpl;
	
})(core.testutils);