module("core.util.KmlUtils");

test("KML_FEATURE_ELEMENTS", function() {
	ok("KML_FEATURE_ELEMENTS" in core.util.KmlUtils, "KmlUtils contains KML_FEATURE_ELEMENTS property");
	same(typeof core.util.KmlUtils, "object", "type of KML_FEATURE_ELEMENTS property is object");
	ok("length" in core.util.KmlUtils.KML_FEATURE_ELEMENTS, "KML_FEATURE_ELEMENTS is an array");
	same(core.util.KmlUtils.KML_FEATURE_ELEMENTS.length, 8, "KML_FEATURE_ELEMENTS contains correct number of elements");
});

test("isKmlElement", function() {
	var kmlDoc = jQuery.parseXML("<kml><Document/></kml>");
	same(typeof core.util.KmlUtils.isKmlElement, "function", "isKmlElement is a function");
	same(core.util.KmlUtils.isKmlElement(kmlDoc.documentElement), true, "kml is a KML element");
	same(core.util.KmlUtils.isKmlElement(kmlDoc.documentElement.childNodes[0]), true, "Document is a KML element");
});

test("findNextKmlElementParent", function() {
	var kmlDoc = jQuery.parseXML("<kml><Document/></kml>");
	same(typeof core.util.KmlUtils.findNextKmlElementParent, "function", "findNextKmlElementParent is a function");
	var parent = core.util.KmlUtils.findNextKmlElementParent(kmlDoc.documentElement.childNodes[0]);
	same(parent.tagName, "kml", "parent of Document is kml");
});