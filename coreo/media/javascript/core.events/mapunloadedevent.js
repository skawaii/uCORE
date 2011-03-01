/**
 * Class: MapUnloadedEvent
 * 
 * Event fired when a Google Map instance is hidden.
 * 
 * SuperClass:
 *   <Event>
 *
 * Namespace:
 *	 core.events
 *
 * Dependencies:
 *  - jQuery
 *	- core.events.Event
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};

(function($, ns) {
	/**
	 * Constructor: MapLoadedEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event originated.
	 */
	var MapUnloadedEvent = function(publisher) {
		ns.Event.call(this, publisher, MapUnloadedEvent.type);
	};
	
	/**
	 * Constant: type
	 * 
	 * String. Event type name for MapUnloadedEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	MapUnloadedEvent.type = "MapUnloadedEvent";

	$.extend(MapUnloadedEvent.prototype, ns.Event.prototype);
	ns.MapUnloadedEvent = MapUnloadedEvent;

})(jQuery, window.core.events);
