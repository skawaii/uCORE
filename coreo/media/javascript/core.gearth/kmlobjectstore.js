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
 *  - core.geo.KmlFeatureType
 */

if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function(ns) {
	var KmlObjectCreator = core.gearth.KmlObjectCreator;
	if (!KmlObjectCreator)
		throw "Dependency not found: core.gearth.KmlObjectCreator";
	var KmlFeatureType = core.geo.KmlFeatureType;
	if (!KmlFeatureType)
		throw "Dependency not found: core.geo.KmlFeatureType";
	
	/**
	 * Constructor: KmlObjectStore
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   ge - GEPlugin. Google Earth plugin instance used for creating 
	 *         KmlObjects.
	 *   gex = GEarthExtensions.
	 *   kmlJsonProxyService - <KmlJsonProxyService>.
	 */
	var KmlObjectStore = function(ge, gex, kmlJsonProxyService) {
		this.ge = ge;
		this.datastore = {};
		this.kmlObjectCreator = new KmlObjectCreator(ge, gex, kmlJsonProxyService);
	};
	KmlObjectStore.prototype = {
		
		/**
		 * Property: ge
		 * 
		 * Google Earth Plugin.
		 */
		ge: null,
		
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
		 * record doesn't exist, returns null.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. Linked GeoData object.
		 */
		getKmlObject: function(geoData) {
			var kmlObject = null;
			if (geoData && geoData.id) {
				var id = geoData.id;
				if (id in this.datastore) {
					kmlObject = this.datastore[id];
				}
				else {
					// parent geoData might be in the store. if so, find it, 
					// then search its children.
					var parentGeoData = geoData.getParent();
					if (parentGeoData) {
						var parentKmlObject = this.getKmlObject(parentGeoData);
						if (parentKmlObject) {
							var kmlObjectType = this.getKmlObjectType(geoData);
							if (kmlObjectType) {
								var childKmlObjectList = parentKmlObject.getElementsByType(kmlObjectType);
								// var childKmlObjectList = parentKmlObject.getFeatures().getChildNodes();
								for (var i = 0; i < childKmlObjectList.getLength(); i++) {
									var childKmlObject = childKmlObjectList.item(i);
									var childGeoDataId = this.kmlObjectCreator.getGeoDataId(childKmlObject);
									if (childGeoDataId === id) {
										return childKmlObject;
									}
								}
							}
						}
					}
				}
			}
			return kmlObject;
		},
		
		getKmlObjectType: function(geodata) {
			if (geodata) {
				var kmlFeatureType = geodata.getKmlFeatureType();
				if (kmlFeatureType) {
					switch (kmlFeatureType) {
					case KmlFeatureType.NETWORK_LINK:
						return "KmlNetworkLink";
					case KmlFeatureType.PLACEMARK:
						return "KmlPlacemark";
					case KmlFeatureType.PHOTO_OVERLAY:
						return "KmlPhotoOverlay";
					case KmlFeatureType.SCREEN_OVERLAY:
						return "KmlScreenOverlay";
					case KmlFeatureType.GROUND_OVERLAY:
						return "KmlGroundOverlay";
					case KmlFeatureType.FOLDER:
						return "KmlFolder";
					case KmlFeatureType.DOCUMENT:
						return "KmlDocument";
					}
				}
			}
			return null;
		},

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
		getOrCreateKmlObject: function(geoData, callback) {
			if (geoData && geoData.id) {
				var kmlObject = this.getKmlObject(geoData);
				if (kmlObject) {
					// use the KmlObject from the store
					callback.call(callback, kmlObject);
				}
				else {
					// create a new KmlObject
					var id = geoData.id;
					this.kmlObjectCreator.createFromGeoData.call(
							this.kmlObjectCreator, 
							geoData, 
							$.proxy(function(kmlObject) {
								this.datastore[id] = kmlObject;
								callback.call(callback, kmlObject);
							}, this));
				}
			}
			else {
				// invalid GeoData provided
				callback.call(callback, null);
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