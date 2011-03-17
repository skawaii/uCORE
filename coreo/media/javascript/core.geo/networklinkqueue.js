/**
 * Class: NetworkLinkQueue
 * 
 * Collection of NetworkLink GeoData objects. Handles polling and updating 
 * NetworkLink content.
 * 
 * Namespace:
 *   core.geo
 *   
 * Dependencies:
 *   - jQuery
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	var NetworkLinkQueue = function() {
		
	};
	NetworkLinkQueue.prototype = {
		
		add: function(geodata) {
			
		},
		
	};
	ns.NetworkLinkQueue = NetworkLinkQueue;
})(jQuery, window.core.geo);