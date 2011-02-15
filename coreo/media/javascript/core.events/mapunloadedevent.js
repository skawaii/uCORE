/**
 * Class: MapUnloadedEvent
 * 
 * SuperClass:
 * <Event>
 *
 * Event fired when a Google Map instance is hidden.
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
	 * Constructor: MapUnloadedEvent
	 * Initializes the object 
	 */
	var MapUnloadedEvent = function(publisher) {
	Event.call(this, publisher, MapUnloadedEvent.type);
	};
	MapUnloadedEvent.type = "MapUnloadedEvent";

	$.extend(MapUnloadedEvent.prototype, Event.prototype);
	ns.MapUnloadedEvent = MapUnloadedEvent;
	
		
})(jQuery, window.core.events);
