module("core.events.FlyToNodeEvent");

test("FlyToNodeEvent", function() {
	var event = new core.events.FlyToNodeEvent("foo", "mockgeodata", "node");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.node, "node", "node property initialized");
	same(core.events.FlyToNodeEvent.type, "FlyToNodeEvent");
	same(event.type, "FlyToNodeEvent", "type property initialized");
});