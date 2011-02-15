/**
 * Class: FlyToNodeEvent
 * 
 * SuperClass:
 * <GeoDataNodeEvent>
 *
 * Event fired when a user requests a map to look at a GeoData node
 *
 * Namespace:
 * 	core.events
 *
 * Dependencies:
 *	- core.events.geodatanodeevent
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {
	/**
	 * Constructor: FlyToNodeEvent
	 * Initializes the object 
	 */
	var FlyToNodeEvent = function(publisher, geoData, node) {
	GeoDataNodeEvent.call(this, publisher, geoData, node, FlyToNodeEvent.type);
	};
	$.extend(FlyToNodeEvent.prototype, GeoDataNodeEvent.prototype);
	FlyToNodeEvent.type = "FlyToNodeEvent";
	ns.FlyToNodeEvent = FlyToNodeEvent;
	
		
})(jQuery, window.core.events);
