module("core.gearth.GeController");

test("constructor", function() {
	var ge = {};
	var controller = new core.gearth.GeController(ge);
	ok(controller);
	strictEqual(controller.ge, ge);
	ok(controller.kmlObjectStore);
	strictEqual(controller.kmlObjectStore.ge, ge);
});

test("add", function() {
	var geFeatures = {
		appendedChildren: [],
		appendChild: function(child) {
			this.appendedChildren.push(child);
		}
	};
	var ge = {
		getFeatures: function() {
			return geFeatures;
		}
	};
	var controller = new core.gearth.GeController(ge);
	var kmlObjectStore = controller.kmlObjectStore;
	var mockKmlObject = {};
	var getKmlObjectInvokes = [];
	kmlObjectStore.getKmlObject = function(geoData) {
		getKmlObjectInvokes.push(geoData);
		return mockKmlObject;
	};
	var geoData = {};
	controller.add(geoData);
	strictEqual(getKmlObjectInvokes.length, 1);
	strictEqual(getKmlObjectInvokes[0], geoData);
	strictEqual(geFeatures.appendedChildren.length, 1);
	strictEqual(geFeatures.appendedChildren[0], mockKmlObject);
});

test("show", function() {
	var geFeatures = {
		appendedChildren: [],
		appendChild: function(child) {
			this.appendedChildren.push(child);
		}
	};
	var ge = {
		getFeatures: function() {
			return geFeatures;
		}
	};
	var controller = new core.gearth.GeController(ge);
	var kmlObjectStore = controller.kmlObjectStore;
	var mockKmlObject = {};
	var getKmlObjectInvokes = [];
	kmlObjectStore.getKmlObject = function(geoData) {
		getKmlObjectInvokes.push(geoData);
		return mockKmlObject;
	};
	var geoData = {};
	controller.show(geoData);
	strictEqual(getKmlObjectInvokes.length, 1);
	strictEqual(getKmlObjectInvokes[0], geoData);
	strictEqual(geFeatures.appendedChildren.length, 1);
	strictEqual(geFeatures.appendedChildren[0], mockKmlObject);
});

test("hide", function() {
	var geFeatures = {
		removedChildren: [],
		removeChild: function(child) {
			this.removedChildren.push(child);
		}
	};
	var ge = {
		getFeatures: function() {
			return geFeatures;
		}
	};
	var controller = new core.gearth.GeController(ge);
	var kmlObjectStore = controller.kmlObjectStore;
	var mockKmlObject = {};
	var getKmlObjectInvokes = [];
	kmlObjectStore.getKmlObject = function(geoData) {
		getKmlObjectInvokes.push(geoData);
		return mockKmlObject;
	};
	var removeKmlObjectInvokes = [];
	kmlObjectStore.removeKmlObject = function(geoData) {
		removeKmlObjectInvokes.push(geoData);
	};
	var geoData = {};
	controller.hide(geoData);
	strictEqual(getKmlObjectInvokes.length, 1);
	strictEqual(getKmlObjectInvokes[0], geoData);
	strictEqual(removeKmlObjectInvokes.length, 1);
	strictEqual(removeKmlObjectInvokes[0], geoData);
	strictEqual(geFeatures.removedChildren.length, 1);
	strictEqual(geFeatures.removedChildren[0], mockKmlObject);
});

test("info", function() {
	var balloon = {
		feature: null,
		setFeature: function(kmlObject) {
			this.feature = kmlObject;
		},
		closeButtonEnabled: null,
		setCloseButtonEnabled: function(enabled) {
			this.closeButtonEnabled = enabled;
		}
	};
	var ge = {
		setBalloonInvokes: [],
		setBalloon: function(balloon) {
			this.setBalloonInvokes.push(balloon);
		},
		createBalloonInvokes: [],
		createHtmlStringBalloon: function(str) {
			this.createBalloonInvokes.push(str);
			return balloon;
		}
	};
	var controller = new core.gearth.GeController(ge);
	var kmlObjectStore = controller.kmlObjectStore;
	var mockKmlObject = {};
	var getKmlObjectInvokes = [];
	kmlObjectStore.getKmlObject = function(geoData) {
		getKmlObjectInvokes.push(geoData);
		return mockKmlObject;
	};
	var geoData = {};
	controller.info(geoData);

	strictEqual(ge.setBalloonInvokes.length, 2);
	strictEqual(ge.setBalloonInvokes[0], null);
	strictEqual(ge.setBalloonInvokes[1], balloon);
	strictEqual(getKmlObjectInvokes.length, 1);
	strictEqual(getKmlObjectInvokes[0], geoData);
	strictEqual(ge.createBalloonInvokes.length, 1);
	strictEqual(ge.createBalloonInvokes[0], "");
	strictEqual(balloon.feature, mockKmlObject);
	strictEqual(balloon.closeButtonEnabled, true);
});

