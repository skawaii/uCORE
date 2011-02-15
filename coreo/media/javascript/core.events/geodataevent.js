/**
 * Class: GeoDataEvent
 * 
 * SuperClass:
 * <Event>
 *
 * Superclass for all CORE event objects containing GeoData.
 * Extends Event.
 *
 * Dependencies:
 *  - core.events.Event
 * 
 * Namespace:
 * 	core.events
 * 
 * Properties:
 * 
 *   geoData - GeoDataFeature object.
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {

	/**
	 * Constructor: GeoDataEvent
	 * Initializes the object 
	 */
	var GeoDataEvent = function(publisher, geoData, type) {
		ns.Event.call(this, publisher, type);
		this.geoData = geoData;
	};

	$.extend(GeoDataEvent.prototype, ns.Event.prototype);
	ns.GeoDataEvent = GeoDataEvent;

})(jQuery, window.core.events);
