module("core.geo");

test("GeoData", function() {
	var geoData = new core.geo.GeoData();
	equal(geoData._kmlDom, null, "_kmlDom property is null");
	equal(geoData.getKmlDom(), null, "getKmlDom() returns null");
	
	geoData = core.geo.GeoData.fromKmlString("<kml></kml>");
	ok(geoData, "fromKmlString returns an object");
	ok(geoData.getKmlDom().documentElement, "fromKmlString returns a GeoData object with kmlDom");
	
	try {
		core.geo.GeoData.fromKmlString("<foo></foo>");
	}
	catch (e) {
		equal(e, "", "throws exception if not KML");
	}
});