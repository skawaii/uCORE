/**
 * Class: Assert
 * 
 * Assertion functions. Each function tests evaluates some condition and 
 * raises an exception if the condition is false.
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
		/**
		 * Function: isTrue
		 * 
		 * Raises an exception if a condition is false.
		 * 
		 * Parameters:
		 *   condition - Boolean.
		 *   error - String or Error. exception to raise if condition is false.
		 */
		isTrue: function(condition, error) {
			if (condition == false)
				throw defaultIfNull(error, "Condition is false");
		},
		
		/**
		 * Function: hasMember
		 * 
		 * Raises an exception if an object doesn't have a named member.
		 * 
		 * Parameters:
		 *   o - Object.
		 *   memberName - String. Name of member.
		 *   error - String or Error.
		 */
		hasMember: function(o, memberName, error) {
			Assert.isTrue(o !== null && o !== undefined 
					&& memberName !== null && memberName !== undefined 
					&& memberName in o,
					defaultIfNull(error, "Object does not contain member '" 
							+ memberName + "'"));
		},
		
		/**
		 * Function: hasMember
		 * 
		 * Raises an exception if an object doesn't have a named function.
		 * 
		 * Parameters:
		 *   o - Object.
		 *   functionName - String.
		 *   error - String or Error.
		 */
		hasFunction: function(o, functionName, error) {
			error = defaultIfNull(error, 
					"Object does not contain function '" + functionName + "'");
			Assert.hasMember(o, functionName, error);
			Assert.same(typeof o[functionName], "function", error);
		},
		
		/**
		 * Function: notNull
		 * 
		 * Raises an exception if an object is null or undefined.
		 * 
		 * Parameters:
		 *   o - Object.
		 *   error - String or Error.
		 */
		notNull: function(o, error) {
			Assert.isTrue(o !== null && o !== undefined, 
					defaultIfNull(error, "Object is null"));
		},
		
		/**
		 * Function: same
		 * 
		 * Raises an exception if two objects are not identical.
		 * 
		 * Parameters:
		 *   a - Object.
		 *   b - Object.
		 *   error - String or Error.
		 */
		same: function(a, b, error) {
			Assert.isTrue(a === b, 
					defaultIfNull(error, "Objects are not the same"));
		},
		
		/**
		 * Function: type
		 * 
		 * Raises an exception if an object is not of an expected datatype.
		 * 
		 * Parameters:
		 *   o - Object.
		 *   expectedType - String.
		 *   error - String or Error.
		 */
		type: function(o, expectedType, error) {
			var actualType = typeof o;
			Assert.same(actualType, expectedType,
					defaultIfNull(error, 
							new TypeError("Expected object of type '" 
									+ expectedType + "', not '" 
									+ actualType + "'")));
		}
		
	};
	ns.Assert = Assert;
})(jQuery, window.core.util);