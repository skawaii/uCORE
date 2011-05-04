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
 *  - core.events.GeoDataLoadedEvent
 *  - core.events.ShowFeatureEvent
 *  - core.events.HideFeatureEvent
 *  - core.events.FeatureInfoEvent
 *  - core.events.ViewChangedEvent
 *  - GEarthExtensions
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
	var FeatureInfoEvent = core.events.FeatureInfoEvent;
	if (!FeatureInfoEvent)
		throw "Dependency not found: core.events.FeatureInfoEvent";
	var GeoDataLoadedEvent = core.events.GeoDataLoadedEvent;
	if (!GeoDataLoadedEvent)
		throw "Dependency not found: core.events.GeoDataLoadedEvent";
	var GeoDataUpdateEndEvent = core.events.GeoDataUpdateEndEvent;
	if (!GeoDataUpdateEndEvent)
		throw "Dependency not found: core.events.GeoDataUpdateEndEvent";
	var ViewChangedEvent = core.events.ViewChangedEvent;
	if (!ViewChangedEvent)
		throw "Dependency not found: core.events.ViewChangedEvent";

	/**
	 * Constructor: GeController
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   ge - <GEPlugin>. Google Earth plugin instance.
	 *   eventChannel - <EventChannel>.
	 *   kmlJsonProxyService - <KmlJsonProxyService>.
	 */
	var GeController = function(ge, eventChannel, kmlJsonProxyService) {
		if (!window.GEarthExtensions) {
			throw "Dependency not found: GEarthExtensions";
		}
		this.ge = ge;
		this.gex = new GEarthExtensions(ge);
		this.eventChannel = eventChannel;
		this.kmlObjectStore = new KmlObjectStore(this.ge, this.gex, kmlJsonProxyService);
		this._init();
	};
	GeController.EVENT_PUBLISHER_NAME = "GeController";
	GeController.prototype = {
		
		gex: null,
	
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
			var viewChangeEndTimer, viewChangeEndHandler;
			if (this.eventChannel) {
				this.eventChannel.subscribe(GeoDataUpdateEndEvent.type, $.proxy(function(event) {
					this.update(event.geoData);
				}, this));
				this.eventChannel.subscribe(GeoDataLoadedEvent.type, $.proxy(function(event) {
					this.add(event.geoData);
				}, this));
				this.eventChannel.subscribe(ShowFeatureEvent.type, $.proxy(function(event) {
					this.show(event.geoData);
				}, this));
				this.eventChannel.subscribe(HideFeatureEvent.type, $.proxy(function(event) {
					this.hide(event.geoData);
				}, this));
				this.eventChannel.subscribe(FeatureInfoEvent.type, $.proxy(function(event) {
					this.flyTo(event.geoData);
					this.info(event.geoData);
				}, this));
				
				// events published by this controller
				viewChangeEndHandler = function() {
					var kmlLatLonBox, viewChangedEvent, 
						bounds, altitude, sw, ne,
						publish, myEventChannel = this.eventChannel;
					
					kmlLatLonBox = this.ge.getView().getViewportGlobeBounds();
					sw = new google.maps.LatLng(kmlLatLonBox.getSouth(), kmlLatLonBox.getWest());
					ne = new google.maps.LatLng(kmlLatLonBox.getNorth(), kmlLatLonBox.getEast());
					bounds = new google.maps.LatLngBounds(sw, ne);
					
					altitude = this.ge.getView().copyAsLookAt(this.ge.ALTITUDE_ABSOLUTE).getAltitude();
					
					viewChangedEvent = new ViewChangedEvent(GeController.EVENT_PUBLISHER_NAME,
							bounds, altitude); 
					
					publish = function() {
						viewChangeEndTimer = undefined;
						myEventChannel.publish(viewChangedEvent);
					};
					// wait before publishing the event. user might still 
					// be changing the view.
					if (viewChangeEndTimer) {
						window.clearTimeout(viewChangeEndTimer);
					}
					viewChangeEndTimer = window.setTimeout(publish, 1000);
				};
				google.earth.addEventListener(this.ge.getView(), 
						'viewchangeend', $.proxy(viewChangeEndHandler, this));
			}
		},

		/**
		 * Function: update
		 */
		update: function(geodata) {
			// TODO: update KmlContainer.getElementById()
			var originalKmlObject = this.kmlObjectStore.getKmlObject(geodata);
			if (originalKmlObject) {
				/*
				var invisibleIds = [];
				var visibleIds = [];
				var rootVisible = kmlObject.getVisibility ? kmlObject.getVisibility() : false;
				this.gex.dom.walk({
					rootObject: kmlObject,
					visitCallback: function(ctx) {
						if (this.getVisibility) {
							if (this.getVisibility()) {
								visibleIds.push(this.getId());
							}
							else {
								invisibleIds.push(this.getId());
							}
						}
					}
				});
				this.remove(geodata);
				this.add(geodata);
				kmlObject = this.kmlObjectStore.getKmlObject(geodata);
				var self = this;
				this.gex.dom.walk({
					rootObject: kmlObject,
					visitCallback: function(ctx) {
						if (invisibleIds.length == 0 
								|| $.inArray(this.getId(), visibleIds) >= 0) {
							self._showKmlObject(this, true);							
						}
						else {
							console.log("INVISIBLE: " + this.getId());
						}
					}
				});
				*/
			}
		},
		
		/**
		 * Function: add
		 */
		add: function(geoData) {
			console.log("add(" + geoData.id + ")");
			this.kmlObjectStore.getOrCreateKmlObject(geoData, $.proxy(function(kmlObject) {
				if (kmlObject)
					this.ge.getFeatures().appendChild(kmlObject);
			}, this));
		},

		/**
		 * Function: remove
		 */
		remove: function(geodata) {
			var kmlObject = this.kmlObjectStore.getKmlObject.call(this.kmlObjectStore, geodata);
			if (kmlObject) {
				var parent = kmlObject.getParentNode();
				if (parent) {
					parent.getFeatures().removeChild(kmlObject);
					console.log("Removed from parent");
				}
				// this.ge.getFeatures().removeChild(kmlObject);
				kmlObject.release();
				this.kmlObjectStore.removeKmlObject(geodata);
			}
		},
		
		_showKmlObject: function(kmlObject, showAncestors) {
			if (kmlObject) {
				kmlObject.setVisibility(true);
				if (showAncestors) {
					var parent = kmlObject.getParentNode();
					while (parent && parent.setVisibility) {
						parent.setVisibility(true);
						parent = parent.getParentNode();
					}
				}
				this.gex.dom.walk({
					rootObject: kmlObject,
					visitCallback: function(ctx) {
						this.setVisibility(true);
					}
				});
			}
		},
		
		_show: function(geoData, showAncestors) {
			this.kmlObjectStore.getOrCreateKmlObject(geoData, $.proxy(function(kmlObject) {
				this._showKmlObject(kmlObject, true);
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
			this._show(geoData, true);
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
			if (kmlObject) {
				kmlObject.setVisibility(false);
			}
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
			// TODO: look at parent GeoData nodes if this node doesn't exist
			// TODO: allow showing info of a node even if it isn't being shown (checked)
			this.ge.setBalloon(null);
			var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
			if (kmlObject) {
				var balloon = this.ge.createFeatureBalloon('');
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
			// TODO: look at parent GeoData nodes if this node doesn't exist.
			// TODO: allow flying to a node even if it isn't being shown (checked)
			var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
			if (kmlObject) {
				this.gex.util.flyToObject(kmlObject, { boundsFallback: true });
			}
		}

	};
	ns.GeController = GeController;
})(window.core.gearth);