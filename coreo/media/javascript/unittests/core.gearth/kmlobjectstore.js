module("core.gearth.KmlObjectStore");

test("constructor", function() {
	var ge = {};
	var store = new core.gearth.KmlObjectStore(ge);
	ok(store);
	strictEqual(store.ge, ge);
	ok(store.datastore);
});

test("createKmlObject", function() {
	var mockKmlObject = {};
	var ge = {
		kmlStrings: [],
		parseKml: function(str) {
			this.kmlStrings.push(str);
			return mockKmlObject;
		}
	};
	var geoData = {
			getKmlString: function() {
				return "foo";
			}
	};
	var store = new core.gearth.KmlObjectStore(ge);
	var kmlObject = store.createKmlObject(geoData);
	strictEqual(kmlObject, mockKmlObject);
	strictEqual(ge.kmlStrings.length, 1);
	strictEqual(ge.kmlStrings[0], "foo");
});

test("getKmlObject", function() {
	var mockKmlObject = {};
	var ge = {
		kmlStrings: [],
		parseKml: function(str) {
			this.kmlStrings.push(str);
			return mockKmlObject;
		}
	};
	var geoData = {
			id: "1",
			getKmlString: function() {
				return "foo";
			}
	};
	var store = new core.gearth.KmlObjectStore(ge);
	var kmlObjectReturned = store.getKmlObject(geoData);
	strictEqual(kmlObjectReturned, mockKmlObject);
	strictEqual(ge.kmlStrings.length, 1, "ge.parseKML was invoked to create new KmlObject");
	strictEqual(ge.kmlStrings[0], "foo", "ge.parseKML was invoked with the KML from the GeoData object");
	strictEqual(store.datastore["1"], kmlObjectReturned, "KmlObject was persisted");
	
	var kmlObject2 = {};
	store.datastore["2"] = kmlObject2;
	strictEqual(store.getKmlObject({id: "2"}), kmlObject2);
});

test("removeKmlObject", function() {
	var ge = {};
	var store = new core.gearth.KmlObjectStore(ge);
	store.datastore["1"] = {};
	strictEqual("1" in store.datastore, true);
	store.removeKmlObject({id: "1"});
	strictEqual("1" in store.datastore, false);
});