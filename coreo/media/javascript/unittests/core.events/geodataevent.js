module("core.events.GeoDataEvent");

test("GeoDataEvent", function() {
	var event = new core.events.GeoDataEvent("foo", "mockgeodata",
	        "GeoDataEvent");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(event.type, "GeoDataEvent", "type property initialized");
});