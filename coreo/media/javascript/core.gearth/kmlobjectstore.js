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
 *  - jQuery
 *  - core.ge.KmlObjectCreator
 */

if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function(ns) {
	var KmlObjectCreator = core.gearth.KmlObjectCreator;
	if (!KmlObjectCreator)
		throw "Dependency not found: core.gearth.KmlObjectCreator";
	
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
		this.kmlObjectCreator = new KmlObjectCreator(ge);
	};
	KmlObjectStore.prototype = {
		
		/**
		 * Property: kmlObjectCreator
		 * 
		 * <KmlObjectCreator>. Used to convert <GeoData> into KmlObjects.
		 */
		kmlObjectCreator: null,

		/**
		 * Function: getKmlObject
		 * 
		 * Retrieves the KmlObject linked to a GeoData object. If the 
		 * record doesn't exist, a new KmlObject is created.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. Linked GeoData object.
		 *   callback - Function. Invoked upon successful KmlObject retrieval.
		 */
		getKmlObject: function(geoData, callback) {
			console.log("getKmlObject(" + geoData + ")");
			var id = geoData.id;
			if (id in this.datastore) {
				var kmlObject = this.datastore[id];
				callback.call(callback, kmlObject);
			}
			else {
				this.kmlObjectCreator.createFromGeoData(geoData, $.proxy(function(kmlObject) {
					this.datastore[id] = kmlObject;
					callback.call(callback, kmlObject);
				}, this));
			}
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