/**
 * core.gearth namespace
 * 
 * Defines classes related to the Google Earth web browser plugin
 * 
 * Dependencies:
 *     - core.util
 *     - core.geo
 */
if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function(ns) {
	// map of geoData.id -> kmlObject
	// allows us to only create KmlObjects once and then reuse them
	var kmlObjects = {};
	
	/**
	 * Retrieves the KmlObject linked to a GeoData object. KmlObject is 
	 * created for the GeoData if needed.
	 */
	var getKmlObject = function(ge, geoData) {
		var kmlObject = kmlObjects[geoData.id];
		if (!kmlObject) {
			kmlObject = ge.parseKml(geoData.getKmlString());
			kmlObjects[geoData.id] = kmlObject;
		}
		return kmlObject;
	};
	
	var GeAdapter = function(ge) {
		this.ge = ge;
	};
	GeAdapter.prototype = {

		add: function(geoData) {
			var kmlObject = getKmlObject(this.ge, geoData);
			ge.getFeatures().appendChild(kmlObject);
		},
		
		show: function(node) {
			
		},
		
		hide: function(node) {
			
		},
		
		showNodeInfo: function(node) {
			
		},
		
		flyToNode: function(node) {
			
		}
		
	};
	ns.GeAdapter = GeAdapter;
	
})(window.core.gearth);