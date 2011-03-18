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

	var GmapsController = function(gmaps) {
	    this.gmaps = gmaps;
	    this.kmlObjectStore = new KmlObjectStore(this.gmaps);

	};
	GmapsController.prototype = {

		add: function(geoData) {
		    //var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
		   		    
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


		    
		    



		    

		},
		
		show: function(node) {
			
		},
		
		hide: function(node) {
			
		},
		
		showNodeInfo: function(node) {
			
		},
		
		flyToNode: function(node) {
			
		}
		
	};
	ns.GmapsController = GmapsController;
	
})(window.core.gmaps);
