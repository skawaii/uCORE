module("core.events.EventChannel");

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