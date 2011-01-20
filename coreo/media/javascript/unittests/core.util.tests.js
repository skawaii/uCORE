module("core.util");

test("createXmlDoc", function() {
	var doc = core.util.createXmlDoc("<foo>bar</foo>");
	ok(doc, "returned an object");
	ok(doc.documentElement, "object returned is an XML DOM");
	same(doc.documentElement.childNodes[0].nodeValue, "bar", "XML DOM returned has correct content");
});

test("getXmlString", function() {
	same(core.util.getXmlString(undefined), undefined, "handles undefined as expected");
	same(core.util.getXmlString(null), undefined, "handles null as expected");
	
	var xmlDoc = core.util.createXmlDoc("<foo><bar>baz</bar></foo>");
	var str = core.util.getXmlString(xmlDoc);
	same(typeof str, "string", "returns a string");
	same(str.toLowerCase(), "<foo><bar>baz</bar></foo>", "returns correct string representation");
});