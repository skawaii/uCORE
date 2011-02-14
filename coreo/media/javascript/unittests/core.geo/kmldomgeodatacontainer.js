module("core.geo.KmlDomGeoDataContainer");

test("KmlDomGeoDataContainer", function() {
	var kml = "<kml randomattribute=\"junk\"><Document id=\"3\"><Placemark/></Document><NetworkLink/><NotAFeature/></kml>";
	var dom = jQuery.parseXML(kml);
	var geoData = new core.geo.KmlDomGeoDataContainer("1", dom, "foo");
	core.testutils.assertImplements(geoData, core.geo.GeoDataContainer.prototype);
	
	// assign a "core" id to an element
	$(dom.documentElement.childNodes.item(0)).attr("foo:id", "2");
	
	// test getFeatureById
	strictEqual(geoData.getFeatureById("3"), null, "getFeatureById() returns null for ID that isn't the core-assigned ID");
	var feature = geoData.getFeatureById("2");
	ok(feature, "getFeatureById() returned an object for ID that exists");
	ok("id" in feature, "getFeatureById() returned an object with an ID");
	strictEqual(typeof feature.id, "string", "feature's ID property is a string");
	strictEqual(feature.id, "2", "getFeatureById() returned an object with an ID = core-assigned ID");
	core.testutils.assertImplements(feature, core.geo.GeoDataFeature.prototype);
	ok("owner" in feature, "returned object has an owner property");
	strictEqual(feature.owner, geoData, "returned object's owner property is equal to the GeoDataContainer");
	ok("node" in feature);
	notEqual(feature.node, null);
	ok("tagName" in feature.node);
	strictEqual(feature.node.tagName, "Document");
});