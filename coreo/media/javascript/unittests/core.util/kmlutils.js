module("core.util.KmlUtils");

test("iterateChildKmlElements", function() {
	var dom = core.util.XmlUtils.createXmlDoc("<kml xmlns=\"http://www.opengis.net/kml/2.2\">"
			+ "<Document/><NetworkLink/><NotAFeature/></kml>");
	var children = [];
	core.util.KmlUtils.iterateChildKmlElements(dom.documentElement, function(child) {
		children.push(child);
	});
	strictEqual(children.length, 2);
	strictEqual(children[0].tagName, "Document");
	strictEqual(children[1].tagName, "NetworkLink");
});

test("KML_FEATURE_ELEMENTS", function() {
	ok("KML_FEATURE_ELEMENTS" in core.util.KmlUtils, "KmlUtils contains KML_FEATURE_ELEMENTS property");
	strictEqual(typeof core.util.KmlUtils, "object", "type of KML_FEATURE_ELEMENTS property is object");
	ok("length" in core.util.KmlUtils.KML_FEATURE_ELEMENTS, "KML_FEATURE_ELEMENTS is an array");
	strictEqual(core.util.KmlUtils.KML_FEATURE_ELEMENTS.length, 7, "KML_FEATURE_ELEMENTS contains correct number of elements");
	ok(jQuery.inArray("NetworkLink", core.util.KmlUtils.KML_FEATURE_ELEMENTS) >= 0);
	ok(jQuery.inArray("Placemark", core.util.KmlUtils.KML_FEATURE_ELEMENTS) >= 0);
	ok(jQuery.inArray("Document", core.util.KmlUtils.KML_FEATURE_ELEMENTS) >= 0);
	ok(jQuery.inArray("Folder", core.util.KmlUtils.KML_FEATURE_ELEMENTS) >= 0);
	ok(jQuery.inArray("PhotoOverlay", core.util.KmlUtils.KML_FEATURE_ELEMENTS) >= 0);
	ok(jQuery.inArray("ScreenOverlay", core.util.KmlUtils.KML_FEATURE_ELEMENTS) >= 0);
	ok(jQuery.inArray("GroundOverlay", core.util.KmlUtils.KML_FEATURE_ELEMENTS) >= 0);
});

test("isKmlElement", function() {
	var kmlDoc = jQuery.parseXML("<kml xmlns=\"http://www.opengis.net/kml/2.2\"><Document/></kml>");
	strictEqual(typeof core.util.KmlUtils.isKmlElement, "function", "isKmlElement is a function");
	strictEqual(core.util.KmlUtils.isKmlElement(kmlDoc.documentElement), false, "kml is not a KML element");
	strictEqual(core.util.KmlUtils.isKmlElement($(kmlDoc.documentElement).find("Document")[0]), true, "Document is a KML element");
});

test("findNextKmlElementParent", function() {
	var kmlDoc = jQuery.parseXML("<kml xmlns=\"http://www.opengis.net/kml/2.2\"><Document><Placemark/></Document></kml>");
	strictEqual(typeof core.util.KmlUtils.findNextKmlElementParent, "function", "findNextKmlElementParent is a function");
	var parent = core.util.KmlUtils.findNextKmlElementParent($(kmlDoc.documentElement).find("Document")[0]);
	strictEqual(parent, null);
	parent = core.util.KmlUtils.findNextKmlElementParent($(kmlDoc.documentElement).find("Placemark")[0]);
	ok(parent);
	strictEqual(parent.tagName, "Document");
});