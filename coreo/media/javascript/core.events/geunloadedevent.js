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
 *	- core.events.Event
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
		ns.Event.call(this, publisher, GeUnloadedEvent.type);
	};

	GeUnloadedEvent.type = "GeUnloadedEvent";
	$.extend(GeUnloadedEvent.prototype, ns.Event.prototype);
	ns.GeUnloadedEvent = GeUnloadedEvent;
		
})(jQuery, window.core.events);
