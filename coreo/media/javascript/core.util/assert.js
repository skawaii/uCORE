/**
 * Class: Assert
 * 
 * Assertion functions. Each function tests evaluates some condition and 
 * raises an exception if the condition is false.
 * 
 * Functions:
 *  - isTrue - Asserts a condition is true.
 *  - notNull - Asserts an object is not null or undefined.
 *  - same - Asserts two objects are identical (tests equality with ===).
 *  - type - Asserts an object is of a certain type.
 *  
 * Namespace:
 *  core.util
 *  
 * Dependencies:
 *  - jQuery
 */
if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	var defaultIfNull = function(val, defaultVal) {
		return val === undefined || val === null
				? defaultVal
				: val;
	};
	var Assert = {
		isTrue: function(condition, error) {
			if (condition == false)
				throw defaultIfNull(error, "Condition is false");
		},
		
		hasMember: function(o, memberName, error) {
			Assert.isTrue(o !== null && o !== undefined 
					&& memberName !== null && memberName !== undefined 
					&& memberName in o,
					defaultIfNull(error, "Object does not contain member '" 
							+ memberName + "'"));
		},
		
		hasFunction: function(o, functionName, error) {
			error = defaultIfNull(error, 
					"Object does not contain function '" + functionName + "'");
			Assert.hasMember(o, functionName, error);
			Assert.same(typeof o[functionName], "function", error);
		},
		
		notNull: function(o, error) {
			Assert.isTrue(o !== null && o !== undefined, 
					defaultIfNull(error, "Object is null"));
		},
		
		same: function(a, b, error) {
			Assert.isTrue(a === b, 
					defaultIfNull(error, "Objects are not the same"));
		},
		
		type: function(o, expectedType, error) {
			var actualType = typeof o;
			Assert.same(actualType, expectedType,
					defaultIfNull(error, 
							new TypeError("Expected object of type '" 
									+ expectedType + "', not '" 
									+ actualType + "'")));
		},
		
		
		
	};
	ns.Assert = Assert;
})(jQuery, window.core.util);