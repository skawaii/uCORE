/**
 * Class: ObjectUtils
 * 
 * Utility functions related to javascript objects.
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

	var ObjectUtils = {
		
		/**
		 * Function: asArray
		 * 
		 * Creates an array from an object. If the object is an array, a new 
		 * array is created from the non-null elements. If the object is not 
		 * an array, a new single-element array is created containing the 
		 * object.
		 * 
		 * Parameters:
		 *   obj - Object.
		 *   
		 * Returns:
		 *   Array.
		 */
		asArray: function(obj) {
			var arr = [];
			if ($.isArray(obj)) {
				for (var i = 0; i < obj.length; i++) {
					if (obj[i]) {
						arr.push(obj[i]);
					}
				}
			}
			else if (obj) {
				arr.push(obj);
			}
			return arr;
		},

		/**
		 * Function: describe
		 * 
		 * Generates a string describing the properties of an object.
		 * 
		 * Parameters:
		 *   obj - Object. Required. Object to describe.
		 *   includeFunctions - Boolean. Optional. Defaults to false.
		 *         Determines if functions are included in the description.
		 *         
		 * Returns:
		 *   String. Description of the object containing type, name, and 
		 *   value of all members of the object.
		 */
		describe: function(obj, includeFunctions) {
			var str = "";
			for (var p in obj) {
				var t = typeof obj[p];
				if (t !== "function" || includeFunctions === true) {
					str += t + " " + p;
					if (t !== "function") {
						str += " = " + obj[p];
					}
					str += "\n";
				}
			}
			return str;
		},
		
		/**
		 * Function: describeFunctions
		 * 
		 * Generates a string describing the functions defined on an object.
		 * 
		 * Parameters:
		 *   obj - Object. Required. Object to describe.
		 * 
		 * Returns:
		 *   String. Listing of functions.
		 */
		describeFunctions: function(obj) {
			var lineEndingRegex = /[\n\r]/;
			var str = "";
			for (var p in obj) {
				var t = typeof obj[p];
				if (t == "function") {
					str += p + "\n";
				}
			}
			return str;			
		}

	};
	ns.ObjectUtils = ObjectUtils;

})(jQuery, window.core.util);