module("core.events.ShowFeatureEvent");

test("ShowFeatureEvent", function() {
	var event = new core.events.ShowFeatureEvent("foo", "mockgeodata");
	same(event.publisher, "foo", "publisher property initialized");
	same(event.geoData, "mockgeodata", "geoData property initialized");
	same(core.events.ShowFeatureEvent.type, "ShowFeatureEvent");
	same(event.type, "ShowFeatureEvent", "type property initialized");
});