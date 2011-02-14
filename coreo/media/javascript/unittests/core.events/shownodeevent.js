module("core.events.ShowNodeEvent");

test("ShowNodeEvent", function() {
	var event = new core.events.ShowNodeEvent("foo", "mockgeodata", "node");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.node, "node", "node property initialized");
	same(core.events.ShowNodeEvent.type, "ShowNodeEvent");
	same(event.type, "ShowNodeEvent", "type property initialized");
});