module("core.geo");

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

test("KmlDomGeoDataFeature", function() {
	var kml = "<kml randomattribute=\"junk\"><Document id=\"3\"><Placemark/></Document><NetworkLink/><NotAFeature/></kml>";
	var dom = jQuery.parseXML(kml);
	var documentEl = dom.documentElement.childNodes[0];
	var owner = new core.geo.KmlDomGeoDataContainer("1", dom, "core");
	var feature = new core.geo.KmlDomGeoDataFeature(owner, "2", documentEl, "core");
	
	core.testutils.assertImplements(feature, core.geo.GeoDataFeature.prototype);
	
	// test owner property
	ok("owner" in feature, "has owner property");
	strictEqual(feature.owner, owner, "owner property initialized correctly");
	
	// test id property
	ok("id" in feature, "has id property");
	strictEqual(feature.id, "2", "id property initialized correctly");
	
	// test getKmlString
	ok(typeof feature.getKmlString() === "string", "getKmlString() returns a string");
	
	// test getKmlNode
	strictEqual(feature.getKmlDomNode(), documentEl, "getKmlDomNode() returns the correct node");
	
	// test getParent()
	var parent = feature.getParent();
	ok(parent, "getParent() retuns an object when there is a parent");
	ok("id" in parent, "getParent() returns object with an id property");
	strictEqual(parent, owner, "getParent() returns owner");
	strictEqual(parent.id, owner.id, "getParent() returns object with correct ID");
	strictEqual(owner.getParent(), null, "root element's parent is null");
	feature.walkChildren(function(child) {
		var walkChildrenParent = child.getParent();
		notEqual(walkChildrenParent, null, "walkChildren's child doesn't have a null parent");
		strictEqual(walkChildrenParent.id, feature.id, "getParent() return object's ID is equal to \"feature\" variable's ID");
	});
	
	// test walkChildren
	var children = [];
	feature.walkChildren(function(child) {
		children.push(child);
	});
	strictEqual(children.length, 1, "walkChildren identified the correct number of feature child nodes");
	strictEqual(children[0].node.tagName, "Placemark", "walkChildren() identifies children of feature objects");
	
	children = [];
	owner.walkChildren(function(child) {
		children.push(child);
	});		
	strictEqual(children.length, 2, "walkChildren identified the correct number of feature child nodes");
	var child = children[0];
	core.testutils.assertImplements(child, core.geo.GeoDataFeature.prototype);
	ok("id" in child, "child has an id property");
	ok(child.id.length > 0, "id property was assigned");
	ok("owner" in child, "child has owner property");
	strictEqual(child.owner, owner, "owner property was assigned");
	ok(child.getKmlString().length > 0, "child's getKmlString() returned text");
	child = children[1];
	core.testutils.assertImplements(child, core.geo.GeoDataFeature.prototype);
	ok("id" in child, "child has an id property");
	ok(child.id.length > 0, "id property was assigned");
	ok("owner" in child, "child has owner property");
	strictEqual(child.owner, owner, "owner property was assigned");
	ok(child.getKmlString().length > 0, "child's getKmlString() returned text");
	
	// test walkChildren when document has namespaces
	kml = "<k:kml randomattribute=\"junk\" xmlns:k=\"http://www.opengis.net/kml/2.2\"><k:Document id=\"3\"><k:Placemark/></k:Document><k:NetworkLink/><k:NotAFeature/></k:kml>";
	dom = jQuery.parseXML(kml);
	owner = new core.geo.KmlDomGeoDataContainer("1", dom, "core");
	children = [];
	owner.walkChildren(function(child) {
		children.push(child);
	});
	strictEqual(children.length, 2, "walkChildren identified the correct number of feature child nodes");
	strictEqual(core.util.getQualifiedName(children[0].node).localName, "Document");
	strictEqual(core.util.getQualifiedName(children[1].node).localName, "NetworkLink");
});

test("GeoData", function() {
	ok(new core.geo.GeoData(), "GeoData exists");
});

test("GeoDataFactory", function() {
	// create GeoData from KML string
	var kml = "<kml><Document><name>foo</name><open>1</open>" +
			"<Placemark><name>bar</name></Placemark>" +
			"<Placemark><name>baz</name></Placemark>" +
			"</Document></kml>";
	var geoData = core.geo.GeoDataFactory.fromKmlString(kml);
	ok(typeof geoData == "object", "fromKmlString() returned an object");
	ok(geoData.id, "id property initialized");
	same(geoData.getKmlString(), kml, "KML string is unchanged");
	ok(geoData.getKmlDomNode(), "KML DOM can be created");
	same(geoData.getKmlDomNode().nodeName, "KML", "root node is \"KML\"");
	same(geoData.getParent(), null, "Parent of root node is null");
	var children = geoData.getChildren();
	ok(children, "root GeoData has children");
	same(children.length, 1, "root node has 1 child");
	var document = children[0];
	same(document.getKmlDomNode().nodeName, "DOCUMENT", "child node is \"DOCUMENT\"");
	same(document.getParent(), geoData, "parent node of document is the root node");
	children = document.getChildren();
	same(children.length, 2, "Document node has 2 children");
	var placemark = children[0];
	same(placemark.getKmlDomNode().nodeName, "PLACEMARK", "child node is \"PLACEMARK\"");
	same(placemark.getParent(), geoData, "parent node of placemark is the document node");
	var placemark = children[1];
	same(placemark.getKmlDomNode().nodeName, "PLACEMARK", "child node is \"PLACEMARK\"");
	same(placemark.getParent(), geoData, "parent node of placemark is the document node");
	
	var firstId = geoData.id;
	
	// create GeoData from XML DOM
	var dom = core.util.createXmlDoc(kml);
	geoData = core.geo.GeoDataFactory.fromKmlDom(dom);
	ok(typeof geoData == "object", "fromKmlDom() returned an object");
	ok(geoData.id != firstId, "id property initialized");
	same(geoData.getKmlDomNode(), dom, "KML DOM is unchanged");
	ok(typeof geoData.getKmlString() == "string", "getKmlString() creates a string");
	same(geoData.getKmlString().toLowerCase(), kml.toLowerCase());
	same(geoData.getParent(), null, "Parent of root node is null");
	ok(children, "root GeoData has children");
});