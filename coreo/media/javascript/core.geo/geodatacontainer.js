if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	/**
	 * GeoDataContainer
	 * 
	 * Extends GeoDataFeature. A container for GeoDataFeature objects (i.e. KML document).
	 * 
	 * Methods:
	 *
	 *     getFeatureById():
	 *         Retrieves a GeoDataFeature object by its ID.
	 *         
	 *         Parameters:
	 *             None
	 *         Return:
	 *             GeoDataFeature. Returns null if an object doesn't exist with the ID.
	 */
	var GeoDataContainer = function(id) {
		GeoDataFeature.call(this, null, id);
	};
	$.extend(GeoDataContainer.prototype, GeoDataFeature.prototype, {
		getFeatureById: function(id) {}
	});
	ns.GeoDataContainer = GeoDataContainer;
})(jQuery, window.core.geo);