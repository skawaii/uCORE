/**
 * Class: GeoDataUpdateEndEvent
 * 
 * Event that fires when some process finishes updating a GeoData instance. A 
 * common use case for this is when a KML NetworkLink is updated according 
 * to an HTTP response.
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
	 * Constructor: GeoDataUpdateEndEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event 
	 *         originated.
	 *   geoData - <GeoData>. GeoData that was updated.
	 *   errorThrown - String. Optional. If the GeoData was not updated 
	 *         because of an error, this is an error message.
	 */
	var GeoDataUpdateEndEvent = function(publisher, geoData, errorThrown) {
		ns.GeoDataEvent.call(this, publisher, geoData, GeoDataUpdateEndEvent.type);
		this.errorThrown = errorThrown;
	};
	/**
	 * Constant: type
	 * 
	 * String. Event type name for GeoDataUpdateEndEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	GeoDataUpdateEndEvent.type = "GeoDataUpdateEndEvent";
	$.extend(GeoDataUpdateEndEvent.prototype, ns.GeoDataEvent.prototype, {
		/**
		 * Property: errorThrown
		 * 
		 * String. Error message describing why the GeoData couldn't be 
		 * updated. Null if there was no error.
		 */
		errorThrown: null
	});
	ns.GeoDataUpdateEndEvent = GeoDataUpdateEndEvent;
})(jQuery, window.core.events);