/**
 * Class: FlyToFeatureEvent
 * 
 * SuperClass:
 * <GeoDataEvent>
 *
 * Event fired when a user requests a map to pan/fly to a feature
 *
 * Namespace:
 * 	core.events
 *
 * Dependencies:
 *	- core.events.GeoDataEvent
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {
	/**
	 * Constructor: FlyToFeatureEvent
	 * Initializes the object 
	 */
	var FlyToFeatureEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, FlyToFeatureEvent.type);
	};
	$.extend(FlyToFeatureEvent.prototype, ns.GeoDataEvent.prototype);
	FlyToFeatureEvent.type = "FlyToFeatureEvent";
	ns.FlyToFeatureEvent = FlyToFeatureEvent;

})(jQuery, window.core.events);
