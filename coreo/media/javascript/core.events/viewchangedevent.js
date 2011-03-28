/**
 * Class: ViewChangedEvent
 * 
 * Event fired after the map (or earth) view changes. This can occur when a
 * user pans or zooms. This event fires only when the user finishes zooming
 * and panning, not multiple times during the zooming and panning. 
 *
 * SuperClass:
 *   <Event>
 * 
 * Dependencies:
 *  - jQuery
 *  - core.events.Event
 * 
 * Namespace:
 * 	core.events
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {

	/**
	 * Constructor: ViewChangedEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event
	 *         originated.
	 *   bounds - GLatLngBounds (Google Maps API). New view's 
	 *         bounding box.
	 *   altitude - Number. Camera's new absolute elevation in meters. 
	 */
	var ViewChangedEvent = function(publisher, bounds, altitude) {
		ns.Event.call(this, publisher, ViewChangedEvent.type);
		this.bounds = bounds;
		this.altitude = altitude;
	};
	/**
	 * Constant: type
	 * 
	 * String. Name of this event type.
	 */
	ViewChangedEvent.type = "ViewChangedEvent";
	$.extend(ViewChangedEvent.prototype, ns.Event.prototype, {
		/**
		 * Property: bounds
		 * 
		 * GLatLngBounds (Google Maps API class). The bounding box of the 
		 * new view.
		 */
		bounds: null,
		
		/**
		 * Property: altitude
		 * 
		 * Number. The camera's new absolute elevation in meters.
		 */
		altitude: 0
	});
	ns.ViewChangedEvent = ViewChangedEvent;

})(jQuery, window.core.events);
