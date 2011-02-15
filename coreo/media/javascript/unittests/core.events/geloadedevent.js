module("core.events.GeLoadedEvent");

test("GeLoadedEvent", function() {
	var event = new core.events.GeLoadedEvent("foo");
	same(event.publisher, "foo", "publisher property initialized");
	same(core.events.GeLoadedEvent.type, "GeLoadedEvent");
	same(event.type, "GeLoadedEvent", "type property initialized");
});