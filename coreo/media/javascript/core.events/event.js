/**
 * Class: Event
 * 
 * Superclass for all CORE event objects.
 * 
 * Namespace: 
 *	core.events
 *
 * Dependencies:
 *	- core.util.?
 *	- core.geo.? 	
 * Properties:
 * 
 *     publisher - (String) Name of the component where the event originated.
 *     type - (String) Name for this event type.
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};

(function($, ns) {
	/**
	 * Constructor: Event
	 * Initializes the object 
	 */
	var Event = function(publisher, type) {
		this.publisher = publisher;
		this.type = type;
	};
	ns.Event = Event;
	
})(jQuery, window.core.events);
