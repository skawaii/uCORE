module("core.events.FeatureUpdatedEvent");

test("constructor", function() {
	var event = new core.events.FeatureUpdatedEvent("foo", "mockgeodata");
	strictEqual(event.publisher, "foo", "publisher property initialized");
	strictEqual(event.geoData, "mockgeodata", "geoData property initialized");
	strictEqual(core.events.FeatureUpdatedEvent.type, "FeatureUpdatedEvent");
	strictEqual(event.type, "FeatureUpdatedEvent", "type property initialized");
});