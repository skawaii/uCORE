/**
 * Class: GeoDataLoadedEvent
 * 
 * SuperClass:
 * <GeoDataEvent>
 *
 * Event fired after new GeoData is loaded into some component.
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
	 * Constructor: GeoDataLoadedEvent
	 * Initializes the object 
	 */
	var GeoDataLoadedEvent = function(publisher, geoData) {
		GeoDataEvent.call(this, publisher, geoData, GeoDataLoadedEvent.type);
	};
	GeoDataLoadedEvent.type = "GeoDataLoadedEvent";

	$.extend(GeoDataLoadedEvent.prototype, GeoDataEvent.prototype);
	ns.GeoDataLoadedEvent = GeoDataLoadedEvent;

	
})(jQuery, window.core.events);
