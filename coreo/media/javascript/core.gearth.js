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

(function($, ns) {
	// map of geoData.id -> kmlObject
	// allows us to only create KmlObjects once and then reuse them
	var kmlObjects = {};

	/**
	 * Retrieves the KmlObject linked to a GeoData object. KmlObject is 
	 * created for the GeoData if needed.
	 */
	var getKmlObject2 = function(ge, geoData) {
		var kmlObject = kmlObjects[geoData.id];
		if (!kmlObject) {
			kmlObject = ge.parseKml(geoData.getKmlString());
			kmlObjects[geoData.id] = kmlObject;
		}
		return kmlObject;
	};

	var addGetKmlObjectFn = function(geoData) {
		if (!geoData.getKmlObject) {
			geoData.getKmlObject = function(ge) {
				if (!this._kmlObject) {
					this._kmlObject = ge.parseKml(this.getKmlString());
				}
				return this._kmlObject;
			};
		}
	};
	
	var getKmlObject = function(ge, geoData) {
		addGetKmlObjectFn(geoData);
		return geoData.getKmlObject(ge);
	};
	
	/**
	 * Creates a KmlObject from an XML DOM Node object
	 */
	var createKmlObject = function(ge, xmlNode) {
		var kmlString = core.util.getXmlString(xmlNode);
		var kmlObject = ge.parseKml(kmlString);
		return kmlObject;
	};
	
	var GeAdapter = function(ge) {
		this.ge = ge;
	};
	GeAdapter.prototype = {

		add: function(geoData) {
			var kmlObject = getKmlObject(this.ge, geoData);
			this.ge.getFeatures().appendChild(kmlObject);
		},

		show: function(node, geoData) {
			var kmlObject = createKmlObject(this.ge, node);
			this.ge.getFeatures().appendChild(kmlObject);
		},

		hide: function(node, geoData) {
			var kmlObject = createKmlObject(this.ge, node);
			this.ge.getFeatures().removeChild(kmlObject);
		},
		
		showNodeInfo: function(node, geoData) {
			
		},
		
		flyToNode: function(node, geoData) {
			
		}
		
	};
	ns.GeAdapter = GeAdapter;
	
})(jQuery, window.core.gearth);