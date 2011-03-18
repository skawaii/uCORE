/**
 * Class: KmlObjectStore
 * 
 * A repository of KmlObjects linked to <GeoData> objects. Also 
 * handles creation of KmlObjects from <GeoData>.
 * 
 * Properties:
 *  ge - GEPlugin. Google Earth plugin instance. Used for creating 
 *        KmlObject instances.
 *  datastore - Object. Map where key is a <GeoData> ID and value is a KmlObject.
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
	/**
	 * Constructor: KmlObjectStore
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   ge - GEPlugin. Google Earth plugin instance used for creating 
	 *         KmlObjects.
	 */
	var KmlObjectStore = function(ge) {
		this.ge = ge;
		this.datastore = {};
	};
	KmlObjectStore.prototype = {
		
		/**
		 * Function: createKmlObject
		 * 
		 * Generates a new KmlObject representing a <GeoData> object.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. Object for which to create a KmlObject 
		 *        instance.
		 */
		createKmlObject: function(geoData) {
			return this.ge.parseKml(geoData.getKmlString());
		},

		/**
		 * Function: getKmlObject
		 * 
		 * Retrieves the KmlObject linked to a GeoData object. If the 
		 * record doesn't exist, a new KmlObject is created.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. Linked GeoData object.
		 */
		getKmlObject: function(geoData) {
			var id = geoData.id;
			if (!(id in this.datastore)) {
				var kmlObject = this.createKmlObject(geoData);
				this.datastore[id] = kmlObject;
			}
			return this.datastore[id];
		},
		
		/**
		 * Function: removeKmlObject
		 * 
		 * Removes the KmlObject from the repository linked to a GeoData 
		 * instance.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. Linked GeoData object.
		 */
		removeKmlObject: function(geoData) {
			delete this.datastore[geoData.id];
		}
		
	};
	ns.KmlObjectStore = KmlObjectStore;
})(window.core.gearth);