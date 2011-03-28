/**
 * Class: GeoDataUpdateBeginEvent
 * 
 * Event that fires when some process begins to update a GeoData instance. A 
 * common use case for this is when an HTTP request is sent to retrieve 
 * updates for a KML NetworkLink.
 * 
 * Namespace:
 *   core.events
 * 
 * Dependencies:
 *   - jQuery
 *   - core.events.GeoDataEvent
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};

(function($, ns) {
	/**
	 * Constructor: GeoDataUpdateBeginEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event 
	 *         originated.
	 *   geoData - <GeoData>. GeoData being updated.
	 */
	var GeoDataUpdateBeginEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, GeoDataUpdateBeginEvent.type);
	};
	/**
	 * Constant: type
	 * 
	 * String. Event type name for GeoDataUpdateBeginEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	GeoDataUpdateBeginEvent.type = "GeoDataUpdateBeginEvent";
	$.extend(GeoDataUpdateBeginEvent.prototype, ns.GeoDataEvent.prototype);
	ns.GeoDataUpdateBeginEvent = GeoDataUpdateBeginEvent;
})(jQuery, window.core.events);