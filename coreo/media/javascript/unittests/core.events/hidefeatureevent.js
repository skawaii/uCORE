module("core.events.HideFeatureEvent");

test("HideFeatureEvent", function() {
	var event = new core.events.HideFeatureEvent("foo", "mockgeodata");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(core.events.HideFeatureEvent.type, "HideFeatureEvent");
	same(event.type, "HideFeatureEvent", "type property initialized");
});