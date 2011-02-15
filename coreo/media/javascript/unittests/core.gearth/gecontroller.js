module("core.gearth.GeController");

test("GeController", function() {
	$("<div id=\"earth\"></div>").appendTo(document.body);
    
	var earthCreated = function(ge) {
		ge.getWindow().setVisibility(true);
		
		var geAdapter = new core.gearth.GeController(ge);
		ok("ge" in geAdapter, "GeController has a 'ge' property");
		strictEqual(geAdapter.ge, ge, "GeController's 'ge' property was initialized correctly");
		
		var kml = "<kml xmlns=\"http://www.opengis.net/kml/2.2\">"
				+ "<Document>"
				+ "<name>test document</name>"
				+ "<open>1</open>"
				+ "<Placemark>"
				+ "<name>test placemark</name>"
				+ "<open>1</open>"
				+ "<LookAt>"
			    + "<longitude>-90.86879847669974</longitude>"
			    + "<latitude>48.25330383601299</latitude>"
			    + "<range>440.8</range>"
			    + "<tilt>8.3</tilt>"
			    + "<heading>2.7</heading>"
			    + "</LookAt>"
				+ "<Point>"
				+ "<coordinates>-90.86948943473118,48.25450093195546,0</coordinates>"
				+ "</Point>"
				+ "</Placemark>"
				+ "</Document>"
				+ "</kml>";
		var geoDataContainer = core.geo.GeoDataStore.createFromKmlString(kml);
		geAdapter.add(geoDataContainer);
		
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
		lookAt.setLatitude(48.25450093195546);
		lookAt.setLongitude(-90.86948943473118);
		lookAt.setRange(30000);
		ge.getView().setAbstractView(lookAt)
		
		geAdapter.hide(geoDataContainer);
		
		// ge.getFeatures().appendChild(new google.maps.Marker(new google.maps.LatLng(48.25330383601299, -90.86879847669974), new google.maps.MarkerOptions({title: "foo"})));
		
		/*
		var geoXml = new google.maps.GeoXml("http://localhost:8080/site_media/javascript/unittests/test.kml");
		google.maps.Event.addListener(geoXml, "load", function() {
			alert(core.util.describe(geoXml));
		});
		*/
		
		// alert(typeof geoXml);
		
		/*
		ok(geoData.getKmlObject(), "GeoData instance now has a getKmlObject() function");
		var kmlObject = geoData.getKmlObject();
		var kmlObjectList = kmlObject.getFeatures().getChildNodes();
		alert(kmlObjectList.item(0).getName());
		
		// test hide
		var kmlDom = geoData.getKmlDom();
		var node = kmlDom.documentElement.childNodes.item(0).getElementsByTagName("Placemark").item(0);
		ok(kmlDom, "KML DOM isn't null");
		geAdapter.hide(node, geoData);
		*/
		
		start();
	};
	var earthNotCreated = function() {
		ok(false, "GE instance created");
		start();
	};
	google.earth.createInstance("earth", earthCreated, earthNotCreated);
	stop();
});