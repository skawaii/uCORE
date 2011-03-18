/**
 * Class: IdSequence
 * 
 * Generates a sequence of IDs.
 * 
 * Properties:
 *   prefix - String. Prefix of generated IDs.
 *   idCounter - Number. Incremented for each ID.
 * 
 * Namespace:
 *   core.util
 * 
 * Dependencies:
 *   none
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function(ns) {
	/**
	 * Constructor: IdSequence
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   prefix - String. Prefix of generated IDs.
	 */
	var IdSequence = function(prefix) {
		this.prefix = prefix;
		this.idCounter = 0;
	};
	IdSequence.prototype = {
		/**
		 * Function: nextId
		 * 
		 * Generates a new ID.
		 * 
		 * Returns:
		 *   String. New ID.
		 */
		nextId: function() {
			return "" + this.prefix + this.idCounter++;
		}
	};
	ns.IdSequence = IdSequence;
})(window.core.util);