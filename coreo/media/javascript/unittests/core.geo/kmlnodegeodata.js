module("core.geo.KmlNodeGeoData");

test("constructor", function() {
	var geodata = new core.geo.KmlNodeGeoData("id", "node", "nsPrefix");
	strictEqual(geodata.id, "id");
	strictEqual(geodata.node, "node");
	strictEqual(geodata.nsPrefix, "nsPrefix");
	core.testutils.assertImplements(geodata, core.geo.GeoData.prototype);
});

test("fromKmlDoc", function() {
	var kml = "<kml xmlns=\"" + core.util.KmlUtils.KML_NS[0] +"\">" 
		+ "<Document id=\"3\">"
		+ "    <Placemark id=\"7\"></Placemark>"
		+ "    <Placemark id=\"8\"></Placemark>"
		+ "    <Placemark id=\"9\"></Placemark>"
		+ "    <Placemark id=\"10\"></Placemark>"
		+ "    <NetworkLink />"
		+ "</Document>"
		+ "</kml>";
	var kmlDoc = core.util.XmlUtils.createXmlDoc(kml);
	var geodata = core.geo.KmlNodeGeoData.fromKmlDoc(kmlDoc);
	ok(geodata);
	ok(geodata.id);
	ok(geodata.node);
	strictEqual(geodata.node.tagName, "Document");
	ok(geodata.nsPrefix);
	strictEqual(typeof geodata.nsPrefix, "string");
	ok(geodata.nsPrefix.length > 0);
	strictEqual($(kmlDoc.documentElement).attr("xmlns:" + geodata.nsPrefix), core.geo.KmlNodeGeoData.NS_URI);
	strictEqual($(kmlDoc.documentElement).find("Document").attr(geodata.nsPrefix + ":id"), geodata.id);
});

test("fromKmlString", function() {
	var kml = "<kml xmlns=\"" + core.util.KmlUtils.KML_NS[0] +"\">" 
		+ "<Document id=\"3\">"
		+ "    <Placemark id=\"7\"></Placemark>"
		+ "    <Placemark id=\"8\"></Placemark>"
		+ "    <Placemark id=\"9\"></Placemark>"
		+ "    <Placemark id=\"10\"></Placemark>"
		+ "    <NetworkLink />"
		+ "</Document>"
		+ "</kml>";
	var geodata = core.geo.KmlNodeGeoData.fromKmlString(kml);
	ok(geodata);
	ok(geodata.id);
	ok(geodata.node);
	strictEqual(geodata.node.tagName, "Document");
	ok(geodata.nsPrefix);
	strictEqual(typeof geodata.nsPrefix, "string");
	ok(geodata.nsPrefix.length > 0);
	strictEqual($(geodata.node.ownerDocument.documentElement).attr("xmlns:" + geodata.nsPrefix), core.geo.KmlNodeGeoData.NS_URI);
	strictEqual($(geodata.node).attr(geodata.nsPrefix + ":id"), geodata.id);
});

test("NS_URI", function() {
	strictEqual(core.geo.KmlNodeGeoData.NS_URI, "urn:core:geo:KmlNodeGeoData");
});

