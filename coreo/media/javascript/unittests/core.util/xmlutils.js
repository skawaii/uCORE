module("core.util.XmlUtils");

test("getQualifiedName", function() {
	var doc = jQuery.parseXML("<foo id=\"1\" xmlns:ns1=\"urn:ns1\">"
			+ "  <ns1:bar id=\"2\">"
			+ "    <foo2 id=\"3\"/>" 
			+ "    <ns1:foo3 id=\"4\"/>" 
			+ "  </ns1:bar>"
			+ "  <baz id=\"5\" xmlns=\"urn:ns2\">"
			+ "    <foo4 id=\"6\"/>"
			+ "    <foo5  id=\"7\" xmlns=\"urn:ns3\"/>"
			+ "  </baz>"
			+ "</foo>");
	var qname = core.util.getQualifiedName(doc.documentElement);
	strictEqual(qname.localName, "foo");
	strictEqual(qname.nsPrefix, null);
	strictEqual(qname.nsUri, "");
	
	qname = core.util.getQualifiedName($(doc.documentElement, doc).find("[id=\"2\"]")[0]);
	strictEqual(qname.localName, "bar");
	strictEqual(qname.nsPrefix, "ns1");
	strictEqual(qname.nsUri, "urn:ns1");
	
	qname = core.util.getQualifiedName($(doc.documentElement, doc).find("[id=\"6\"]")[0]);
	strictEqual(qname.localName, "foo4");
	strictEqual(qname.nsPrefix, null);
	strictEqual(qname.nsUri, "urn:ns2");
});

test("getNamespaceURI", function() {
	var doc = jQuery.parseXML("<foo id=\"1\" xmlns:ns1=\"urn:ns1\">"
							+ "  <ns1:bar id=\"2\">"
							+ "    <foo2 id=\"3\"/>" 
							+ "    <ns1:foo3 id=\"4\"/>" 
							+ "  </ns1:bar>"
							+ "  <baz id=\"5\" xmlns=\"urn:ns2\">"
							+ "    <foo4 id=\"6\"/>"
							+ "    <foo5  id=\"7\" xmlns=\"urn:ns3\"/>"
							+ "  </baz>"
							+ "</foo>");
	strictEqual(core.util.getNamespaceURI(doc), undefined, "passing a Document to getNamespaceURI() returns undefined");
	strictEqual(core.util.getNamespaceURI(undefined), undefined, "passing undefined to getNamespaceURI() returns undefined");
	strictEqual(core.util.getNamespaceURI(null), undefined, "passing null to getNamespaceURI() returns undefined");
	strictEqual(core.util.getNamespaceURI(doc.documentElement), "");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"2\"]")[0]), "urn:ns1");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"2\"]")[0], "foo"), "urn:ns1");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"3\"]")[0]), "");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"3\"]")[0], "foo"), "foo");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"4\"]")[0]), "urn:ns1");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"4\"]")[0], "foo"), "urn:ns1");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"5\"]")[0]), "urn:ns2");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"5\"]")[0], "foo"), "urn:ns2");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"6\"]")[0]), "urn:ns2");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"6\"]")[0], "foo"), "foo");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"7\"]")[0]), "urn:ns3");
	strictEqual(core.util.getNamespaceURI($(doc.documentElement, doc).find("[id=\"7\"]")[0], "foo"), "urn:ns3");
	
	doc = jQuery.parseXML("<ns1:foo id=\"1\" xmlns:ns1=\"urn:ns1\"><ns1:bar/></ns1:foo>";
	strictEqual(core.util.getNamespaceUri(doc.documentElement), "urn:ns1");
	strictEqual(core.util.getNamespaceUri(doc.documentElement.childNodes[0]), "urn:ns1");
});

test("createXmlDoc", function() {
	var doc = core.util.createXmlDoc("<foo>bar</foo>");
	ok(doc, "returned an object");
	ok(doc.documentElement, "object returned is an XML DOM");
	same(doc.documentElement.childNodes[0].nodeValue, "bar", "XML DOM returned has correct content");
	try {
		var bad = core.util.createXmlDoc("foo");
		ok(false, "ill-formed XML should raise an exception: XML = " + core.util.getXmlString(bad));
	}
	catch (e) {
		strictEqual("" + e, "string does not contain well-formed XML", 
				"createXmlDoc() raises an exception if XML is ill-formed");
	}
});

