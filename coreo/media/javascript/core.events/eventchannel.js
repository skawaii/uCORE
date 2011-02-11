/**
* Class: EventChannel
*
* 	The interface between event publishers and event consumers. 
*	Consumers subscribe to the Event Channel to receive events
*	of a specific type. Publishers send events to the Event 
*	Channel. The Event Channel handles notifying the 
*	subscribed consumers of the event.
*
* Namespace:
*	core.events
*
* Dependencies:
*	- core.events.event
*	- ?
*
*/
if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function($, ns) {
	
	var EventChannel = function() {
		this._consumers = {};
	};
	EventChannel.numConsumeThreads = 2;
	EventChannel.prototype = {
		
		/**
		 * Function: Subscribe:Change me to new documentation format.
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