test("getIdFromElement", function() {
	strictEqual(typeof core.geo.KmlNodeGeoData.getIdFromElement, "function");
	var xml = "<foo1 ns1:id=\"1\" xmlns:ns1=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">"
			+ "<foo2 ns1:id=\"2\" />"
			+ "<foo3>"
			+ "  <foo4 ns1:id=\"3\"/>"
			+ "  <foo5 ns2:id=\"4\" xmlns:ns2=\"urn:foo\"/>"
			+ "</foo3>"
			+ "<foo6 id=\"5\" />"
			+ "</foo1>";
	var dom = core.util.XmlUtils.createXmlDoc(xml);
	strictEqual(core.geo.KmlNodeGeoData.getIdFromElement(dom.documentElement, "ns1"), "1");
	strictEqual(core.geo.KmlNodeGeoData.getIdFromElement($(dom.documentElement).find("foo2")[0], "ns1"), "2");
	strictEqual(core.geo.KmlNodeGeoData.getIdFromElement($(dom.documentElement).find("foo3")[0], "ns1"), null);
	strictEqual(core.geo.KmlNodeGeoData.getIdFromElement($(dom.documentElement).find("foo4")[0], "ns1"), "3");
	strictEqual(core.geo.KmlNodeGeoData.getIdFromElement($(dom.documentElement).find("foo5")[0], "ns1"), null);
	strictEqual(core.geo.KmlNodeGeoData.getIdFromElement($(dom.documentElement).find("foo6")[0], "ns1"), null);

	try {
		core.geo.KmlNodeGeoData.getIdFromElement(null, "ns1");
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.geo.KmlNodeGeoData.getIdFromElement(null, "ns1");
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.geo.KmlNodeGeoData.getIdFromElement(undefined, "ns1");
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.geo.KmlNodeGeoData.getIdFromElement("foo", "ns1");
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.geo.KmlNodeGeoData.getIdFromElement([], "ns1");
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
});

test("setIdOnElement", function() {
	var NS_URI = core.geo.KmlNodeGeoData.NS_URI;
	strictEqual(typeof core.geo.KmlNodeGeoData.setIdOnElement, "function");
	var dom = core.util.XmlUtils.createXmlDoc("<foo xmlns:ns1=\"" + NS_URI + "\"/>");
	strictEqual($(dom.documentElement).attr("xmlns:ns1"), NS_URI);
	core.geo.KmlNodeGeoData.setIdOnElement(dom.documentElement, "1", "ns1");
	strictEqual($(dom.documentElement).attr("ns1:id"), "1");
	strictEqual($(dom.documentElement).attr("xmlns:ns1"), NS_URI);
	core.geo.KmlNodeGeoData.setIdOnElement(dom.documentElement, "1", "ns2");
	strictEqual($(dom.documentElement).attr("ns2:id"), "1");
	core.geo.KmlNodeGeoData.setIdOnElement(dom.documentElement, "2", "ns1");
	strictEqual($(dom.documentElement).attr("ns1:id"), "2");
	core.geo.KmlNodeGeoData.setIdOnElement(dom.documentElement, "2", "ns1");
	strictEqual($(dom.documentElement).attr("ns1:id"), "2");
	
	dom = core.util.XmlUtils.createXmlDoc("<foo>"
			+ "<foo2 id=\"blah\" xmlns:ns1=\"" + NS_URI + "\"><foo3 ns1:id=\"1\" /><foo4 /></foo2></foo>");
	
	var el = dom.documentElement;
	core.geo.KmlNodeGeoData.setIdOnElement(el, "1", "ns1");
	strictEqual($(el).attr("ns1:id"), "1");
	
	el = $(dom.documentElement).find("foo2")[0];
	core.geo.KmlNodeGeoData.setIdOnElement(el, "1", "ns1");
	strictEqual($(el).attr("ns1:id"), "1");
	
	el = $(dom.documentElement).find("foo3")[0];
	core.geo.KmlNodeGeoData.setIdOnElement(el, "2", "ns1");
	strictEqual($(el).attr("ns1:id"), "2");
	
	el = $(dom.documentElement).find("foo4")[0];
	core.geo.KmlNodeGeoData.setIdOnElement(el, "3", "ns1");
	strictEqual($(el).attr("ns1:id"), "3");
	
	raises(function(){core.geo.KmlNodeGeoData.setIdOnElement($(dom.documentElement).find("foo")[0].attributes.item(0), "1", "ns1");});
	raises(function(){core.geo.KmlNodeGeoData.setIdOnElement(null, "1", "ns1");});
	raises(function(){core.geo.KmlNodeGeoData.setIdOnElement(undefined, "1", "ns1");});
	raises(function(){core.geo.KmlNodeGeoData.setIdOnElement([], "1", "ns1");});
	raises(function(){core.geo.KmlNodeGeoData.setIdOnElement({}, "1", "ns1");});
	raises(function(){core.geo.KmlNodeGeoData.setIdOnElement("foo", "1", "ns1");});
});

test("getChildElementById", function() {
	var kml = "<kml xmlns=\"" + core.util.KmlUtils.KML_NS[0] + "\" xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">" 
			+ "<Document id=\"3\" c:id=\"4\">"
			+ "  <Folder c:id=\"5\">"
			+ "    <NetworkLink c:id=\"6\" />"
			+ "    <Placemark c:id=\"7\">"
			+ "      <Document>"
			+ "        <Placemark c:id=\"8\" />"
			+ "      </Document>"
			+ "    </Placemark>"
			+ "  </Folder>"
			+ "  <Placemark/>"
			+ "</Document>"
			+ "<NetworkLink/>" +
			+ "<NotAFeature/>"
			+ "</kml>";
	var dom = core.util.XmlUtils.createXmlDoc(kml);
	var kmlEl = dom.documentElement;
	var child = core.geo.KmlNodeGeoData.getChildElementById(kmlEl, "3", "c");
	strictEqual(child, null);
	child = core.geo.KmlNodeGeoData.getChildElementById(kmlEl, "4", "c");
	ok(child);
	strictEqual(child.tagName, "Document");
	child = core.geo.KmlNodeGeoData.getChildElementById(kmlEl, "5", "c");
	ok(child);
	strictEqual(child.tagName, "Folder");
	child = core.geo.KmlNodeGeoData.getChildElementById(kmlEl, "8", "c");
	ok(child);
	strictEqual(child.tagName, "Placemark");
	
	kml = "<k:kml xmlns:k=\"" + core.util.KmlUtils.KML_NS[0] 
		+ "\" xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">" 
		+ "<k:Document id=\"3\" c:id=\"4\">"
		+ "  <k:Folder c:id=\"5\">"
		+ "    <k:NetworkLink c:id=\"6\" />"
		+ "    <k:Placemark c:id=\"7\">"
		+ "      <k:Document>"
		+ "        <k:Placemark c:id=\"8\" />"
		+ "      </k:Document>"
		+ "    </k:Placemark>"
		+ "  </k:Folder>"
		+ "  <k:Placemark/>"
		+ "</k:Document>"
		+ "<k:NetworkLink/>" +
		+ "<k:NotAFeature/>"
		+ "</k:kml>";
	dom = core.util.XmlUtils.createXmlDoc(kml);
	kmlEl = dom.documentElement;
	child = core.geo.KmlNodeGeoData.getChildElementById(kmlEl, "3", "c");
	strictEqual(child, null);
	child = core.geo.KmlNodeGeoData.getChildElementById(kmlEl, "4", "c");
	ok(child);
	strictEqual(child.tagName, "k:Document");
	child = core.geo.KmlNodeGeoData.getChildElementById(kmlEl, "5", "c");
	ok(child);
	strictEqual(child.tagName, "k:Folder");
	child = core.geo.KmlNodeGeoData.getChildElementById(kmlEl, "8", "c");
	ok(child);
	strictEqual(child.tagName, "k:Placemark");
});

test("getParent", function() {
	var dom = core.util.XmlUtils.createXmlDoc("<kml "
			+ "xmlns=\"" + core.util.KmlUtils.KML_NS[0] + "\" xmlns:ns1=\"" 
			+ core.geo.KmlNodeGeoData.NS_URI + "\" ns1:id=\"1\">"
			+ "<Document />"
			+ "<Document ns1:id=\"3\"><Placemark/></Document>"
			+ "</kml>");
	var geodata = new core.geo.KmlNodeGeoData(null, $(dom.documentElement).find("Document")[0], "ns1");
	var parent = geodata.getParent();
	strictEqual(parent, null, "'kml' element is not considered a feature");
	
	geodata = new core.geo.KmlNodeGeoData(null, $(dom.documentElement).find("Placemark")[0], "ns1");
	parent = geodata.getParent();
	ok(parent);
	strictEqual(parent.id, "3");
	ok(parent.node);
	strictEqual(parent.node.tagName, "Document");
	strictEqual(parent.nsPrefix, "ns1");

	var geodata = new core.geo.KmlNodeGeoData(null, dom.documentElement, "ns1");
	var parent = geodata.getParent();
	strictEqual(parent, null);

	dom = core.util.XmlUtils.createXmlDoc("<k:kml xmlns:k=\"" 
			+ core.util.KmlUtils.KML_NS[0] + "\" xmlns:ns1=\"" 
			+ core.geo.KmlNodeGeoData.NS_URI + "\">"
			+ "<k:Document />"
			+ "<k:Document ns1:id=\"3\"><k:Placemark /></k:Document>"
			+ "</k:kml>");
	
	var el = $(dom.documentElement).find("Placemark")[0];
	ok(el);
	geodata = new core.geo.KmlNodeGeoData(null, el, "ns1");
	parent = geodata.getParent();
	ok(parent);
	strictEqual(parent.id, "3");
	ok(parent.node);
	strictEqual(parent.node.tagName, "k:Document");
	strictEqual(parent.nsPrefix, "ns1");

	el = dom.documentElement;
	ok(el);
	var geodata = new core.geo.KmlNodeGeoData(null, el, "ns1");
	var parent = geodata.getParent();
	strictEqual(parent, null);
	
	el = $(dom.documentElement).find("Document")[0];
	ok(el);
	strictEqual(core.util.KmlUtils.findNextKmlElementParent(el), null);
	geodata = new core.geo.KmlNodeGeoData(null, el, "ns1");
	parent = geodata.getParent();
	strictEqual(parent, null);
});

test("iterateChildren", function() {
	var kml = "<kml xmlns=\"" + core.util.KmlUtils.KML_NS[0] + "\" xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">" 
		+ "<Document id=\"3\" c:id=\"4\">"
		+ "  <Folder c:id=\"5\">"
		+ "    <NetworkLink c:id=\"6\" />"
		+ "    <Placemark c:id=\"7\">"
		+ "      <Document>"
		+ "        <Placemark c:id=\"8\" />"
		+ "      </Document>"
		+ "    </Placemark>"
		+ "  </Folder>"
		+ "  <Placemark/>"
		+ "</Document>"
		+ "<NetworkLink/>" +
		+ "<NotAFeature/>"
		+ "</kml>";
	var dom = core.util.XmlUtils.createXmlDoc(kml);
	ok(dom.documentElement);
	var geodata = new core.geo.KmlNodeGeoData(null, dom.documentElement, "c");
	var children = [];
	geodata.iterateChildren(function(child) {
		children.push(child);
	});
	strictEqual(children.length, 2);
	ok(children[0]);
	strictEqual(children[0].id, "4");
	strictEqual(children[0].node.tagName, "Document");
	strictEqual(children[0].nsPrefix, "c");
	ok(children[1]);
	notEqual(children[1].id, null);
	strictEqual(children[1].node.tagName, "NetworkLink");
	ok($(children[1].node).attr("c:id"), "ID was assigned to child");
	strictEqual(children[1].nsPrefix, "c");

	kml = "<k:kml xmlns:k=\"" + core.util.KmlUtils.KML_NS[0] + "\" "
		+ "xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">"
		+ "<k:Document id=\"3\" c:id=\"4\">"
		+ "  <k:Folder c:id=\"5\">"
		+ "    <k:NetworkLink c:id=\"6\" />"
		+ "    <k:Placemark c:id=\"7\">"
		+ "      <k:Document>"
		+ "        <k:Placemark c:id=\"8\" />"
		+ "      </k:Document>"
		+ "    </k:Placemark>"
		+ "  </k:Folder>"
		+ "  <k:Placemark/>"
		+ "</k:Document>"
		+ "<k:NetworkLink/>" +
		+ "<k:NotAFeature/>"
		+ "</k:kml>";
	dom = core.util.XmlUtils.createXmlDoc(kml);
	ok(dom.documentElement, "documentElement exists");
	geodata = new core.geo.KmlNodeGeoData(null, dom.documentElement, "c");
	children = [];
	geodata.iterateChildren(function(child) {
		children.push(child);
	});
	strictEqual(children.length, 2);
	ok(children[0]);
	strictEqual(children[0].id, "4");
	strictEqual(children[0].node.tagName, "k:Document");
	strictEqual(children[0].nsPrefix, "c");
	ok(children[1]);
	notEqual(children[1].id, null);
	strictEqual(children[1].node.tagName, "k:NetworkLink");
	ok($(children[1].node).attr("c:id"), "ID was assigned to child");
	strictEqual(children[1].nsPrefix, "c");
});

test("getChildById", function() {
	var kml = "<kml xmlns=\"" + core.util.KmlUtils.KML_NS[0] + "\" xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">" 
		+ "<Document id=\"3\" c:id=\"4\">"
		+ "  <Folder c:id=\"5\">"
		+ "    <NetworkLink c:id=\"6\" />"
		+ "    <Placemark c:id=\"7\">"
		+ "      <Document>"
		+ "        <Placemark c:id=\"8\" />"
		+ "      </Document>"
		+ "    </Placemark>"
		+ "  </Folder>"
		+ "  <Placemark/>"
		+ "</Document>"
		+ "<NetworkLink/>" +
		+ "<NotAFeature/>"
		+ "</kml>";
	var dom = core.util.XmlUtils.createXmlDoc(kml);
	ok(dom.documentElement);
	var geodata = new core.geo.KmlNodeGeoData(null, dom.documentElement, "c");
	
	var child = geodata.getChildById("4");
	ok(child);
	strictEqual(child.id, "4");
	strictEqual(child.node.tagName, "Document");
	
	child = geodata.getChildById("6");
	ok(child);
	strictEqual(child.id, "6");
	strictEqual(child.node.tagName, "NetworkLink");
	
	child = geodata.getChildById("8");
	ok(child);
	strictEqual(child.id, "8");
	strictEqual(child.node.tagName, "Placemark");

	child = geodata.getChildById("3");
	strictEqual(child, null);

	kml = "<k:kml xmlns:k=\"" + core.util.KmlUtils.KML_NS[0] + "\" "
		+ "xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">"
		+ "<k:Document id=\"3\" c:id=\"4\">"
		+ "  <k:Folder c:id=\"5\">"
		+ "    <k:NetworkLink c:id=\"6\" />"
		+ "    <k:Placemark c:id=\"7\">"
		+ "      <k:Document>"
		+ "        <k:Placemark c:id=\"8\" />"
		+ "      </k:Document>"
		+ "    </k:Placemark>"
		+ "  </k:Folder>"
		+ "  <k:Placemark/>"
		+ "</k:Document>"
		+ "<k:NetworkLink/>" +
		+ "<k:NotAFeature/>"
		+ "</k:kml>";
	dom = core.util.XmlUtils.createXmlDoc(kml);
	ok(dom.documentElement);
	geodata = new core.geo.KmlNodeGeoData(null, dom.documentElement, "c");
	
	child = geodata.getChildById("4");
	ok(child);
	strictEqual(child.id, "4");
	strictEqual(child.node.tagName, "k:Document");
	
	child = geodata.getChildById("6");
	ok(child);
	strictEqual(child.id, "6");
	strictEqual(child.node.tagName, "k:NetworkLink");
	
	child = geodata.getChildById("8");
	ok(child);
	strictEqual(child.id, "8");
	strictEqual(child.node.tagName, "k:Placemark");

	child = geodata.getChildById("3");
	strictEqual(child, null);
});

test("getKmlString", function() {
	var kml = "<k:kml xmlns:k=\"" + core.util.KmlUtils.KML_NS[0] + "\" "
		+ "xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">"
		+ "<k:Document id=\"3\" c:id=\"4\">"
		+ "  <k:Folder c:id=\"5\">"
		+ "    <k:NetworkLink c:id=\"6\" />"
		+ "    <k:Placemark c:id=\"7\">"
		+ "      <k:Document>"
		+ "        <k:Placemark c:id=\"8\" />"
		+ "      </k:Document>"
		+ "    </k:Placemark>"
		+ "  </k:Folder>"
		+ "  <k:Placemark/>"
		+ "</k:Document>"
		+ "<k:NetworkLink/>" +
		+ "<k:NotAFeature/>"
		+ "</k:kml>";
	var dom = core.util.XmlUtils.createXmlDoc(kml);
	ok(dom.documentElement);
	var geodata = new core.geo.KmlNodeGeoData(null, $(dom.documentElement).find("Document:first-child")[0], "c");
	var str = geodata.getKmlString();
	ok(str);
	strictEqual(str.substr(0, 11), "<k:Document");

	var el = $(dom.documentElement).find("Placemark[c\\:id='7']")[0];
	ok(el);
	geodata = new core.geo.KmlNodeGeoData(null, el, "c");
	str = geodata.getKmlString();
	ok(str);
	strictEqual(str.substr(0, 12), "<k:Placemark");
});

test("postSave", function() {
	var kml = "<k:kml xmlns:k=\"" + core.util.KmlUtils.KML_NS[0] + "\" "
		+ "xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">"
		+ "<k:Document id=\"3\" c:id=\"4\">"
		+ "  <k:Folder c:id=\"5\">"
		+ "    <k:NetworkLink c:id=\"6\" />"
		+ "    <k:Placemark c:id=\"7\">"
		+ "      <k:Document>"
		+ "        <k:Placemark c:id=\"8\" />"
		+ "      </k:Document>"
		+ "    </k:Placemark>"
		+ "  </k:Folder>"
		+ "  <k:Placemark/>"
		+ "</k:Document>"
		+ "<k:NetworkLink/>" +
		+ "<k:NotAFeature/>"
		+ "</k:kml>";
	var dom = core.util.XmlUtils.createXmlDoc(kml);
	ok(dom.documentElement);
	var geodata = new core.geo.KmlNodeGeoData(null, dom.documentElement, "c");
	
	geodata.postSave();
	strictEqual($(geodata.node).attr("c:id"), undefined);
	
	geodata.id = "1";
	geodata.postSave();
	strictEqual($(geodata.node).attr("c:id"), "1");
	
	geodata.id = "2";
	geodata.postSave();
	strictEqual($(geodata.node).attr("c:id"), "2");
	
	geodata.id = null;
	geodata.postSave();
	strictEqual($(geodata.node).attr("c:id"), undefined);
});

test("getName", function() {
	var kml = "<k:kml xmlns:k=\"" + core.util.KmlUtils.KML_NS[0] + "\" "
		+ "xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">"
		+ "<k:Document id=\"3\" c:id=\"4\">"
		+ "  <k:name>document name</k:name>"
		+ "  <k:Folder c:id=\"5\">"
		+ "    <k:NetworkLink c:id=\"6\" />"
		+ "    <k:Placemark c:id=\"7\">"
		+ "      <k:Document>"
		+ "        <k:Placemark c:id=\"8\" />"
		+ "      </k:Document>"
		+ "    </k:Placemark>"
		+ "  </k:Folder>"
		+ "  <k:Placemark/>"
		+ "</k:Document>"
		+ "<k:NetworkLink/>" +
		+ "<k:NotAFeature/>"
		+ "</k:kml>";
	var dom = core.util.XmlUtils.createXmlDoc(kml);
	ok(dom.documentElement);
	var geodata = new core.geo.KmlNodeGeoData(null, dom.documentElement, "c");
	strictEqual(geodata.getName(), null);
	
	strictEqual($(dom.documentElement).children()[0].tagName, "k:Document");
	geodata = new core.geo.KmlNodeGeoData(null, $(dom.documentElement).children()[0], "c");
	strictEqual(geodata.getName(), "document name");
});

test("hasChildren", function() {
	var kml = "<k:kml xmlns:k=\"" + core.util.KmlUtils.KML_NS[0] + "\" "
		+ "xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">"
		+ "<k:Document id=\"3\" c:id=\"4\">"
		+ "  <k:name>document name</k:name>"
		+ "  <k:Folder c:id=\"5\">"
		+ "    <k:NetworkLink c:id=\"6\" />"
		+ "    <k:Placemark c:id=\"7\">"
		+ "      <k:Document>"
		+ "        <k:Placemark c:id=\"8\" />"
		+ "      </k:Document>"
		+ "    </k:Placemark>"
		+ "  </k:Folder>"
		+ "  <k:Placemark/>"
		+ "</k:Document>"
		+ "<k:NetworkLink/>" +
		+ "<k:NotAFeature/>"
		+ "</k:kml>";
	var geodata = core.geo.KmlNodeGeoData.fromKmlString(kml);
	strictEqual(geodata.hasChildren(), true);

	var dom = core.util.XmlUtils.createXmlDoc(kml);
	geodata = new core.geo.KmlNodeGeoData(null, $(dom.documentElement).find("NetworkLink")[0], "c");
	strictEqual(geodata.hasChildren(), true);
});

test("getKmlFeatureType", function() {
	var kml = "<k:kml xmlns:k=\"" + core.util.KmlUtils.KML_NS[0] + "\" "
		+ "xmlns:c=\"" + core.geo.KmlNodeGeoData.NS_URI + "\">"
		+ "<k:Document id=\"3\" c:id=\"4\">"
		+ "  <k:name>document name</k:name>"
		+ "  <k:Folder c:id=\"5\">"
		+ "    <k:NetworkLink c:id=\"6\" />"
		+ "    <k:Placemark c:id=\"7\">"
		+ "      <k:Document>"
		+ "        <k:Placemark c:id=\"8\" />"
		+ "      </k:Document>"
		+ "    </k:Placemark>"
		+ "  </k:Folder>"
		+ "  <k:Placemark/>"
		+ "</k:Document>"
		+ "<k:NetworkLink/>" +
		+ "<k:NotAFeature/>"
		+ "</k:kml>";
	var geodata = core.geo.KmlNodeGeoData.fromKmlString(kml);
	strictEqual(geodata.getKmlFeatureType(), "Document");

	var dom = core.util.XmlUtils.createXmlDoc(kml);
	geodata = new core.geo.KmlNodeGeoData(null, $(dom.documentElement).find("NetworkLink")[0], "c");
	strictEqual(geodata.getKmlFeatureType(), "NetworkLink");
});

test("findByKmlFeatureType", function() {
	var kml = "<kml xmlns=\"" + core.util.KmlUtils.KML_NS[0] + "\">"
	        + "  <Document>"
	        + "    <NetworkLink><name>network link 1</name></NetworkLink>"
	        + "    <Folder>"
	        + "      <name>folder 1</name>"
	        + "      <NetworkLink><name>network link 2</name></NetworkLink>"
	        + "      <Placemark><name>placemark 1</name></Placemark>"
	        + "    </Folder>"
	        + "    <NetworkLink><name>network link 3</name></NetworkLink>"
	        + "  </Document>"
	        + "</kml>";
	var geodata = core.geo.KmlNodeGeoData.fromKmlString(kml);
	
	var results = [];
	geodata.findByKmlFeatureType(core.geo.KmlFeatureType.DOCUMENT, function(match) {
		results.push(match);
	});
	strictEqual(results.length, 0);
	
	results = [];
	geodata.findByKmlFeatureType(core.geo.KmlFeatureType.NETWORK_LINK, function(match) {
		results.push(match);
	});
	strictEqual(results.length, 3);
	strictEqual(results[0].getName(), "network link 1");
	ok(results[0].id);
	strictEqual(results[1].getName(), "network link 2");
	ok(results[1].id);
	strictEqual(results[2].getName(), "network link 3");
	ok(results[2].id);
	
	results = [];
	geodata.findByKmlFeatureType(core.geo.KmlFeatureType.PLACEMARK, function(match) {
		results.push(match);
	});
	strictEqual(results.length, 1);
	ok(results[0].id);
	strictEqual(results[0].getName(), "placemark 1");
});