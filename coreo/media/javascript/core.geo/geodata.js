/**
 * Class: GeoData
 * 
 * Geospatially-referenced data (i.e. a Placemark element in a KML document).
 * Represents a node in a tree structure. This node can have many children, 
 * but only one parent.
 * 
 * Namespace:
 *  core.geo
 * 
 * Dependencies:
 *  - jQuery
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {

	var GeoData = function(id) {
		this.id = id;
	};
	GeoData.prototype = {
		getParent: function() {},
		iterateChildren: function(callback) {},
		getChildById: function(id) {},
		getKmlString: function() {}
	};
	ns.GeoData = GeoData;

})(jQuery, window.core.geo);