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
 *  - core.events.ShowFeatureEvent
 *  - core.events.HideFeatureEvent
 */

if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function(ns) {
	var KmlObjectStore = core.gearth.KmlObjectStore;
	if (!KmlObjectStore)
		throw "Dependency not found: core.gearth.KmlObjectStore";
	var ShowFeatureEvent = core.events.ShowFeatureEvent;
	if (!ShowFeatureEvent)
		throw "Dependency not found: core.events.ShowFeatureEvent";
	var HideFeatureEvent = core.events.HideFeatureEvent;
	if (!HideFeatureEvent)
		throw "Dependency not found: core.events.HideFeatureEvent";
	
	/**
	 * Constructor: GeController
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   ge - <GEPlugin>. Google Earth plugin instance.
	 *   eventChannel - <EventChannel>.
	 */
	var GeController = function(ge, eventChannel) {
		this.ge = ge;
		this.eventChannel = eventChannel;
		this.kmlObjectStore = new KmlObjectStore(this.ge);
		this._init();
	};
	GeController.prototype = {

		/**
		 * Property: ge
		 * 
		 * Google Earth plugin instance.
		 */
		ge: null,
		
		/**
		 * Property: eventChannel
		 * 
		 * <EventChannel>.
		 */
		eventChannel: null,
		
		_init: function() {
			if (this.eventChannel) {
				this.eventChannel.subscribe(ShowFeatureEvent.type, $.proxy(function(event) {
					var geodata = event.geoData;
					this.show(geodata);
				}, this));
				this.eventChannel.subscribe(HideFeatureEvent.type, $.proxy(function(event) {
					var geodata = event.geoData;
					this.hide(geodata);
				}, this));
			}
		},

		/**
		 * Function: add
		 */
		add: function(geoData) {
			this.kmlObjectStore.getKmlObject(geoData, $.proxy(function(kmlObject) {
				this.ge.getFeatures().appendChild(kmlObject);
			}, this));
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
			this.kmlObjectStore.getKmlObject(geoData, $.proxy(function(kmlObject) {
				this.ge.getFeatures().appendChild(kmlObject);
			}, this));
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
			// TODO: fix this so getKmlObject() doesn't create a KmlObject if 
			// one doesn't already exist - maybe add a getOrCreateKmlObject() ?
			this.kmlObjectStore.getKmlObject(geoData, $.proxy(function(kmlObject) {
				this.kmlObjectStore.removeKmlObject(geoData);
				this.ge.getFeatures().removeChild(kmlObject);
			}, this));
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
			// TODO: re-implement this to call getKmlObject() with a callback
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
			// TODO: re-implement this to call getKmlObject() with a callback
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