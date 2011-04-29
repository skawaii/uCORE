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
*	- core.util.Iterate
*
* See Also:
*   <Event>
*/

if (!window.core)
	window.core = {};
if (!window.core.events)
	window.core.events = {};
	
(function(ns) {
	
	/**
	 * Constructor: EventChannel
	 * 
	 * Initializes the object.
	 */
	var EventChannel = function() {
		var consumers = {};
		var eventQueue = [];
		var invokeConsumer = function(consumer, event) {
			var ctx = consumer.context;
			var fn = consumer.callback;
			var arg = consumer.arg;
			fn.apply(ctx, [event, arg]);
		};
		var queueWorkerBusy = false;
		var queueWorker = function() {
			if (queueWorkerBusy)
				return;
			if (eventQueue.length == 0)
				return;
			queueWorkerBusy = true;
			var eventQueueSnapshot = eventQueue.slice(0);
			eventQueue = [];
			var eventsWaiting = 0;
			var onItemEventQueue = function(eventRecord) {
				eventsWaiting++;
				var event = eventRecord.event;
				var subscribed = eventRecord.subscribed;
				var onItemConsumer = function(consumer) {
					invokeConsumer(consumer, event);
				};
				var onCompleteConsumer = function() {
					eventsWaiting--;
				};
				core.util.Iterate.iterate(subscribed, {"onItem": onItemConsumer, "onComplete": onCompleteConsumer});
			};
			var onCompleteEventQueue = function() {
				// wait for all events to be pushed to consumer
				var timer;
				var checkFinished = function() {
					if (eventsWaiting === 0) {
						window.clearInterval(timer);
						queueWorkerBusy = false;
						queueWorker();
					}
				};
				timer = window.setInterval(checkFinished, 200);
			};
			core.util.Iterate.iterate(eventQueueSnapshot, 
					{ "onItem": onItemEventQueue, "onComplete": onCompleteEventQueue });
		};
		return {
			/**
			 * Function: subscribe
			 *
			 * Parameters:
			 *	eventType - String. The type (name) of the event.
			 * 	callback - Function. Registered method for handling event occurrence.
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
					throw "Invalid callback - " + (typeof callback);
				}
				if (!consumers[eventType]) {
					consumers[eventType] = [];
				}
				consumers[eventType].push(consumer);
			},

			/**
			 * Function: publish
			 *
			 * Parameters:
			 *	event - <Event>. The Core Event to send to all registered consumers.
			 */
			publish: function(event) {
				console.log("published: " + event);
				var eventType = event ? event.type : undefined;
				if (eventType && consumers && consumers[eventType]) {
					var subscribed = consumers[eventType].slice(0);
					eventQueue.push({"event": event, "subscribed": subscribed});
					window.setTimeout(queueWorker, 50);
				}
			}
		};
	};
	ns.EventChannel = EventChannel;
	
})(window.core.events);
