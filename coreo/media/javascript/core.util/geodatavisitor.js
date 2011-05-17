/**
 * Class: GeoDataVisitor
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
	/**
	 * Constructor: GeoDataVisitor
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   cfg - Object. Contains the following members:
	 *         link - Function. Invoked for LinkGeoData instances.
	 *         linkLibrary - Function. Invoked for LinkLibraryGeoData instances.
	 */
	var GeoDataVisitor = function(cfg) {
		return {
			/**
			 * Function: visit
			 * 
			 * Parameters:
			 *   geodata - <GeoData>.
			 */
			visit: function(geodata) {
				if (cfg && typeof cfg === "object"
					&& geodata && typeof geodata === "object") {
					if (typeof geodata.getLinkLibrary === "function") {
						if (cfg.linkLibrary && typeof cfg.linkLibrary === "function") {
							cfg.linkLibrary.call(cfg.linkLibrary, geodata);
						}
					}
					else if (typeof geodata.getCoreLink === "function") {
						if (cfg.link && typeof cfg.link === "function") {
							cfg.link.call(cfg.link, geodata);
						}
					}
				}
			}
		};
	};
	ns.GeoDataVisitor = GeoDataVisitor;
})(jQuery, window.core.util);