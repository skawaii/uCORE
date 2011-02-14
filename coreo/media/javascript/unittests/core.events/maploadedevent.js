module("core.events.MapLoadedEvent");

test("MapLoadedEvent", function() {
	var event = new core.events.MapLoadedEvent("foo");
	same(event.publisher, "foo", "publisher property initialized");
	same(core.events.MapLoadedEvent.type, "MapLoadedEvent");
	same(event.type, "MapLoadedEvent", "type property initialized");
});