test("flyTo", function() {
	var mockGeView = {
		view: null,
		setAbstractView: function(view) {
			this.view = view;
		}
	};
	var ge = {
		getView: function() {
			return mockGeView;
		}
	};
	var controller = new core.gearth.GeController(ge);
	var kmlObjectStore = controller.kmlObjectStore;
	var mockAbstractView = {};
	var mockKmlObject = {
		getAbstractView: function() {
			return mockAbstractView;
		}
	};
	var getKmlObjectInvokes = [];
	kmlObjectStore.getKmlObject = function(geoData) {
		getKmlObjectInvokes.push(geoData);
		return mockKmlObject;
	};
	var geoData = {};

	controller.flyTo(geoData);
	strictEqual(mockGeView.view, mockAbstractView);
	
	kmlObjectStore.getKmlObject = function(geoData) {
		return {
			getAbstractView: "foo"
		};
	};
	raises(function() {controller.flyTo(geoData);});
	
	kmlObjectStore.getKmlObject = function(geoData) {
		return {};
	};
	raises(function() {controller.flyTo(geoData);});
	
	kmlObjectStore.getKmlObject = function(geoData) {
		return null;
	};
	controller.flyTo(geoData);
	
	kmlObjectStore.getKmlObject = function(geoData) {
		return undefined;
	};
	controller.flyTo(geoData);
	
	controller.flyTo(null);
	controller.flyTo(undefined);
	controller.flyTo("foo");
	controller.flyTo([]);
	controller.flyTo(1);
});

//test("GeController", function() {
//	$("<div id=\"earth\"></div>").appendTo(document.body);
//
//	var earthCreated = function(ge) {
//		ge.getWindow().setVisibility(true);
//
//		var geAdapter = new core.gearth.GeController(ge);
//		ok("ge" in geAdapter, "GeController has a 'ge' property");
//		strictEqual(geAdapter.ge, ge, "GeController's 'ge' property was initialized correctly");
//		
//		var kml = "<kml xmlns=\"http://www.opengis.net/kml/2.2\">"
//				+ "<Document>"
//				+ "<name>test document</name>"
//				+ "<open>1</open>"
//				+ "<Placemark>"
//				+ "<name>test placemark</name>"
//				+ "<open>1</open>"
//				+ "<LookAt>"
//			    + "<longitude>-90.86879847669974</longitude>"
//			    + "<latitude>48.25330383601299</latitude>"
//			    + "<range>440.8</range>"
//			    + "<tilt>8.3</tilt>"
//			    + "<heading>2.7</heading>"
//			    + "</LookAt>"
//				+ "<Point>"
//				+ "<coordinates>-90.86948943473118,48.25450093195546,0</coordinates>"
//				+ "</Point>"
//				+ "</Placemark>"
//				+ "</Document>"
//				+ "</kml>";
//		var geoDataContainer = core.geo.GeoDataStore.createFromKmlString(kml);
//		geAdapter.add(geoDataContainer);
//		
//		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
//		lookAt.setLatitude(48.25450093195546);
//		lookAt.setLongitude(-90.86948943473118);
//		lookAt.setRange(30000);
//		ge.getView().setAbstractView(lookAt)
//		
//		geAdapter.hide(geoDataContainer);
//		
//		// ge.getFeatures().appendChild(new google.maps.Marker(new google.maps.LatLng(48.25330383601299, -90.86879847669974), new google.maps.MarkerOptions({title: "foo"})));
//		
//		/*
//		var geoXml = new google.maps.GeoXml("http://localhost:8080/site_media/javascript/unittests/test.kml");
//		google.maps.Event.addListener(geoXml, "load", function() {
//			alert(core.util.describe(geoXml));
//		});
//		*/
//		
//		// alert(typeof geoXml);
//		
//		/*
//		ok(geoData.getKmlObject(), "GeoData instance now has a getKmlObject() function");
//		var kmlObject = geoData.getKmlObject();
//		var kmlObjectList = kmlObject.getFeatures().getChildNodes();
//		alert(kmlObjectList.item(0).getName());
//		
//		// test hide
//		var kmlDom = geoData.getKmlDom();
//		var node = kmlDom.documentElement.childNodes.item(0).getElementsByTagName("Placemark").item(0);
//		ok(kmlDom, "KML DOM isn't null");
//		geAdapter.hide(node, geoData);
//		*/
//		
//		start();
//	};
//	var earthNotCreated = function() {
//		ok(false, "GE instance created");
//		start();
//	};
//	google.earth.createInstance("earth", earthCreated, earthNotCreated);
//	stop();
//});