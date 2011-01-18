if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {
	/**
	 * Event
	 * 
	 * Superclass for all CORE event objects.
	 * 
	 * Properties:
	 * 
	 *     publisher:
	 *         String. Name of the component where the event originated.
	 *     type:
	 *         String. Name for this event type.
	 */
	var Event = function(publisher, type) {
		this.publisher = publisher;
		this.type = type;
	};
	ns.Event = Event;
	
	/**
	 * GeoDataEvent
	 * 
	 * Superclass for all CORE event objects containing GeoData.
	 * Extends Event.
	 * 
	 * Properties:
	 * 
	 *   geoData: GeoData object.
	 */
	var GeoDataEvent = function(publisher, geoData, type) {
		Event.call(this, publisher, type);
		this.geoData = geoData;
	};
	$.extend(GeoDataEvent.prototype, Event.prototype);
	ns.GeoDataEvent = GeoDataEvent;
	
	/**
	 * GeoDataLoadedEvent
	 * 
	 * Event fired after new GeoData is loaded into some component.
	 * Extends GeoDataEvent.
	 */
	var GeoDataLoadedEvent = function(publisher, geoData) {
		GeoDataEvent.call(this, publisher, geoData, GeoDataLoadedEvent.type);
	};
	GeoDataLoadedEvent.type = "GeoDataLoadedEvent";
	$.extend(GeoDataLoadedEvent.prototype, GeoDataEvent.prototype);
	ns.GeoDataLoadedEvent = GeoDataLoadedEvent;

	/**
	 * GeoDataNodeEvent
	 * 
	 * Superclass for event objects related to a node within GeoData.
	 * Extends GeoDataEvent.
	 * 
	 * Properties:
	 * 
	 *     node: DOM node object. Node related to this event.
	 *     
	 * @param publisher Name of the component where this event originated
	 * @param geoData GeoData object
	 * @param node Node related to this event
	 */
	var GeoDataNodeEvent = function(publisher, geoData, node, type) {
		GeoDataEvent.call(this, publisher, geoData, type);
		this.node = node;
	};
	$.extend(GeoDataNodeEvent.prototype, GeoDataEvent.prototype);
	ns.GeoDataNodeEvent = GeoDataNodeEvent;
	
	/**
	 * ShowNodeEvent
	 * 
	 * Event fired when a user requests a GeoData node be displayed.
	 * Extends GeoDataNodeEvent.
	 */
	var ShowNodeEvent = function(publisher, geoData, node) {
		GeoDataNodeEvent.call(this, publisher, geoData, node, ShowNodeEvent.type);
	};
	$.extend(ShowNodeEvent.prototype, GeoDataNodeEvent.prototype);
	ShowNodeEvent.type = "ShowNodeEvent";
	ns.ShowNodeEvent = ShowNodeEvent;
	
	/**
	 * HideNodeEvent
	 * 
	 * Event fired when a user requests a GeoData node be hidden.
	 * Extends GeoDataNodeEvent.
	 */
	var HideNodeEvent = function(publisher, geoData, node) {
		GeoDataNodeEvent.call(this, publisher, geoData, node, HideNodeEvent.type);
	};
	$.extend(HideNodeEvent.prototype, GeoDataNodeEvent.prototype);
	HideNodeEvent.type = "HideNodeEvent";
	ns.HideNodeEvent = HideNodeEvent;
	
	/**
	 * NodeInfoEvent
	 * 
	 * Event fired when a user requests details of a GeoData node be displayed.
	 * Extends GeoDataNodeEvent.
	 */
	var NodeInfoEvent = function(publisher, geoData, node) {
		GeoDataNodeEvent.call(this, publisher, geoData, node, NodeInfoEvent.type);
	};
	$.extend(NodeInfoEvent.prototype, GeoDataNodeEvent.prototype);
	NodeInfoEvent.type = "NodeInfoEvent";
	ns.NodeInfoEvent = NodeInfoEvent;
	
	/**
	 * FlyToNodeEvent
	 * 
	 * Event fired when a user requests a map to look at a GeoData node
	 * Extends GeoDataNodeEvent.
	 */
	var FlyToNodeEvent = function(publisher, geoData, node) {
		GeoDataNodeEvent.call(this, publisher, geoData, node, FlyToNodeEvent.type);
	};
	$.extend(FlyToNodeEvent.prototype, GeoDataNodeEvent.prototype);
	FlyToNodeEvent.type = "FlyToNodeEvent";
	ns.FlyToNodeEvent = FlyToNodeEvent;
	
	/**
	 * GeLoadedEvent
	 * 
	 * Event fired when a Google Earth instance is displayed.
	 * Extends Event.
	 */
	var GeLoadedEvent = function(publisher) {
		Event.call(this, publisher, GeLoadedEvent.type);
	};
	$.extend(GeLoadedEvent.prototype, Event.prototype);
	GeLoadedEvent.type = "GeLoadedEvent";
	ns.GeLoadedEvent = GeLoadedEvent;
	
	/**
	 * GeUnloadedEvent
	 * 
	 * Event fired when a Google Earth instance is hidden.
	 * Extends Event.
	 */
	var GeUnloadedEvent = function(publisher) {
		Event.call(this, publisher, GeUnloadedEvent.type);
	};
	GeUnloadedEvent.type = "GeUnloadedEvent";
	$.extend(GeUnloadedEvent.prototype, Event.prototype);
	ns.GeUnloadedEvent = GeUnloadedEvent;
	
	/**
	 * MapLoadedEvent
	 * 
	 * Event fired when a Google Map instance is displayed.
	 * Extends Event.
	 */
	var MapLoadedEvent = function(publisher) {
		Event.call(this, publisher, MapLoadedEvent.type);
	};
	MapLoadedEvent.type = "MapLoadedEvent";
	$.extend(MapLoadedEvent.prototype, Event.prototype);
	ns.MapLoadedEvent = MapLoadedEvent;

	/**
	 * MapUnloadedEvent
	 * 
	 * Event fired when a Google Map instance is hidden.
	 * Extends Event.
	 */
	var MapUnloadedEvent = function(publisher) {
		Event.call(this, publisher, MapUnloadedEvent.type);
	};
	MapUnloadedEvent.type = "MapUnloadedEvent";
	$.extend(MapUnloadedEvent.prototype, Event.prototype);
	ns.MapUnloadedEvent = MapUnloadedEvent;
	
	/**
	 * EventChannel
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