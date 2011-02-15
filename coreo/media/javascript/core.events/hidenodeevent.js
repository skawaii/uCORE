/**
 * Class: HideNodeEvent
 * 
 * SuperClass:
 * <GeoDataNodeEvent>
 *
 * Event fired when a user requests a GeoData node be hidden.
 *
 * Namespace:
 *	core.events
 *
 * Dependencies:
 *	- core.events.geodatanodevent
 */


if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {
	
		var HideNodeEvent = function(publisher, geoData, node) {
		GeoDataNodeEvent.call(this, publisher, geoData, node, HideNodeEvent.type);
	};

	/**
	 * Constructor: HideNodeEvent
	 * Initializes the object 
	 */
	$.extend(HideNodeEvent.prototype, GeoDataNodeEvent.prototype);
	HideNodeEvent.type = "HideNodeEvent";
	ns.HideNodeEvent = HideNodeEvent;
	
	
})(jQuery, window.core.events);
