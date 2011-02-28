/**
 * Class: GeLoadedEvent
 *
 * Event fired when a Google Earth instance is displayed.
 * 
 * SuperClass:
 *  <Event>
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
	 * Constructor: GeLoadedEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *  publisher - String. Name of the component from which this event originated.
	 */
	var GeLoadedEvent = function(publisher) {
		ns.Event.call(this, publisher, GeLoadedEvent.type);
	};
	$.extend(GeLoadedEvent.prototype, ns.Event.prototype);
	
	/**
	 * Constant: type
	 * 
	 * String. Event type name for GeLoadedEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	GeLoadedEvent.type = "GeLoadedEvent";
	ns.GeLoadedEvent = GeLoadedEvent;

})(jQuery, window.core.events);
