/**
 * Class: FlyToFeatureEvent
 *
 * Event fired when a user requests a map to pan/fly to a feature.
 * 
 * SuperClass:
 *  <GeoDataEvent>
 *
 * Namespace:
 * 	core.events
 *
 * Dependencies:
 *  - jQuery
 *	- core.events.GeoDataEvent
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {
	/**
	 * Constructor: FlyToFeatureEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event originated.
	 *   geoData - <GeoData>. Associated GeoData object.
	 */
	var FlyToFeatureEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, FlyToFeatureEvent.type);
	};
	$.extend(FlyToFeatureEvent.prototype, ns.GeoDataEvent.prototype);
	
	/**
	 * Constant: type
	 * 
	 * String. Event type name for FlyToFeatureEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	FlyToFeatureEvent.type = "FlyToFeatureEvent";
	ns.FlyToFeatureEvent = FlyToFeatureEvent;

})(jQuery, window.core.events);
