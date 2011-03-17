/**
 * Class: FeatureUpdatedEvent
 * 
 * Event fired when a feature changes. This change could represent refreshing 
 * content in a NetworkLink.
 * 
 * SuperClass:
 *   <GeoDataEvent>
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
	var GeoDataEvent = ns.GeoDataEvent;

	/**
	 * Constructor: FeatureUpdatedEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event 
	 *         originated.
	 *   geoData - <GeoData>. Feature that was updated.
	 */
	var FeatureUpdatedEvent	 = function(publisher, geoData) {
		GeoDataEvent.call(this, publisher, geoData, FeatureUpdatedEvent.type);
	};
	$.extend(FeatureUpdatedEvent.prototype, ns.GeoDataEvent.prototype);
	
	/**
	 * Constant: type
	 * 
	 * String. Event type name for FeatureUpdatedEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	FeatureUpdatedEvent.type = "FeatureUpdatedEvent";
	ns.FeatureUpdatedEvent = FeatureUpdatedEvent;
})(jQuery, window.core.events);