module("core.events.MapUnloadedEvent");

test("MapUnloadedEvent", function() {
	var event = new core.events.MapUnloadedEvent("foo");
	same(event.publisher, "foo", "publisher property initialized");
	same(core.events.MapUnloadedEvent.type, "MapUnloadedEvent");
	same(event.type, "MapUnloadedEvent", "type property initialized");
});