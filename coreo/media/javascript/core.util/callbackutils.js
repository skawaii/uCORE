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
		 *         "callback" function and optionally may contain a "context" property.
		 *   args - Array or Object. Arguments to pass to the callback function.
		 */
		invokeCallback: function(callback, args) {
			if (!callback) {
				return;
			}
			var fn = callback;
			var ctx = this;
			var fnParams = args;
			if (typeof fn !== "function") {
				if (typeof fn === "object" && "callback" in fn 
						&& typeof fn.callback === "function") {
					fn = fn.callback;
					if ("context" in callback) {
						ctx = callback.context;
					}
				}
				else {
					throw "Invalid callback - expected to be a function or an " +
							"object with a \"callback\" property that is a function";
				}
			}
			if (!jQuery.isArray(fnParams)) {
				fnParams = [fnParams];
			}
			return fn.apply(ctx, fnParams);
		}
	};
	ns.CallbackUtils = CallbackUtils;
})(jQuery, window.core.util);