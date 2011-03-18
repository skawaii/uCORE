/**
 * Class: ShowFeatureEvent
 * 
 * Event fired when a user requests a feature be displayed.
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
	/**
	 * Constructor: ShowFeatureEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event 
	 *         originated.
	 *   geoData - <GeoData>. Feature being shown.
	 */
	var ShowFeatureEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, ShowFeatureEvent.type);
	};
	$.extend(ShowFeatureEvent.prototype, ns.GeoDataEvent.prototype);
	
	/**
	 * Constant: type
	 * 
	 * String. Event type name for ShowFeatureEvent's.
	 * 
	 * See Also:
	 *   <EventChannel.subscribe>, <Event.Event>
	 */
	ShowFeatureEvent.type = "ShowFeatureEvent";
	ns.ShowFeatureEvent = ShowFeatureEvent;

})(jQuery, window.core.events);
