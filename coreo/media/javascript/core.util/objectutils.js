if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {

	var ObjectUtils = {

		asArray: function(obj) {
			var arr = [];
			if (jQuery.isArray(obj)) {
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
		 * Generates a string describing the properties of an object
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
		}

	};
	ns.ObjectUtils = ObjectUtils;

})(jQuery, window.core.util);