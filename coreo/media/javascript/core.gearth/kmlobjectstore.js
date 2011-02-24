/**
 * Class: KmlObjectStore
 * 
 * A repository of KmlObjects linked to GeoData objects. Also 
 * handles creation of KmlObjects from GeoData. Used by 
 * GeController.
 * 
 * Properties:
 *  - ge <GEPlugin>
 *  - datastore Map where key is a GeoData ID and value is a KmlObject
 * 
 * Functions:
 *  - createKmlObject
 *  - getKmlObject
 *  - removeKmlObject
 * 
 * Namespace:
 *  core.gearth
 * 
 * Dependencies:
 *  None
 */

if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function(ns) {
	var KmlObjectStore = function(ge) {
		this.ge = ge;
		this.datastore = {};
	};
	KmlObjectStore.prototype = {

		createKmlObject: function(geoData) {
			return this.ge.parseKml(geoData.getKmlString());
		},

		getKmlObject: function(geoData) {
			var id = geoData.id;
			if (!(id in this.datastore)) {
				var kmlObject = this.createKmlObject(geoData);
				this.datastore[id] = kmlObject;
			}
			return this.datastore[id];
		},
		
		removeKmlObject: function(geoData) {
			delete this.datastore[geoData.id];
		}
		
	};
	ns.KmlObjectStore = KmlObjectStore;
})(window.core.gearth);