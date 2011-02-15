module("core.geo.KmlDomGeoDataFeature");

test("DEFAULT_NS_URI", function() {
	strictEqual(core.geo.KmlDomGeoDataFeature.DEFAULT_NS_URI, "urn:core:client-data");
});

test("DEFAULT_NS_PREFIX", function() {
	strictEqual(core.geo.KmlDomGeoDataFeature.DEFAULT_NS_PREFIX, "core-ext-111");
});

test("owner", function() {
	var feature = new core.geo.KmlDomGeoDataFeature("owner", "id", "node");
	strictEqual(feature.owner, "owner");
});

test("id", function() {
	var feature = new core.geo.KmlDomGeoDataFeature("owner", "id", "node");
	strictEqual(feature.id, "id");
});

test("node", function() {
	var feature = new core.geo.KmlDomGeoDataFeature("owner", "id", "node");
	strictEqual(feature.node, "node");
});

test("getIdFromElement", function() {
	strictEqual(typeof core.geo.KmlDomGeoDataFeature.getIdFromElement, "function");
	var dom = jQuery.parseXML("<foo1 ns1:id=\"1\" xmlns:ns1=\"" + core.geo.KmlDomGeoDataFeature.DEFAULT_NS_URI + "\">"
			+ "<foo2 ns1:id=\"2\" />"
			+ "<foo3>"
			+ "  <foo4 ns1:id=\"3\"/>"
			+ "  <foo5 ns2:id=\"4\" xmlns:ns2=\"urn:foo\"/>"
			+ "</foo3>"
			+ "<foo6 id=\"5\" />"
			+ "<foo7 " + core.geo.KmlDomGeoDataFeature.DEFAULT_NS_PREFIX + ":id=\"6\" />"
			+ "</foo1>");
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement(dom.documentElement), "1");
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement($(dom.documentElement).find("foo2")[0]), "2");
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement($(dom.documentElement).find("foo3")[0]), null);
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement($(dom.documentElement).find("foo4")[0]), "3");
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement($(dom.documentElement).find("foo5")[0]), null);
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement($(dom.documentElement).find("foo6")[0]), null);
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement($(dom.documentElement).find("foo7")[0]), null);
	
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement(null), null);
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement(undefined), null);
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement("foo"), null);
	strictEqual(core.geo.KmlDomGeoDataFeature.getIdFromElement([]), null);
});

test("setIdOnElement", function() {
	strictEqual(typeof core.geo.KmlDomGeoDataFeature.setIdOnElement, "function");
	var dom = jQuery.parseXML("<foo />");
	core.geo.KmlDomGeoDataFeature.setIdOnElement(dom.documentElement, "1");
	strictEqual($(dom.documentElement).attr("xmlns:" + core.geo.KmlDomGeoDataFeature.DEFAULT_NS_PREFIX),
			core.geo.KmlDomGeoDataFeature.DEFAULT_NS_URI);
	strictEqual($(dom.documentElement).attr(core.geo.KmlDomGeoDataFeature.DEFAULT_NS_PREFIX + ":id"), "1");
	dom = jQuery.parseXML("<foo xmlns:ns1=\"" + core.geo.KmlDomGeoDataFeature.DEFAULT_NS_URI + "\"><foo id=\"blah\"/></foo>");
	core.geo.KmlDomGeoDataFeature.setIdOnElement(dom.documentElement, "1");
	strictEqual($(dom.documentElement).attr("xmlns:" + core.geo.KmlDomGeoDataFeature.DEFAULT_NS_PREFIX),
			undefined);
	strictEqual($(dom.documentElement).attr("ns1:id"), "1");
	core.geo.KmlDomGeoDataFeature.setIdOnElement(dom.documentElement.childNodes[0], "2");
	strictEqual($(dom.documentElement).attr("xmlns:" + core.geo.KmlDomGeoDataFeature.DEFAULT_NS_PREFIX),
			undefined);
	strictEqual($(dom.documentElement).attr("ns1:id"), "2");
});

test("class hierarchy", function() {
	core.testutils.assertImplements(new core.geo.KmlDomGeoDataFeature(null, null, null), 
			core.geo.GeoDataFeature.prototype);
});

test("getParent", function() {
	var dom = jQuery.parseXML("<kml xmlns:ns1=\"" + core.geo.KmlDomGeoDataFeature.DEFAULT_NS_URI + "\" ns1:id=\"1\">"
			+ "<Document />"
			+ "<Document ns1:id=\"3\"><Placemark/></Document>"
			+ "</kml>");
	var owner = { id: "1" };
	var feature = new core.geo.KmlDomGeoDataFeature(owner, "2", dom.documentElement.childNodes[0]);
	strictEqual(feature.getParent(), owner);
	feature = new core.geo.KmlDomGeoDataFeature(owner, "1", dom.documentElement);
	strictEqual(feature.getParent(), null);
	feature = new core.geo.KmlDomGeoDataFeature(owner, "4", dom.documentElement.childNodes[1].childNodes[0]);
	var parent = feature.getParent();
	ok(parent);
	strictEqual(parent.id, "3");
	strictEqual(parent.node.tagName, "Document");
	strictEqual(parent.node.childNodes[0].tagName, "Placemark");
});

test("walkChildren", function() {
	var kml = "<kml randomattribute=\"junk\"><Document id=\"3\"><Placemark/></Document><NetworkLink/><NotAFeature/></kml>";
	var dom = jQuery.parseXML(kml);
	var documentEl = dom.documentElement.childNodes[0];
	var owner = new core.geo.KmlDomGeoDataContainer("1", dom);
	var feature = new core.geo.KmlDomGeoDataFeature(owner, "2", documentEl);
	
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
})

test("getKmlString", function() {
	var kml = "<kml randomattribute=\"junk\"><Document id=\"3\"><Placemark/></Document><NetworkLink/><NotAFeature/></kml>";
	var dom = jQuery.parseXML(kml);
	var documentEl = dom.documentElement.childNodes[0];
	var owner = new core.geo.KmlDomGeoDataContainer("1", dom);
	var feature = new core.geo.KmlDomGeoDataFeature(owner, "2", documentEl);
	ok(typeof feature.getKmlString() === "string", "getKmlString() returns a string");
});

test("getKmlDomNode", function() {
	var kml = "<kml randomattribute=\"junk\"><Document id=\"3\"><Placemark/></Document><NetworkLink/><NotAFeature/></kml>";
	var dom = jQuery.parseXML(kml);
	var documentEl = dom.documentElement.childNodes[0];
	var owner = new core.geo.KmlDomGeoDataContainer("1", dom);
	var feature = new core.geo.KmlDomGeoDataFeature(owner, "2", documentEl);
	strictEqual(feature.getKmlDomNode(), documentEl, "getKmlDomNode() returns the correct node");
});

test("postSave", function() {
	ok(false, "not implemented");
});

/*

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
*/