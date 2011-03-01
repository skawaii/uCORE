/**
 * Class: GeController
 * 
 * Interface between CORE event framework and Google Earth instance.
 * Consumes CORE events and handles showing/hiding features on the map 
 * accordingly. 
 * 
 * Namespace:
 *  core.gearth
 * 
 * Properties:
 *  ge - GEPlugin. Google Earth plugin instance.
 *  kmlObjectStore - <KmlObjectStore>. Repository of KmlObjects, referenced 
 *        by GeoData IDs.
 * 
 * Dependencies:
 *  - Google Earth browser plugin
 *  - core.gearth.KmlObjectStore
 */

if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function(ns) {
	var KmlObjectStore = core.gearth.KmlObjectStore;

	/**
	 * Constructor: GeController
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   ge - <GEPlugin>. Google Earth plugin instance.
	 */
	var GeController = function(ge) {
		this.ge = ge;
		this.kmlObjectStore = new KmlObjectStore(this.ge);
	};
	GeController.prototype = {

		/**
		 * Function: add
		 */
		add: function(geoData) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
			this.ge.getFeatures().appendChild(kmlObject);
		},

		/**
		 * Function: show
		 * 
		 * Displays a feature on the Google Earth instance.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. The feature to display.
		 */
		show: function(geoData) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
			this.ge.getFeatures().appendChild(kmlObject);
		},

		/**
		 * Function: hide
		 * 
		 * Removes a feature from the Google Earth instance.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. The feature to be removed.
		 */
		hide: function(geoData) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
			this.kmlObjectStore.removeKmlObject(geoData);
			this.ge.getFeatures().removeChild(kmlObject);
		},

		/**
		 * Function: info
		 * 
		 * Displays the information balloon for a feature on the Google Earth 
		 * instance.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. The feature for which to display the 
		 *         information balloon.
		 */
		info: function(geoData) {
			this.ge.setBalloon(null);
			var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
			if (kmlObject) {
				var balloon = this.ge.createHtmlStringBalloon('');
				balloon.setFeature(kmlObject);
				// balloon.setMinWidth(400);
				// balloon.setMaxHeight(400);
				balloon.setCloseButtonEnabled(true);
				this.ge.setBalloon(balloon);
			}
		},

		/**
		 * Function: flyTo
		 * 
		 * Pans the view of the Google Earth instance to a feature.
		 * 
		 * Parameters:
		 *   geoData - <GeoData>. The feature to pan to.
		 */
		flyTo: function(geoData) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
			if (kmlObject) {
				if ("getAbstractView" in kmlObject 
						&& typeof kmlObject.getAbstractView === "function") {
					var lookAt = kmlObject.getAbstractView();
					this.ge.getView().setAbstractView(lookAt);
				}
				else {
					throw "Unsupported KML object type - " + kmlObject;
				}
			}
		}

	};
	ns.GeController = GeController;
})(window.core.gearth);