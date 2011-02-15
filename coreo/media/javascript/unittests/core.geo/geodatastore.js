module("core.geo.GeoDataStore");

test("idExists", function() {
	ok("idExists" in core.geo.GeoDataStore, "contains idExists member");
	strictEqual(typeof core.geo.GeoDataStore.idExists, "function", "idExists is a function");
	strictEqual(core.geo.GeoDataStore.idExists(undefined), false);
	strictEqual(core.geo.GeoDataStore.idExists(null), false);
	var feature = {};
	feature = core.geo.GeoDataStore.persist(feature);
	var id = feature.id;
	strictEqual(core.geo.GeoDataStore.idExists(""), false);
	strictEqual(core.geo.GeoDataStore.idExists(id), true);
	strictEqual(core.geo.GeoDataStore.idExists("_"), false);
});

test("generateId", function() {
	ok("generateId" in core.geo.GeoDataStore, "contains generateId member");
	strictEqual(typeof core.geo.GeoDataStore.generateId, "function", "generateId is a function");
	var id = core.geo.GeoDataStore.generateId();
	ok(id, "generateId returns something");
	same(typeof id, "string", "generateId returns a string");
	ok(/[a-zA-Z]+-[0-9]+/.test(id), "generateId returns a string of the expected format");
	var id2 = core.geo.GeoDataStore.generateId();
	notEqual(id2, id, "generateId returns unique IDs");
});

test("persist", function() {
	ok("persist" in core.geo.GeoDataStore, "contains persist member");
	strictEqual(typeof core.geo.GeoDataStore.persist, "function", "persist is a function");
	strictEqual(core.geo.GeoDataStore.persist(undefined), undefined);
	strictEqual(core.geo.GeoDataStore.persist(null), null);
	var postSaveInvokes1 = [];
	var feature = {
			id: null,
			thisIsMine: true,
			getFeatureById: function(id) {
				return "foo";
			},
			postSave: function() {
				postSaveInvokes1.push(this.id);
			}
	};
	var persisted = core.geo.GeoDataStore.persist(feature);
	strictEqual(persisted, feature);
	notEqual(persisted.id, null);
	strictEqual(persisted.id, feature.id);
	strictEqual(persisted.thisIsMine, true);
	strictEqual(postSaveInvokes1.length, 1, "postSave() was invoked");
	strictEqual(postSaveInvokes1[0], persisted.id, "postSave() was invoked after ID was set");
	strictEqual(core.geo.GeoDataStore.getById(persisted.id), persisted);
	var postSaveInvokes2 = [];
	var subfeature = {
			owner: feature,
			postSave: function() {
				postSaveInvokes2.push(this.id);
			}
	};
	var persisted2 = core.geo.GeoDataStore.persist(subfeature);
	strictEqual(persisted2, subfeature);
	ok("id" in persisted2);
	notEqual(persisted2.id, null);
	strictEqual(postSaveInvokes2.length, 1, "postSave() was invoked");
	strictEqual(postSaveInvokes2[0], persisted2.id, "postSave() was invoked after ID was set");
	strictEqual(postSaveInvokes1.length, 1, "postSave() was not invoked again on owner object");
	// invoking getFeatureById will always return "foo" for the owner feature
	strictEqual(core.geo.GeoDataStore.getById(persisted2.id), "foo");

	// test when object to be persisted doesn't have postSave() function
	persisted = core.geo.GeoDataStore.persist({});
	ok(persisted.id);
	notEqual(persisted.id, null);
	
	// test when object to be persisted has a postSave member, but it isn't a function
	persisted = core.geo.GeoDataStore.persist({ postSave: "foo" });
	ok(persisted.id);
	notEqual(persisted.id, null);
});

test("getById", function() {
	ok("getById" in core.geo.GeoDataStore, "contains getById member");
	strictEqual(typeof core.geo.GeoDataStore.getById, "function", "getById is a function");	
});

test("deleteById", function() {
	ok("deleteById" in core.geo.GeoDataStore, "contains deleteById member");
	strictEqual(typeof core.geo.GeoDataStore.deleteById, "function", "deleteById is a function");
});

