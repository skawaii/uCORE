/**
 * Class: HideFeatureEvent
 * 
 * SuperClass:
 * <GeoDataEvent>
 *
 * Event fired when a user requests a GeoDataFeature be hidden.
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

	var HideFeatureEvent = function(publisher, geoData) {
		ns.GeoDataEvent.call(this, publisher, geoData, HideFeatureEvent.type);
	};

	/**
	 * Constructor: HideFeatureEvent
	 * Initializes the object
	 */
	$.extend(HideFeatureEvent.prototype, ns.GeoDataEvent.prototype);
	HideFeatureEvent.type = "HideFeatureEvent";
	ns.HideFeatureEvent = HideFeatureEvent;

})(jQuery, window.core.events);
