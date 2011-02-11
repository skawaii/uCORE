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
	/**
	 * Class: KmlObjectStore
	 * 
	 * A repository of KmlObjects linked to GeoDataFeature objects. Also 
	 * handles creation of KmlObjects from GeoDataFeatures. Used by 
	 * GeAdapter.
	 */
	var KmlObjectStore = function(ge) {
		this.ge = ge;
		this.datastore = {};
	};
	KmlObjectStore.prototype = {
		
		createKmlObject: function(geoDataFeature) {
			return this.ge.parseKml(geoDataFeature.getKmlString());
		},
		
		getKmlObject: function(geoDataFeature) {
			var id = geoDataFeature.id;
			if (!(id in this.datastore)) {
				var kmlObject = this.createKmlObject(geoDataFeature);
				this.datastore[id] = kmlObject;
			}
			return this.datastore[id];
		},
		
		removeKmlObject: function(geoDataFeature) {
			delete this.datastore[geoDataFeature.id];
		}
		
	};
	ns.KmlObjectStore = KmlObjectStore;
	
	/**
	 * Class: GeAdapter
	 * 
	 * Interface between CORE event framework and Google Earth instance.
	 * Consumes CORE events and handles showing/hiding features on the map 
	 * accordingly.
	 */
	var GeAdapter = function(ge) {
		this.ge = ge;
		this.kmlObjectStore = new KmlObjectStore(this.ge);
	};
	GeAdapter.prototype = {

		add: function(geoDataFeature) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoDataFeature);
			this.ge.getFeatures().appendChild(kmlObject);
		},

		show: function(geoDataFeature) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoDataFeature);
			this.ge.getFeatures().appendChild(kmlObject);
		},

		hide: function(geoDataFeature) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoDataFeature);
			this.kmlObjectStore.removeKmlObject(geoDataFeature);
			this.ge.getFeatures().removeChild(kmlObject);
		},
		
		showNodeInfo: function(node, geoData) {
			
		},
		
		flyToNode: function(node, geoData) {
			
		}
		
	};
	ns.GeAdapter = GeAdapter;
	
})(jQuery, window.core.gearth);