if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {

	var idSequence = new core.util.IdSequence("core-");

	var DomUtils = {
		
		/**
		 * Creates a new unique DOM element ID
		 */
		generateId: function() {
			var prefix = "core-";
			var id = null;
			do {
				id = idSequence.nextId();
			} while ($("#" + id).length > 0);
			return id;
		},
			
		isOrContains: function(container, contained) {
			return jQuery.contains(container, contained.get(0))
				|| (container && contained && $(container).get(0) == $(contained).get(0));
		}
	};
	ns.DomUtils = DomUtils;
	
})(jQuery, window.core.util);