/**
 * Class: ShowNodeEvent
 * 
 * SuperClass:
 * <GeoDataNodeEvent>
 *
 * Event fired when a user requests a GeoData node be displayed.
 *
 * Namespace:
 * 	core.events
 * 
 * Dependencies:
 *	- core.events.geodatanodeevent
**	- core.util.?
*	- core.geo.?
 */


if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {
	/**
	 * Constructor: ShowNodeEvent
	 * Initializes the object 
	 */
	var ShowNodeEvent = function(publisher, geoData, node) {
	GeoDataNodeEvent.call(this, publisher, geoData, node, ShowNodeEvent.type);
	};
	$.extend(ShowNodeEvent.prototype, GeoDataNodeEvent.prototype);
	ShowNodeEvent.type = "ShowNodeEvent";
	ns.ShowNodeEvent = ShowNodeEvent;
	
	
})(jQuery, window.core.events);
