/**
 * Class: GeUnloadedEvent
 *
 * Event fired when a Google Earth instance is hidden.
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
	 * Constructor: GeUnloadedEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event 
	 *         originated.
	 */
	var GeUnloadedEvent = function(publisher) {
		ns.Event.call(this, publisher, GeUnloadedEvent.type);
	};

	/**
	 * Constant: type
	 * 
	 * String. Event type name for GeUnloadedEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	GeUnloadedEvent.type = "GeUnloadedEvent";

	$.extend(GeUnloadedEvent.prototype, ns.Event.prototype);
	ns.GeUnloadedEvent = GeUnloadedEvent;
		
})(jQuery, window.core.events);
