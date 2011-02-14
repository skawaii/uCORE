/**
 * Class: CallbackUtils
 * 
 * Utility functions related to callbacks.
 * 
 * Functions:
 *  - invokeCallback
 *  
 * Dependencies:
 *  - jQuery
 */
if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	var CallbackUtils = {
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