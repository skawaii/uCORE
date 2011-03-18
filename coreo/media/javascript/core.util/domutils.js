/**
 * Class: DomUtils
 * 
 * Utility functions related to DOM objects.
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

	var idSequence = new core.util.IdSequence("core-");

	var DomUtils = {
		
		/**
		 * Function: generateId
		 * 
		 * Creates a new unique DOM element ID.
		 * 
		 * Returns:
		 *   String. New ID unique to all existing DOM elements.
		 */
		generateId: function() {
			var prefix = "core-";
			var id = null;
			do {
				id = idSequence.nextId();
			} while ($("#" + id).length > 0);
			return id;
		},
		
		/**
		 * Function: isOrContains
		 * 
		 * Tests if a DOM element is the same as or contains another 
		 * DOM element.
		 * 
		 * Parameters:
		 *   container - DOM element.
		 *   contained - DOM element.
		 *   
		 * Returns:
		 *   true if "container" equals or contains "contained".
		 */
		isOrContains: function(container, contained) {
			return $.contains(container, contained.get(0))
				|| (container && contained && $(container).get(0) == $(contained).get(0));
		}
	};
	ns.DomUtils = DomUtils;
	
})(jQuery, window.core.util);