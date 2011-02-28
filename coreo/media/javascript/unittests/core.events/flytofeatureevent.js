module("core.events.FlyToFeatureEvent");

test("FlyToFeatureEvent", function() {
	var event = new core.events.FlyToFeatureEvent("foo", "mockgeodata");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(core.events.FlyToFeatureEvent.type, "FlyToFeatureEvent");
	same(event.type, "FlyToFeatureEvent", "type property initialized");
});