module("core.events.GeoDataLoadedEvent");

test("GeoDataLoadedEvent", function() {
	var event = new core.events.GeoDataLoadedEvent("foo", "mockgeodata");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(core.events.GeoDataLoadedEvent.type, "GeoDataLoadedEvent");
	same(event.type, "GeoDataLoadedEvent", "type property initialized");
});