/**
 * Class: GeoDataUnloadedEvent
 * 
 * Event fired after the user indicates they wish to remove GeoData.
 * 
 * SuperClass:
 *   <GeoDataEvent>
 *
 * Namespace:
 * 	core.events 
 * 
 * Dependencies:
 *  - jQuery
 *  - core.events.GeoDataEvent
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {
	/**
	 * Constructor: GeoDataUnloadedEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event 
	 *         originated.
	 *   geoData - <GeoData>. GeoData that was unloaded. This is the root node 
	 *         of the GeoData tree.
	 */
	var GeoDataUnloadedEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, GeoDataUnloadedEvent.type);
	};
	
	/**
	 * Constant: type
	 * 
	 * String. Event type name for GeoDataUnloadedEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	GeoDataUnloadedEvent.type = "GeoDataUnloadedEvent";

	$.extend(GeoDataUnloadedEvent.prototype, ns.GeoDataEvent.prototype);
	ns.GeoDataUnloadedEvent = GeoDataUnloadedEvent;
	
})(jQuery, window.core.events);
