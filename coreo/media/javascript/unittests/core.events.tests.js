module("core.events");
test("Event", function() {
	var event = new core.events.Event("foo", "Event");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.type, "Event", "type property initialized");
});
test("GeoDataEvent", function() {
	var event = new core.events.GeoDataEvent("foo", "mockgeodata",
	        "GeoDataEvent");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.type, "GeoDataEvent", "type property initialized");
});
test("GeoDataNodeEvent", function() {
	var event = new core.events.GeoDataNodeEvent("foo", "mockgeodata", "node",
	        "GeoDataNodeEvent");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.node, "node", "node property initialized");
	same(event.type, "GeoDataNodeEvent", "type property initialized");
});
test("GeoDataLoadedEvent", function() {
	var event = new core.events.GeoDataLoadedEvent("foo", "mockgeodata");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(core.events.GeoDataLoadedEvent.type, "GeoDataLoadedEvent");
	same(event.type, "GeoDataLoadedEvent", "type property initialized");
});
test("ShowNodeEvent", function() {
	var event = new core.events.ShowNodeEvent("foo", "mockgeodata", "node");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.node, "node", "node property initialized");
	same(core.events.ShowNodeEvent.type, "ShowNodeEvent");
	same(event.type, "ShowNodeEvent", "type property initialized");
});
test("HideNodeEvent", function() {
	var event = new core.events.HideNodeEvent("foo", "mockgeodata", "node");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.node, "node", "node property initialized");
	same(core.events.HideNodeEvent.type, "HideNodeEvent");
	same(event.type, "HideNodeEvent", "type property initialized");
});
test("NodeInfoEvent", function() {
	var event = new core.events.NodeInfoEvent("foo", "mockgeodata", "node");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.node, "node", "node property initialized");
	same(core.events.NodeInfoEvent.type, "NodeInfoEvent");
	same(event.type, "NodeInfoEvent", "type property initialized");
});
test("FlyToNodeEvent", function() {
	var event = new core.events.FlyToNodeEvent("foo", "mockgeodata", "node");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.node, "node", "node property initialized");
	same(core.events.FlyToNodeEvent.type, "FlyToNodeEvent");
	same(event.type, "FlyToNodeEvent", "type property initialized");
});
test("GeLoadedEvent", function() {
	var event = new core.events.GeLoadedEvent("foo");
	same(event.publisher, "foo", "publisher property initialized");
	same(core.events.GeLoadedEvent.type, "GeLoadedEvent");
	same(event.type, "GeLoadedEvent", "type property initialized");
});
test("GeUnloadedEvent", function() {
	var event = new core.events.GeUnloadedEvent("foo");
	same(event.publisher, "foo", "publisher property initialized");
	same(core.events.GeUnloadedEvent.type, "GeUnloadedEvent");
	same(event.type, "GeUnloadedEvent", "type property initialized");
});
test("MapLoadedEvent", function() {
	var event = new core.events.MapLoadedEvent("foo");
	same(event.publisher, "foo", "publisher property initialized");
	same(core.events.MapLoadedEvent.type, "MapLoadedEvent");
	same(event.type, "MapLoadedEvent", "type property initialized");
});
test("MapUnloadedEvent", function() {
	var event = new core.events.MapUnloadedEvent("foo");
	same(event.publisher, "foo", "publisher property initialized");
	same(core.events.MapUnloadedEvent.type, "MapUnloadedEvent");
	same(event.type, "MapUnloadedEvent", "type property initialized");
});
test("EventChannel",
        function() {
	        var test2 = function() {
		        var channel = new core.events.EventChannel();
		        var event = new core.events.MapUnloadedEvent();
		        var brokenConsumerInvoked = false;
		        channel.subscribe(core.events.MapUnloadedEvent.type,
		                function() {
			                equal(brokenConsumerInvoked, false,
			                        "consumer only invoked once per event");
			                brokenConsumerInvoked = true;
			                throw "Consumer threw an exception!";
		                });
		        var geLoadedConsumerInvoked = false;
		        channel.subscribe(core.events.GeLoadedEvent.type, function(
		                eventParam, arg) {
			        geLoadedConsumerInvoked = true;
		        });
		        var MyObj = function() {
			        this.myProperty = "123";
		        };
		        var consumerInvoked = false;
		        channel.subscribe(core.events.MapUnloadedEvent.type, {
		            callback : function(eventParam, arg) {
			            equal(consumerInvoked, false,
			                    "consumer only invoked once per event");
			            consumerInvoked = true;
			            same(eventParam, event,
			                    "consumer invoked with correct event");
			            same(arg, "foo", "consumer invoked with arg");
			            same(this.myProperty, "123",
			                    "consumer invoked in correct context");
		            },
		            context : new MyObj(),
		            arg : "foo"
		        });
		        channel.publish(event);
		        var asserts = function() {
			        equal(brokenConsumerInvoked, true,
			                "consumer that throws exception was invoked");
			        equal(geLoadedConsumerInvoked, false,
			                "consumer not subscribed to event type published was not invoked");
			        equal(consumerInvoked, true,
			                "consumer that subscribed with callback object was invoked");
			        start();
		        };
		        setTimeout(asserts, 200);
	        };

	        var test1 = function() {
		        var channel = new core.events.EventChannel();
		        var event = new core.events.MapUnloadedEvent();
		        var callbackInvoked = false;
		        channel.subscribe(core.events.MapUnloadedEvent.type, function(
		                eventParam, arg) {
			        equal(callbackInvoked, false,
			                "consumer invoked once per event");
			        callbackInvoked = true;
			        same(eventParam, event,
			                "callback was invoked with correct event object");
			        equal(arg, null,
			                "callback was invoked with correct argument");
		        });
		        channel.publish(event);
		        equal(callbackInvoked, false,
		                "publish() returns immediately, doesn't wait for consumers to be invoked");
		        var asserts = function() {
			        equal(callbackInvoked, true, "callback was invoked");
			        test2();
		        };
		        setTimeout(asserts, 200);
	        };

	        stop();

	        test1();
        });