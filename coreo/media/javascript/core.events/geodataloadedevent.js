/**
 * Class: GeoDataLoadedEvent
 * 
 * Event fired after new GeoData is loaded into some component. 
 * <ShowFeatureEvents> will normally immediately follow this event for any 
 * nodes within the GeoData that are to be displayed on a map.
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
	 * Constructor: GeoDataLoadedEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event 
	 *         originated.
	 *   geoData - <GeoData>. GeoData that was loaded. This is the root node 
	 *         of the GeoData tree.
	 */
	var GeoDataLoadedEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, GeoDataLoadedEvent.type);
	};
	
	/**
	 * Constant: type
	 * 
	 * String. Event type name for GeoDataLoadedEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	GeoDataLoadedEvent.type = "GeoDataLoadedEvent";

	$.extend(GeoDataLoadedEvent.prototype, ns.GeoDataEvent.prototype);
	ns.GeoDataLoadedEvent = GeoDataLoadedEvent;
	
})(jQuery, window.core.events);
