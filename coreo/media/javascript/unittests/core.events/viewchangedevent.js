module("core.events.ViewChangedEvent");

test("constructor", function() {
	var event = new core.events.ViewChangedEvent("publisher", "bounds", "altitude");
	ok(event);
	strictEqual(event.publisher, "publisher");
	strictEqual(event.bounds, "bounds");
	strictEqual(event.altitude, "altitude");
	core.testutils.assertImplements(event, core.events.Event.prototype);
});

test("type", function() {
	strictEqual(core.events.ViewChangedEvent.type, "ViewChangedEvent");
});