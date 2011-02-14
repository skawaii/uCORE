/**
 * Class: MapLoadedEvent
 * 
 * SuperClass:
 * <Event>
 *
 * Event fired when a Google Map instance is displayed.
 * 
 * Namespace:
 *	core.events
 *
 * Dependencies:
 *	- core.events.event
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {
	/**
	 * Constructor: MapLoadedEvent
	 * Initializes the object 
	 */		
	var MapLoadedEvent = function(publisher) {
		Event.call(this, publisher, MapLoadedEvent.type);
	};
	MapLoadedEvent.type = "MapLoadedEvent";
	$.extend(MapLoadedEvent.prototype, Event.prototype);
	ns.MapLoadedEvent = MapLoadedEvent;

	
})(jQuery, window.core.events);
