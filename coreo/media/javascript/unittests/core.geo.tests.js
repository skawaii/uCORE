module("core.geo");

test("GeoData", function() {
	ok(new core.geo.GeoData(), "GeoData exists");
});

test("GeoDataFactory", function() {
	// create GeoData from KML string
	var kml = "<kml><Placemark><name>foo</name></Placemark></kml>";
	var geoData = core.geo.GeoDataFactory.fromKmlString(kml);
	ok(typeof geoData == "object", "fromKmlString() returned an object");
	same(geoData.id, "1", "id property initialized");
	same(geoData.getKmlString(), kml, "KML string is unchanged");
	ok(geoData.getKmlDom(), "KML DOM can be created");
	ok(geoData.getKmlDom().documentElement.nodeName, "KML", "root node is \"KML\"");
	
	// create GeoData from XML DOM
	var dom = core.util.createXmlDoc(kml);
	geoData = core.geo.GeoDataFactory.fromKmlDom(dom);
	ok(typeof geoData == "object", "fromKmlDom() returned an object");
	same(geoData.id, "2", "id property initialized");
	same(geoData.getKmlDom(), dom, "KML DOM is unchanged");
	ok(typeof geoData.getKmlString() == "string", "getKmlString() creates a string");
	same(geoData.getKmlString().toLowerCase(), kml.toLowerCase());
});