module("core.events.GeoDataNodeEvent");

test("GeoDataNodeEvent", function() {
	var event = new core.events.GeoDataNodeEvent("foo", "mockgeodata", "node",
	        "GeoDataNodeEvent");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.node, "node", "node property initialized");
	same(event.type, "GeoDataNodeEvent", "type property initialized");
});