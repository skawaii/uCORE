module("core.util");

test("createXmlDoc", function() {
	var doc = core.util.createXmlDoc("<foo>bar</foo>");
	ok(doc, "returned an object");
	ok(doc.documentElement, "object returned is an XML DOM");
	same(doc.documentElement.childNodes[0].nodeValue, "bar", "XML DOM returned has correct content");
});