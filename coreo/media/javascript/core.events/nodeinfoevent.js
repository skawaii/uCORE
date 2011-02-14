/**
 * Class: NodeInfoEvent
 * 
 * SuperClass:
 * <GeoDataNodeEvent>
 *
 * Event fired when a user requests details of a GeoData node be displayed.
 *
 * Namespace:
 *	core.events
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
	 * Constructor: NodeInfoEvent
	 * Initializes the object 
	 */	
	var NodeInfoEvent = function(publisher, geoData, node) {
		GeoDataNodeEvent.call(this, publisher, geoData, node, NodeInfoEvent.type);
	};

	$.extend(NodeInfoEvent.prototype, GeoDataNodeEvent.prototype);
	NodeInfoEvent.type = "NodeInfoEvent";
	ns.NodeInfoEvent = NodeInfoEvent;
	
		
})(jQuery, window.core.events);
