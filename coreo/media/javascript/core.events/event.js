/**
 * Class: Event
 * 
 * A notification message signaling the occurrence of an action relevant to 
 * the CORE application. Superclass for all CORE event objects.
 * 
 * Namespace: 
 *	core.events
 *
 * Dependencies:
 *	- none
 *
 * Properties:
 * 
 *   publisher - String. Name of the component where the event originated.
 *   type - String. Name for this event type.
 * 
 * See Also:
 * 
 *   <GeLoadedEvent>, <GeUnloadedEvent>, <MapLoadedEvent>, <MapUnloadedEvent>, 
 *   <GeoDataEvent>, <ShowFeatureEvent>, <HideFeatureEvent>, 
 *   <FeatureInfoEvent>, <FlyToFeatureEvent>, <GeoDataLoadedEvent> 
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};

(function(ns) {
	/**
	 * Constructor: Event
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   publisher - String. Name of the class or component from which the 
	 *         event originated.
	 *   type - String. Name of the event type.
	 */
	var Event = function(publisher, type) {
		this.publisher = publisher;
		this.type = type;
	};
	Event.prototype = {
		toString: function() {
			return this.type + "{publisher='" + this.publisher + "'}";
		}	
	};
	ns.Event = Event;
})(window.core.events);