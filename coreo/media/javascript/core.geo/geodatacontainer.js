/**
 * Class: GeoDataContainer
 * 
 * SuperClass:
 *  <GeoDataFeature>
 * 
 * A container for GeoDataFeature objects (i.e. a KML document).
 * 
 * Namespace:
 *  core.geo
 *  
 * Properties:
 *  none
 *  
 * Functions:
 *  getFeatureById - (<GeoDataFeature>) Retrieves a GeoDataFeature object by 
 *                   its ID. Returns null if an object doesn't exist with the 
 *                   ID.
 *                   
 * Dependencies:
 *  - core.geo.GeoDataFeature
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	var GeoDataContainer = function(id) {
		ns.GeoDataFeature.call(this, null, id);
	};
	$.extend(GeoDataContainer.prototype, ns.GeoDataFeature.prototype, {
		getFeatureById: function(id) {}
	});
	ns.GeoDataContainer = GeoDataContainer;
})(jQuery, window.core.geo);