/*
test("GeoDataStore", function() {
	same(typeof core.geo.GeoDataStore, "object", "core.geo.GeoDataStore exists");
	
	var kml = "<kml><Document id=\"1\"><name>foo</name><open>1</open>" +
		"<Placemark><name>bar</name></Placemark>" +
		"<Placemark><name>baz</name></Placemark>" +
		"</Document></kml>";
	
	// test createFromKmlString()
	var geoData = core.geo.GeoDataStore.createFromKmlString(kml);
	strictEqual(typeof geoData, "object", "createFromKmlString() returns an object");
	strictEqual(typeof geoData.id, "string", "returned object has an ID");
	ok("owner" in geoData, "returned object has an owner property");
	strictEqual(geoData.owner, null, "returned object's owner property is null");
	core.testutils.assertImplements(geoData, core.geo.GeoDataContainer.prototype);
	try {
		core.geo.GeoDataStore.createFromKmlString([]);
		ok(false, "createFromKmlString should throw exception if parameter isn't a string (an array)");
	}
	catch (e) {
		strictEqual("" + e, "parameter must be a non-null string", 
				"createFromKmlString raises correct exception when parameter isn't a string (an array)");
	}
	try {
		core.geo.GeoDataStore.createFromKmlString(1);
		ok(false, "createFromKmlString should throw exception if parameter isn't a string (a primitive)");
	}
	catch (e) {
		strictEqual("" + e, "parameter must be a non-null string", 
				"createFromKmlString raises correct exception when parameter isn't a string (a primitive)");
	}
	try {
		core.geo.GeoDataStore.createFromKmlString(new Object());
		ok(false, "createFromKmlString should throw exception if parameter isn't a string (an object)");
	}
	catch (e) {
		strictEqual("" + e, "parameter must be a non-null string", 
				"createFromKmlString raises correct exception when parameter isn't a string (an object)");
	}
	try {
		core.geo.GeoDataStore.createFromKmlString(null);
		ok(false, "createFromKmlString should throw exception if parameter is null");
	}
	catch (e) {
		strictEqual("" + e, "parameter must be a non-null string", 
				"createFromKmlString raises correct exception when parameter is null");
	}
	try {
		core.geo.GeoDataStore.createFromKmlString(undefined);
		ok(false, "createFromKmlString should throw exception if parameter is undefined");
	}
	catch (e) {
		strictEqual("" + e, "parameter must be a non-null string", 
				"createFromKmlString raises correct exception when parameter is undefined");
	}
	try {
		core.geo.GeoDataStore.createFromKmlString("foo");
		ok(false, "createFromKmlString should throw exception if parameter is ill-formed XML");
	}
	catch (e) {
		strictEqual("" + e, "string does not contain well-formed XML", 
				"createFromKmlString raises correct exception when parameter contains ill-formed XML");
	}
	try {
		core.geo.GeoDataStore.createFromKmlString("<foo/>");
		ok(false, "createFromKmlString should throw exception if parameter is invalid KML");
	}
	catch (e) {
		strictEqual("" + e, "parameter contains invalid KML", 
				"createFromKmlString raises correct exception when parameter contains invalid KML");
	}

	// test createFromKmlDom()
	var kmlDom = jQuery.parseXML(kml);
	geoData = core.geo.GeoDataStore.createFromKmlDom(kmlDom);
	strictEqual(typeof geoData, "object", "createFromKmlDom() returns an object");
	strictEqual(typeof geoData.id, "string", "returned object has an ID");
	ok("owner" in geoData, "returned object has an owner property");
	strictEqual(geoData.owner, null, "returned object's owner property is null");
	core.testutils.assertImplements(geoData, core.geo.GeoDataContainer.prototype);
	try {
		core.geo.GeoDataStore.createFromKmlDom([]);
		ok(false, "createFromKmlDom should throw exception if parameter isn't a DOM object (an array)");
	}
	catch (e) {
		strictEqual("" + e, "parameter must be a non-null XML DOM", 
				"createFromKmlDom raises correct exception when parameter isn't a DOM object (an array)");
	}
	try {
		core.geo.GeoDataStore.createFromKmlDom(1);
		ok(false, "createFromKmlDom should throw exception if parameter isn't a DOM object (a primitive)");
	}
	catch (e) {
		strictEqual("" + e, "parameter must be a non-null XML DOM", 
				"createFromKmlDom raises correct exception when parameter isn't a DOM object (a primitive)");
	}
	try {
		core.geo.GeoDataStore.createFromKmlDom(new Object());
		ok(false, "createFromKmlDom should throw exception if parameter isn't a DOM object (an object)");
	}
	catch (e) {
		strictEqual("" + e, "parameter must be a non-null XML DOM", 
				"createFromKmlDom raises correct exception when parameter isn't a DOM object (an object)");
	}
	try {
		core.geo.GeoDataStore.createFromKmlDom(null);
		ok(false, "createFromKmlDom should throw exception if parameter is null");
	}
	catch (e) {
		strictEqual("" + e, "parameter must be a non-null XML DOM", 
				"createFromKmlDom raises correct exception when parameter is null");
	}
	try {
		core.geo.GeoDataStore.createFromKmlDom(undefined);
		ok(false, "createFromKmlDom should throw exception if parameter is undefined");
	}
	catch (e) {
		strictEqual("" + e, "parameter must be a non-null XML DOM", 
				"createFromKmlDom raises correct exception when parameter is undefined");
	}

	// should be able to create from a node, not just a document
	geoData = core.geo.GeoDataStore.createFromKmlDom(kmlDom.documentElement);
	strictEqual(typeof geoData, "object", "createFromKmlDom() can create GeoDataContainers from nodes");
	strictEqual(typeof geoData, "object", "createFromKmlDom() returns an object");
	strictEqual(typeof geoData.id, "string", "returned object has an ID");
	ok("owner" in geoData, "returned object has an owner property");
	strictEqual(geoData.owner, null, "returned object's owner property is null");
	core.testutils.assertImplements(geoData, core.geo.GeoDataContainer.prototype);
	strictEqual(typeof geoData.getFeatureById("1"), "object", "getFeatureById() works on object returned from createFromKmlDom(node)");

	// test generateId()
	var id = core.geo.GeoDataStore.generateId();
	same(typeof id, "string", "generateId returns a string");
	ok(/[a-zA-Z]+-[0-9]+/.test(id), "generateId returns a string of the expected format");
	var id2 = core.geo.GeoDataStore.generateId();
	notEqual(id2, id, "generateId returns unique IDs");
	
	// test getById()
	var geoData2 = core.geo.GeoDataStore.createFromKmlString(kml);
	var result = core.geo.GeoDataStore.getById(geoData.id);
	strictEqual(result, geoData, "getById() returns an object when it exists");
	result = core.geo.GeoDataStore.getById(geoData2.id);
	strictEqual(result, geoData2, "getById() returns an object when it exists");
	result = core.geo.GeoDataStore.getById("foo");
	same(result, null, "getById() returns null when the datastore doesn't contain the ID");
	
	// test deleteById()
	core.geo.GeoDataStore.deleteById(geoData.id);
	result = core.geo.GeoDataStore.getById("foo");
	same(result, null, "deleteById() removes the object from the datastore");
	result = core.geo.GeoDataStore.getById(geoData2.id);
	same(result, geoData2, "deleteById() didn't remove other objects from the datastore");
	core.geo.GeoDataStore.deleteById("foo");
	
	// test for when a KML document containing duplicate IDs is added to the store
	geoData = core.geo.GeoDataStore.createFromKmlString("<kml><Document/></kml>");
	geoData2 = core.geo.GeoDataStore.createFromKmlString("<kml><Document id=\"" + geoData.id + "\"></Document></kml>");
	strictEqual(core.geo.GeoDataStore.getById(geoData.id), geoData);
	strictEqual(geoData2.getFeatureById(geoData.id), null);
	
	geoData = core.geo.GeoDataStore.createFromKmlString("<k:kml xmlns:k=\"http://www.opengis.net/kml/2.2\"><k:Document></k:Document></k:kml>");
	ok(geoData, "GeoDataContainer can be created from XML with namespaces");
});
*/