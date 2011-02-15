module("core.events.FeatureInfoEvent");

test("FeatureInfoEvent", function() {
	var event = new core.events.FeatureInfoEvent("foo", "mockgeodata");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(core.events.FeatureInfoEvent.type, "FeatureInfoEvent");
	same(event.type, "FeatureInfoEvent", "type property initialized");
});