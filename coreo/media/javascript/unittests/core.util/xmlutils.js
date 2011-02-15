module("core.util.XmlUtils");

test("createXmlDoc", function() {
	ok(core.util.XmlUtils.createXmlDoc("<foo/>"));
	
	try {
		core.util.XmlUtils.createXmlDoc("foo");
		ok(false, "expected exception when XML is invalid");
	}
	catch (e) {
		strictEqual("" + e, "Invalid XML");
	}
	
	var xml = "<html xmlns=\"http://www.w3.org/1999/xhtml\"><body><parsererror style=\"display: " +
			"block; white-space: pre; border: 2px solid #c77; padding: 0 1em 0 1em; margin: 1em; " +
			"background-color: #fdd; color: black\"><h3>This page contains the following errors:" +
			"</h3><div style=\"font-family:monospace;font-size:12px\">error on line 1 at column 1: " +
			"Document is empty</div><h3>Below is a rendering of the page up to the first error.</h3>" +
			"</parsererror></body></html>";
	var doc = core.util.XmlUtils.createXmlDoc(xml);
	ok(doc);
	ok(doc.documentElement);
	strictEqual(doc.documentElement.tagName, "html");
});

test("getNamespacePrefixForURI", function() {
	var doc = core.util.XmlUtils.createXmlDoc(
			  "<foo1>"
			+ "  <foo2 xmlns:ns1=\"urn:core1\" xmlns:ns2=\"urn:core2\">"
			+ "    <foo3 xmlns:ns3=\"urn:core3\" />"
			+ "  </foo2>"
			+ "  <foo4 />"
			+ "  <foo5 xmlns=\"urn:core4\" />"
			+ "</foo1>");
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, "urn:core1"), null);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, "urn:core2"), null);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, "urn:core3"), null);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, "urn:core4"), null);
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo2")[0], "urn:core1"), "ns1");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo2")[0], "urn:core2"), "ns2");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo2")[0], "urn:core3"), null);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo2")[0], "urn:core4"), null);
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo3")[0], "urn:core1"), "ns1");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo3")[0], "urn:core2"), "ns2");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo3")[0], "urn:core3"), "ns3");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo3")[0], "urn:core4"), null);
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo4")[0], "urn:core1"), null);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo4")[0], "urn:core2"), null);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo4")[0], "urn:core3"), null);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo4")[0], "urn:core4"), null);
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo5")[0], "urn:core1"), null);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo5")[0], "urn:core2"), null);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo5")[0], "urn:core3"), null);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo5")[0], "urn:core4"), "");
	
	strictEqual(null, core.util.XmlUtils.getNamespacePrefixForURI(null, "urn:core4"));
	strictEqual(null, core.util.XmlUtils.getNamespacePrefixForURI(undefined, "urn:core4"));
	strictEqual(null, core.util.XmlUtils.getNamespacePrefixForURI([], "urn:core4"));
	strictEqual(null, core.util.XmlUtils.getNamespacePrefixForURI({foo: 1}, "urn:core4"));
	strictEqual(null, core.util.XmlUtils.getNamespacePrefixForURI("foo", "urn:core4"));
	strictEqual(null, core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, ""));
	strictEqual(null, core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, null));
	strictEqual(null, core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, undefined));
	strictEqual(null, core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, []));
});

test("ELEMENT_NODE_TYPE", function() {
	strictEqual(core.util.XmlUtils.ELEMENT_NODE_TYPE, 1, "ELEMENT_NODE_TYPE property is defined");
});

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
	var qname = core.util.XmlUtils.getQualifiedName(doc.documentElement);
	ok(qname, "getQualifiedName returned an object");
	strictEqual(qname.localName, "foo");
	strictEqual(qname.nsPrefix, null);
	strictEqual(qname.nsUri, "");
	
	qname = core.util.XmlUtils.getQualifiedName($(doc.documentElement, doc).find("[id=\"2\"]")[0]);
	strictEqual(qname.localName, "bar");
	strictEqual(qname.nsPrefix, "ns1");
	strictEqual(qname.nsUri, "urn:ns1");
	
	qname = core.util.XmlUtils.getQualifiedName($(doc.documentElement, doc).find("[id=\"6\"]")[0]);
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
	strictEqual(core.util.XmlUtils.getNamespaceURI(doc), undefined, "passing a Document to getNamespaceURI() returns undefined");
	strictEqual(core.util.XmlUtils.getNamespaceURI(undefined), undefined, "passing undefined to getNamespaceURI() returns undefined");
	strictEqual(core.util.XmlUtils.getNamespaceURI(null), undefined, "passing null to getNamespaceURI() returns undefined");
	strictEqual(core.util.XmlUtils.getNamespaceURI(doc.documentElement), "");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"2\"]")[0]), "urn:ns1");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"2\"]")[0], "foo"), "urn:ns1");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"3\"]")[0]), "");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"3\"]")[0], "foo"), "foo");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"4\"]")[0]), "urn:ns1");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"4\"]")[0], "foo"), "urn:ns1");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"5\"]")[0]), "urn:ns2");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"5\"]")[0], "foo"), "urn:ns2");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"6\"]")[0]), "urn:ns2");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"6\"]")[0], "foo"), "foo");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"7\"]")[0]), "urn:ns3");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement, doc).find("[id=\"7\"]")[0], "foo"), "urn:ns3");

	doc = jQuery.parseXML("<ns1:foo id=\"1\" xmlns:ns1=\"urn:ns1\"><ns1:bar/></ns1:foo>");
	strictEqual(core.util.XmlUtils.getNamespaceURI(doc.documentElement), "urn:ns1", "found correct namespace for root element");
	strictEqual(core.util.XmlUtils.getNamespaceURI(doc.documentElement.childNodes[0]), "urn:ns1", "found namespace for child element");
});

