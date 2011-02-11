module("core.events.NodeInfoEvent");

test("NodeInfoEvent", function() {
	var event = new core.events.NodeInfoEvent("foo", "mockgeodata", "node");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.node, "node", "node property initialized");
	same(core.events.NodeInfoEvent.type, "NodeInfoEvent");
	same(event.type, "NodeInfoEvent", "type property initialized");
});