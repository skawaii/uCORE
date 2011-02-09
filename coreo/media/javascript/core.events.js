/**
 * Namespace: core.events
 * 
 * Defines classes related to the Google Earth web browser plugin
 * 
 * Dependencies:
 *     - core.util
 *     - core.geo
 */

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {
	/**
	 * Class: Event
	 * 
	 * Superclass for all CORE event objects.
	 * 
	 * Properties:
	 * 
	 *     publisher - (String) Name of the component where the event originated.
	 *     type - (String) Name for this event type.
	 */

	/**
	 * Constructor: Event
	 * Initializes the object 
	 */
	var Event = function(publisher, type) {
		this.publisher = publisher;
		this.type = type;
	};
	ns.Event = Event;
	
	/**
	 * Class: GeoDataEvent
	 * 
	 * SuperClass:
	 * <Event>
	 *
	 * Superclass for all CORE event objects containing GeoData.
	 * Extends Event.
	 * 
	 * Properties:
	 * 
	 *   geoData - GeoData object.
	 */
	var GeoDataEvent = function(publisher, geoData, type) {
		Event.call(this, publisher, type);
		this.geoData = geoData;
	};

	/**
	 * Constructor: GeoDataEvent
	 * Initializes the object 
	 */
	$.extend(GeoDataEvent.prototype, Event.prototype);
	ns.GeoDataEvent = GeoDataEvent;
	
	/**
	 * Class: GeoDataLoadedEvent
	 * 
	 * SuperClass:
	 * <GeoDataEvent>
	 *
	 * Event fired after new GeoData is loaded into some component.
	 * 
	 */
	var GeoDataLoadedEvent = function(publisher, geoData) {
		GeoDataEvent.call(this, publisher, geoData, GeoDataLoadedEvent.type);
	};
	GeoDataLoadedEvent.type = "GeoDataLoadedEvent";

	/**
	 * Constructor: GeoDataLoadedEvent
	 * Initializes the object 
	 */
	$.extend(GeoDataLoadedEvent.prototype, GeoDataEvent.prototype);
	ns.GeoDataLoadedEvent = GeoDataLoadedEvent;

	/**
	 * Class: GeoDataNodeEvent
	 * 
	 * SuperClass:
	 * <GeoDataEvent>
	 *
	 * Superclass for event objects related to a node within GeoData.
	 * Extends GeoDataEvent.
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
	var GeoDataNodeEvent = function(publisher, geoData, node, type) {
		GeoDataEvent.call(this, publisher, geoData, type);
		this.node = node;
	};

	/**
	 * Constructor: GeoDataNodeEvent
	 * Initializes the object 
	 */
	$.extend(GeoDataNodeEvent.prototype, GeoDataEvent.prototype);
	ns.GeoDataNodeEvent = GeoDataNodeEvent;
	
	/**
	 * Class: ShowNodeEvent
	 * 
	 * SuperClass:
	 * <GeoDataNodeEvent>
	 *
	 * Event fired when a user requests a GeoData node be displayed.
	 */
	var ShowNodeEvent = function(publisher, geoData, node) {
		GeoDataNodeEvent.call(this, publisher, geoData, node, ShowNodeEvent.type);
	};
	/**
	 * Constructor: ShowNodeEvent
	 * Initializes the object 
	 */
	$.extend(ShowNodeEvent.prototype, GeoDataNodeEvent.prototype);
	ShowNodeEvent.type = "ShowNodeEvent";
	ns.ShowNodeEvent = ShowNodeEvent;
	
	/**
	 * Class: HideNodeEvent
	 * 
	 * SuperClass:
	 * <GeoDataNodeEvent>
	 *
	 * Event fired when a user requests a GeoData node be hidden.
	 */
	var HideNodeEvent = function(publisher, geoData, node) {
		GeoDataNodeEvent.call(this, publisher, geoData, node, HideNodeEvent.type);
	};

	/**
	 * Constructor: HideNodeEvent
	 * Initializes the object 
	 */
	$.extend(HideNodeEvent.prototype, GeoDataNodeEvent.prototype);
	HideNodeEvent.type = "HideNodeEvent";
	ns.HideNodeEvent = HideNodeEvent;
	
	/**
	 * Class: NodeInfoEvent
	 * 
	 * SuperClass:
	 * <GeoDataNodeEvent>
	 *
	 * Event fired when a user requests details of a GeoData node be displayed.
	 */
	var NodeInfoEvent = function(publisher, geoData, node) {
		GeoDataNodeEvent.call(this, publisher, geoData, node, NodeInfoEvent.type);
	};

	/**
	 * Constructor: NodeInfoEvent
	 * Initializes the object 
	 */
	$.extend(NodeInfoEvent.prototype, GeoDataNodeEvent.prototype);
	NodeInfoEvent.type = "NodeInfoEvent";
	ns.NodeInfoEvent = NodeInfoEvent;
	
	/**
	 * Class: FlyToNodeEvent
	 * 
	 * SuperClass:
	 * <GeoDataNodeEvent>
	 *
	 * Event fired when a user requests a map to look at a GeoData node
	 */
	var FlyToNodeEvent = function(publisher, geoData, node) {
		GeoDataNodeEvent.call(this, publisher, geoData, node, FlyToNodeEvent.type);
	};
	/**
	 * Constructor: FlyToNodeEvent
	 * Initializes the object 
	 */
	$.extend(FlyToNodeEvent.prototype, GeoDataNodeEvent.prototype);
	FlyToNodeEvent.type = "FlyToNodeEvent";
	ns.FlyToNodeEvent = FlyToNodeEvent;
	
	/**
	 * Class: GeLoadedEvent
	 * 
	 * SuperClass:
	 * <Event>
	 *
	 * Event fired when a Google Earth instance is displayed.
	 */
	var GeLoadedEvent = function(publisher) {
		Event.call(this, publisher, GeLoadedEvent.type);
	};
	/**
	 * Constructor: GeLoadedEvent
	 * Initializes the object 
	 */
	$.extend(GeLoadedEvent.prototype, Event.prototype);
	GeLoadedEvent.type = "GeLoadedEvent";
	ns.GeLoadedEvent = GeLoadedEvent;
	
	/**
	 * Class: GeUnloadedEvent
	 * 
	 * SuperClass:
	 * <Event>
	 *
	 * Event fired when a Google Earth instance is hidden.
	 */
	var GeUnloadedEvent = function(publisher) {
		Event.call(this, publisher, GeUnloadedEvent.type);
	};
	/**
	 * Constructor: GeUnloadedEvent
	 * Initializes the object 
	 */
	GeUnloadedEvent.type = "GeUnloadedEvent";
	$.extend(GeUnloadedEvent.prototype, Event.prototype);
	ns.GeUnloadedEvent = GeUnloadedEvent;
	
	/**
	 * Class: MapLoadedEvent
	 * 
	 * SuperClass:
	 * <Event>
	 *
	 * Event fired when a Google Map instance is displayed.
	 */
	var MapLoadedEvent = function(publisher) {
		Event.call(this, publisher, MapLoadedEvent.type);
	};
	MapLoadedEvent.type = "MapLoadedEvent";
	/**
	 * Constructor: MapLoadedEvent
	 * Initializes the object 
	 */
	$.extend(MapLoadedEvent.prototype, Event.prototype);
	ns.MapLoadedEvent = MapLoadedEvent;

	/**
	 * Class: MapUnloadedEvent
	 * 
	 * SuperClass:
	 * <Event>
	 *
	 * Event fired when a Google Map instance is hidden.
	 */
	var MapUnloadedEvent = function(publisher) {
		Event.call(this, publisher, MapUnloadedEvent.type);
	};
	MapUnloadedEvent.type = "MapUnloadedEvent";
	/**
	 * Constructor: MapUnloadedEvent
	 * Initializes the object 
	 */
	$.extend(MapUnloadedEvent.prototype, Event.prototype);
	ns.MapUnloadedEvent = MapUnloadedEvent;
	
	/**
	 * Class: EventChannel
	 * 
	 * The interface between event publishers and event consumers. Consumers 
	 * subscribe to the Event Channel to receive events of a specific type. 
	 * Publishers send events to the Event Channel. The Event Channel handles 
	 * notifying the subscribed consumers of the event. 
	 */
	var EventChannel = function() {
		this._consumers = {};
	};
	EventChannel.numConsumeThreads = 2;
	EventChannel.prototype = {
		
		/**
		 * Function: Subscribe
		 *
		 * Parameters:
		 *	eventType - The type of the event
		 * 	callback - registered method for handling event occurence.
		 * 
		 */
		subscribe: function(eventType, callback) {
			var consumer = {};
			if (typeof callback == "function") {
				consumer.context = arguments.callee;
				consumer.callback = callback;
				consumer.arg = null;
			}
			else if (typeof callback == "object") {
				consumer.context = callback.context ? callback.context : arguments.callee;
				consumer.callback = callback.callback;
				consumer.arg = callback.arg;
			}
			else {
				throw "Invalid consumer - " + (typeof consumer);
			}
			if (!this._consumers[eventType]) {
				this._consumers[eventType] = [];
			}
			this._consumers[eventType].push(consumer);
		},
		
		_invokeConsumer: function(consumer, event) {
			var ctx = consumer.context;
			var fn = consumer.callback;
			var arg = consumer.arg;
			fn.apply(ctx, [event, arg]);
		},
		
		/**
		 * Function: publish
		 *
		 * Parameters:
		 *	event - The Core Event to publish
		 */
		publish: function(event) {
			var eventType = event ? event.type : undefined;
			if (eventType && this._consumers && this._consumers[eventType]) {
				var self = this;
				var consumerQueue = this._consumers[eventType].slice(0);
				// spawn threads to work off consumer queue
				var consumerInvoker = function() {
					var consumer;
					while ((consumer = consumerQueue.pop()) != null) {
						self._invokeConsumer(consumer, event);
					}
				};
				for (var i = 0; i < EventChannel.numConsumeThreads; i++) {
					setTimeout(consumerInvoker, 1);
				}
			}
		}
		
	};
	ns.EventChannel = EventChannel;
	
})(jQuery, window.core.events);
