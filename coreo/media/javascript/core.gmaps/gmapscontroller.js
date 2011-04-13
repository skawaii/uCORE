/**
 * Class: GmapsController
 * 
 * Interface between Google Maps and the Core maps implementation. 
 * This class handles events from the core events framework for 
 * interacting with Google Maps.
 *
 * Namespace: 
 *  core.gmaps
 * 
 * Properties:
 * 	gmaps - The google maps instance.
 * Dependencies:
 *	- Google Maps instance
 * 
 */
if (!window.core)
	window.core = {};
if (!window.core.gmaps)
	window.core.gmaps = {};

(function(ns) {
	var KmlObjectStore = core.gmaps.KmlObjectStore;
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



	var GmapsController = function(gmaps, eventChannel) {
	    this.gmaps = gmaps;
	    this.kmlObjectStore = new KmlObjectStore(this.gmaps);
	    this.eventChannel = eventChannel;
	    this._init();

	};
	GmapsController.prototype = {

		_init: function() {

		    	if (this.eventChannel) {
				this.eventChannel.subscribe(GeoDataUpdateEndEvent.type, $.proxy(function(event) {
					console.log(event);
					this.update(event.geoData);
				}, this));
				this.eventChannel.subscribe(GeoDataLoadedEvent.type, $.proxy(function(event) {
					console.log(event);
					this.add(event.geoData);
				}, this));
				this.eventChannel.subscribe(ShowFeatureEvent.type, $.proxy(function(event) {
					console.log(event);
					this.show(event.geoData);
				}, this));
				this.eventChannel.subscribe(HideFeatureEvent.type, $.proxy(function(event) {
					console.log(event);
					this.hide(event.geoData);
				}, this));
				this.eventChannel.subscribe(FeatureInfoEvent.type, $.proxy(function(event) {
					console.log(event);
					this.flyTo(event.geoData);
					this.info(event.geoData);
				}, this));
			}

		},

		add: function(geoData) {

		    // Get overlay
		    var overlay = this.kmlObjectStore.getKmlObject(geoData);

		    // Add to map
		    this.gmaps.addOverlay(overlay);


		   /* //var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
		   		    
		    // this.gmaps.addOverlay(kmlObject);

		    var point = new GLatLng(37.4419, -122.1419);
		    this.gmaps.addOverlay(new GMarker(point));

		    var children = [];
		    // Must parse the elements out of the kml
		    geoData.iterateChildren(function(child) {
			children.push(child);
			});
		    strictEqual(children.length, 2);

		    // ?
		    var placemarks = xmlDoc.documentElement.getElementsByTagName("Placemark");
*/
	    

		},
		
		show: function(node) {

		    var overlay = this.kmlObjectStore.getKmlObject(node);
		    overlay.show();
			
		},
		
		hide: function(node) {

		    var overlay = this.kmlObjectStore.getKmlObject(node);
		    overlay.hide();

			
		},
		
		showNodeInfo: function(node) {
			
		},
		
		flyToNode: function(node) {
			
		}
		
	};
	ns.GmapsController = GmapsController;
	
})(window.core.gmaps);
