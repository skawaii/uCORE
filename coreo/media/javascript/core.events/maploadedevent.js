/**
 * Class: MapLoadedEvent
 * 
 * Event fired when a Google Map instance is displayed.
 * 
 * SuperClass:
 *   <Event>
 * 
 * Namespace:
 *	core.events
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
	var MapLoadedEvent = function(publisher) {
		ns.Event.call(this, publisher, MapLoadedEvent.type);
	};
	
	/**
	 * Constant: type
	 * 
	 * String. Event type name for MapLoadedEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	MapLoadedEvent.type = "MapLoadedEvent";
	
	$.extend(MapLoadedEvent.prototype, ns.Event.prototype);
	ns.MapLoadedEvent = MapLoadedEvent;

})(jQuery, window.core.events);
