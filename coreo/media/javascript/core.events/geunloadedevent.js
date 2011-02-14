/**
 * Class: GeUnloadedEvent
 * 
 * SuperClass:
 * <Event>
 *
 * Event fired when a Google Earth instance is hidden.
 *
 * Namespace:
 *	core.events
 *
 * Dependencies:
 *	core.events.event
 */


if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {	
	/**
	 * Constructor: GeUnloadedEvent
	 * Initializes the object 
	 */
	var GeUnloadedEvent = function(publisher) {
		Event.call(this, publisher, GeUnloadedEvent.type);
	};

	GeUnloadedEvent.type = "GeUnloadedEvent";
	$.extend(GeUnloadedEvent.prototype, Event.prototype);
	ns.GeUnloadedEvent = GeUnloadedEvent;
	
		
})(jQuery, window.core.events);