test("getXmlString", function() {
	same(core.util.getXmlString(undefined), undefined, "handles undefined as expected");
	same(core.util.getXmlString(null), undefined, "handles null as expected");
	
	var xmlDoc = core.util.createXmlDoc("<foo><bar>baz</bar></foo>");
	var str = core.util.getXmlString(xmlDoc);
	same(typeof str, "string", "returns a string");
	same(str.toLowerCase(), "<foo><bar>baz</bar></foo>", "returns correct string representation");
	
	var node = xmlDoc.documentElement.childNodes.item(0);
	str = core.util.getXmlString(node);
	same(typeof str, "string", "returns a string");
	same(str.toLowerCase(), "<bar>baz</bar>", "converts XML node to a string");
});

test("walkChildElementsByName", function() {
	var doc = core.util.createXmlDoc("<foo><bar>1</bar><baz/><foo2/></foo>");
	
	var count = 0;
	var names = "bar baz".split(" ");
	core.util.walkChildElementsByName(doc.documentElement, names, function(node) {
		count++;
		same(node.tagName, names[count - 1], "invoked with correct node");
	});
	same(count, 2, "callback was invoked for 2 child nodes");
	
	core.util.walkChildElementsByName(doc.documentElement, "foo 123".split(" "), function(node) {
		ok(false, "callback not invoked when child nodes don't match");
	});
	
	count = 0;
	core.util.walkChildElementsByName(doc.documentElement, "bar", function(node) {
		count++;
		same(node.tagName, "bar", "callback invoked with correct node");
	});	
	same(count, 1, "callback was invoked for one child node");
});

test("walkChildElements", function() {
	var doc = core.util.createXmlDoc("<foo><bar>1</bar><baz/></foo>");
	
	core.util.walkChildElements(doc.documentElement, undefined);
	
	core.util.walkChildElements(doc.documentElement, null);

	var childNodeInvokes = 0;
	var expectedChildNodeNames = ["bar", "baz"];
	core.util.walkChildElements(doc.documentElement,
			function(node) {
				same(typeof node, "object", "node argument is an object");
				ok(childNodeInvokes++ <= expectedChildNodeNames.length, "haven't received too many notifications of child nodes");
				same(node.nodeName, expectedChildNodeNames[childNodeInvokes - 1], "");
			}
	);
	same(childNodeInvokes, expectedChildNodeNames.length);
	
	try {
		core.util.walkChildElements(doc.documentElement, {});
		ok(false, "expected exception - callback was an invalid object type");
	}
	catch (e) {
		same("" + e, "Invalid callback - expected to be a function or an " +
				"object with a \"callback\" property that is a function", 
				"correct exception was thrown");
	}

	try {
		core.util.walkChildElements(doc.documentElement, []);
		ok(false, "expected exception - callback was an invalid object type");
	}
	catch (e) {
		same("" + e, "Invalid callback - expected to be a function or an " +
				"object with a \"callback\" property that is a function", 
				"correct exception was thrown");
	}
	
	doc = core.util.createXmlDoc("<foo>bar</foo>");
	core.util.walkChildElements(doc.documentElement,
			function() {
				ok(false, "parent node has no children");
			}
	);

	core.util.walkChildElements(undefined,
		{
			callback: function(node) {
				ok(false, "no child nodes should exist in an undefined parent node");
			}
		});
	
	core.util.walkChildElements(null,
			{
				callback: function(node) {
					ok(false, "no child nodes should exist in an undefined parent node");
				}
			});
	
	core.util.walkChildElements([],
			{
				callback: function(node) {
					ok(false, "no child nodes should exist in an undefined parent node");
				}
			});
	
	core.util.walkChildElements({},
			{
				callback: function(node) {
					ok(false, "no child nodes should exist in an undefined parent node");
				}
			});
});