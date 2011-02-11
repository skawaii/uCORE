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
})(jQuery, window.core.gearth);