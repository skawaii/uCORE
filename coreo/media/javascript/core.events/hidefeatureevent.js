/**
 * Class: HideFeatureEvent
 * 
 * Event fired when a user requests a feature be hidden.
 * 
 * SuperClass:
 *   <GeoDataEvent>
 *
 * Namespace:
 *	core.events
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
	 * Constructor: HideFeatureEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event 
	 *         originated.
	 *   geoData - <GeoData>. Feature being hidden.
	 */
	var HideFeatureEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, HideFeatureEvent.type);
	};
	$.extend(HideFeatureEvent.prototype, ns.GeoDataEvent.prototype);
	
	/**
	 * Constant: type
	 * 
	 * String. Event type name for HideFeatureEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	HideFeatureEvent.type = "HideFeatureEvent";
	ns.HideFeatureEvent = HideFeatureEvent;

})(jQuery, window.core.events);
