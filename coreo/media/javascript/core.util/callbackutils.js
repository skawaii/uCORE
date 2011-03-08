/**
 * Class: CallbackUtils
 * 
 * Utility functions related to callbacks.
 * 
 * Namespace:
 *   core.util
 * 
 * Dependencies:
 *   - jQuery
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	var _invoke = function(callback, fnName, fnNameRequired, args) {
		if (callback) {
			if (args) {
				if (!jQuery.isArray(args)) {
					args = [args];
				}
			}
			else {
				args = [];
			}
			if (typeof callback === "function") {
				if (!fnNameRequired) {
					return callback.apply(this, args);
				}
			}
			else if (typeof callback === "object") {
				if (fnName) {
					if (typeof callback[fnName] === "function") {
						var ctx = callback;
						if ("context" in callback) {
							ctx = callback.context;
						}
						return callback[fnName].apply(ctx, args);
					}
				}
				else {
					throw "No function name specified";
				}
			}
			else {
				throw "Invalid callback - expected to be a function or an " +
						"object with a \"callback\" property that is a function";
			}
		}
		return undefined;
	};
	
	var CallbackUtils = {
		/**
		 * Function: invokeCallback
		 * 
		 * Invokes a callback function or object. If the callback is an object
		 * rather than a function, it should contain the following members:
		 * - callback - Function. Required. Will be invoked with provided 
		 *       arguments.
		 * - context - Object. Optional. Context used when invoking the 
		 *       callback function. 
		 * 
		 * Parameters:
		 *   callback - Function or Object. If an object, must contain a 
		 *         "callback" function and optionally may contain a "context" 
		 *         property.
		 *   args - Array or Object. Arguments to pass to the callback function.
		 *   fnName - String. Optional. Defaults to "callback". If callback 
		 *         parameter is an object, this is the name of the function 
		 *         within the object that will be invoked. 
		 */
		invokeCallback: function(callback, args, fnName) {
			return _invoke(callback, fnName ? fnName : "callback", false, args);
		},

		/**
		 * Function: invokeOptionalCallback
		 * 
		 * Invokes a callback function if and only if the callback parameter 
		 * is an object and it contains a named function.
		 * 
		 * Parameters:
		 *   callback - Object.
		 *   fnName - String. Name of the function.
		 *   args - Array or Object. Arguments to pass to the callback function
		 */
		invokeOptionalCallback: function(callback, fnName, args) {
			return _invoke(callback, fnName, true, args);
		}
	};
	ns.CallbackUtils = CallbackUtils;
})(jQuery, window.core.util);