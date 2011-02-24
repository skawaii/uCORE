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
	
	var GmapsController = function(gmaps) {
		this.gmaps = gmaps;
	};
	GmapsController.prototype = {

		add: function(geoData) {

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
