module("core.events.GeUnloadedEvent");

test("GeUnloadedEvent", function() {
	var event = new core.events.GeUnloadedEvent("foo");
	same(event.publisher, "foo", "publisher property initialized");
	same(core.events.GeUnloadedEvent.type, "GeUnloadedEvent");
	same(event.type, "GeUnloadedEvent", "type property initialized");
});