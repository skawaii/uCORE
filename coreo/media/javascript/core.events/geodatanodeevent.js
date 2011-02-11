/**
 * Namespace: core.events
 * 
/**
 * Class: GeoDataNodeEvent
 * 
 * SuperClass:
 * <GeoDataEvent>
 *
 * Superclass for event objects related to a node within GeoData.
 * Extends GeoDataEvent.
 * 
 * Namespace:
 * 	core.events
 *
 * Properties:
 * 
 *     node - (DOM node object) Node related to this event.
 * 
 * Parameters:    
 *  publisher -  Name of the component where this event originated
 *  geoData  - GeoData object
 *  node  - Node related to this event
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {

	/**
	 * Constructor: GeoDataNodeEvent
	 * Initializes the object 
	 */
	var GeoDataNodeEvent = function(publisher, geoData, node, type) {
		GeoDataEvent.call(this, publisher, geoData, type);
		this.node = node;
	};

	$.extend(GeoDataNodeEvent.prototype, GeoDataEvent.prototype);
	ns.GeoDataNodeEvent = GeoDataNodeEvent;
	
	
})(jQuery, window.core.events);
