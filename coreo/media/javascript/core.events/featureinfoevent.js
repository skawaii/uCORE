/**
 * Class: FeatureInfoEvent
 *
 * Event fired when a user requests details of a feature be displayed.
 * 
 * SuperClass:
 *  <GeoDataEvent>
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
	 * Constructor: FeatureInfoEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event originated.
	 *   geoData - <GeoData>. Associated GeoData object.
	 */	
	var FeatureInfoEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, FeatureInfoEvent.type);
	};

	$.extend(FeatureInfoEvent.prototype, ns.GeoDataEvent.prototype);
	
	/**
	 * Constant: type
	 * 
	 * String. Event type name for FeatureInfoEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	FeatureInfoEvent.type = "FeatureInfoEvent";
	ns.FeatureInfoEvent = FeatureInfoEvent;

})(jQuery, window.core.events);
