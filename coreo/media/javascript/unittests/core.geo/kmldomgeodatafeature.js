module("core.geo.KmlDomGeoDataFeature");

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