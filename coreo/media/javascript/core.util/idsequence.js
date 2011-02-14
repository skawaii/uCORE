if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	/**
	 * IdSequence
	 */
	var IdSequence = function(prefix) {
		this.prefix = prefix;
		this.idCounter = 0;
	};
	IdSequence.prototype = {
		nextId: function() {
			return "" + this.prefix + this.idCounter++;
		}
	};
	ns.IdSequence = IdSequence;
})(jQuery, window.core.geo);