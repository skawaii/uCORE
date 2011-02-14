/**
 * Class: ShowFeatureEvent
 * 
 * SuperClass:
 * <GeoDataEvent>
 *
 * Event fired when a user requests a GeoDataFeature be displayed.
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
	 * Constructor: ShowFeatureEvent
	 * Initializes the object 
	 */
	var ShowFeatureEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, ShowFeatureEvent.type);
	};
	$.extend(ShowFeatureEvent.prototype, ns.GeoDataEvent.prototype);
	ShowFeatureEvent.type = "ShowFeatureEvent";
	ns.ShowFeatureEvent = ShowFeatureEvent;

})(jQuery, window.core.events);