test("getXmlString", function() {
	same(core.util.XmlUtils.getXmlString(undefined), undefined, "handles undefined as expected");
	same(core.util.XmlUtils.getXmlString(null), undefined, "handles null as expected");
	
	var xmlDoc = jQuery.parseXML("<foo><bar>baz</bar></foo>");
	var str = core.util.XmlUtils.getXmlString(xmlDoc);
	same(typeof str, "string", "returns a string");
	same(str.toLowerCase(), "<foo><bar>baz</bar></foo>", "returns correct string representation");
	
	var node = xmlDoc.documentElement.childNodes.item(0);
	str = core.util.XmlUtils.getXmlString(node);
	same(typeof str, "string", "returns a string");
	same(str.toLowerCase(), "<bar>baz</bar>", "converts XML node to a string");
});

test("walkChildElementsByName", function() {
	var doc = jQuery.parseXML("<foo><bar>1</bar><baz/><foo2/></foo>");
	
	var count = 0;
	var names = "bar baz".split(" ");
	core.util.XmlUtils.walkChildElementsByName(doc.documentElement, names, function(node) {
		count++;
		same(node.tagName, names[count - 1], "invoked with correct node");
	});
	same(count, 2, "callback was invoked for 2 child nodes");
	
	core.util.XmlUtils.walkChildElementsByName(doc.documentElement, "foo 123".split(" "), function(node) {
		ok(false, "callback not invoked when child nodes don't match");
	});
	
	count = 0;
	core.util.XmlUtils.walkChildElementsByName(doc.documentElement, "bar", function(node) {
		count++;
		same(node.tagName, "bar", "callback invoked with correct node");
	});	
	same(count, 1, "callback was invoked for one child node");
});

test("walkChildElements", function() {
	var doc = jQuery.parseXML("<foo><bar>1</bar><baz/></foo>");
	
	core.util.XmlUtils.walkChildElements(doc.documentElement, undefined);
	
	core.util.XmlUtils.walkChildElements(doc.documentElement, null);

	var childNodeInvokes = 0;
	var expectedChildNodeNames = ["bar", "baz"];
	core.util.XmlUtils.walkChildElements(doc.documentElement,
			function(node) {
				same(typeof node, "object", "node argument is an object");
				ok(childNodeInvokes++ <= expectedChildNodeNames.length, "haven't received too many notifications of child nodes");
				same(node.nodeName, expectedChildNodeNames[childNodeInvokes - 1], "");
			}
	);
	same(childNodeInvokes, expectedChildNodeNames.length);
	
	try {
		core.util.XmlUtils.walkChildElements(doc.documentElement, {});
		ok(false, "expected exception - callback was an invalid object type");
	}
	catch (e) {
		same("" + e, "Invalid callback - expected to be a function or an " +
				"object with a \"callback\" property that is a function", 
				"correct exception was thrown");
	}

	try {
		core.util.XmlUtils.walkChildElements(doc.documentElement, []);
		ok(false, "expected exception - callback was an invalid object type");
	}
	catch (e) {
		same("" + e, "Invalid callback - expected to be a function or an " +
				"object with a \"callback\" property that is a function", 
				"correct exception was thrown");
	}
	
	doc = jQuery.parseXML("<foo>bar</foo>");
	core.util.XmlUtils.walkChildElements(doc.documentElement,
			function() {
				ok(false, "parent node has no children");
			}
	);

	core.util.XmlUtils.walkChildElements(undefined,
		{
			callback: function(node) {
				ok(false, "no child nodes should exist in an undefined parent node");
			}
		});
	
	core.util.XmlUtils.walkChildElements(null,
			{
				callback: function(node) {
					ok(false, "no child nodes should exist in an undefined parent node");
				}
			});
	
	core.util.XmlUtils.walkChildElements([],
			{
				callback: function(node) {
					ok(false, "no child nodes should exist in an undefined parent node");
				}
			});
	
	core.util.XmlUtils.walkChildElements({},
			{
				callback: function(node) {
					ok(false, "no child nodes should exist in an undefined parent node");
				}
			});
});