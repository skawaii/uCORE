/**
 * Class: GeLoadedEvent
 * 
 * SuperClass:
 * <Event>
 *
 * Event fired when a Google Earth instance is displayed.
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
	 * Constructor: GeLoadedEvent
	 * Initializes the object 
	 */
	var GeLoadedEvent = function(publisher) {
	Event.call(this, publisher, GeLoadedEvent.type);
	};
	$.extend(GeLoadedEvent.prototype, Event.prototype);
	GeLoadedEvent.type = "GeLoadedEvent";
	ns.GeLoadedEvent = GeLoadedEvent;
	
	
})(jQuery, window.core.events);
