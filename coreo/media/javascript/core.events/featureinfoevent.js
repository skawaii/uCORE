/**
 * Class: FeatureInfoEvent
 * 
 * SuperClass:
 * <GeoDataEvent>
 *
 * Event fired when a user requests details of a feature be displayed.
 *
 * Namespace:
 *	core.events
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
	 * Constructor: FeatureInfoEvent
	 * Initializes the object 
	 */	
	var FeatureInfoEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, FeatureInfoEvent.type);
	};

	$.extend(FeatureInfoEvent.prototype, ns.GeoDataEvent.prototype);
	FeatureInfoEvent.type = "FeatureInfoEvent";
	ns.FeatureInfoEvent = FeatureInfoEvent;

})(jQuery, window.core.events);
