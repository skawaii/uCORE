module("core.events.HideNodeEvent");

test("HideNodeEvent", function() {
	var event = new core.events.HideNodeEvent("foo", "mockgeodata", "node");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.node, "node", "node property initialized");
	same(core.events.HideNodeEvent.type, "HideNodeEvent");
	same(event.type, "HideNodeEvent", "type property initialized");
});