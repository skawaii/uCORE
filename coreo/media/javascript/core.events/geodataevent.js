/**
 * Class: GeoDataEvent
 * 
 * Superclass for all CORE event objects containing GeoData.
 *
 * SuperClass:
 *   <Event>
 * 
 * Dependencies:
 *  - jQuery
 *  - core.events.Event
 * 
 * Namespace:
 * 	core.events
 * 
 * Properties:
 *   geoData - <GeoData>. Associated GeoData object.
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {

	/**
	 * Constructor: GeoDataEvent
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the component from which this event 
	 *         originated.
	 *   geoData - <GeoData>. Associated GeoData object.
	 *   type - String. Name of the event type.
	 */
	var GeoDataEvent = function(publisher, geoData, type) {
		ns.Event.call(this, publisher, type);
		this.geoData = geoData;
	};

	$.extend(GeoDataEvent.prototype, ns.Event.prototype, {
		toString: function() {
			var geoDataId = this.geoData && this.geoData.id ? this.geoData.id : "null";
			return this.type + "{geoData.id=" + geoDataId + ",publisher='" + this.publisher + "'}";
		}
	});
	ns.GeoDataEvent = GeoDataEvent;

})(jQuery, window.core.events);
