module("core.events.Event");

test("Event", function() {
	var event = new core.events.Event("foo", "Event");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.type, "Event", "type property initialized");
});