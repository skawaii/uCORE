module("core.util.XmlUtils");

test("walkParents", function() {
	var doc = core.util.XmlUtils.createXmlDoc("<foo a=\"b\"><bar a=\"b\"><baz a=\"b\"/></bar></foo>");
	var parents = [];
	core.util.XmlUtils.walkParents($(doc.documentElement).find("baz")[0], function(parent) {
		ok(parent != null && parent != undefined);
		ok("tagName" in parent);
		ok("nodeType" in parent);
		strictEqual(parent.nodeType, core.util.XmlUtils.ELEMENT_NODE_TYPE);
		parents.push(parent.tagName);
	});
	strictEqual(parents.length, 2, "callback was invoked for 2 parent elements");
	strictEqual(parents[0], "bar");
	strictEqual(parents[1], "foo");
});

test("getOrDeclareNsPrefix", function() {
	var doc = core.util.XmlUtils.createXmlDoc("<foo><bar xmlns:" 
			+ core.util.XmlUtils.NS_PREFIX_PREFIX 
			+ "1=\"urn:foo2\"><baz/></bar></foo>");
	var prefix = core.util.XmlUtils.getOrDeclareNsPrefix(doc.documentElement, "urn:foo");
	strictEqual(prefix, core.util.XmlUtils.NS_PREFIX_PREFIX + "1", "generated prefix - didn't find any conflicts");
	strictEqual($(doc.documentElement).attr("xmlns:" + prefix), "urn:foo", "prefix was declared");
	strictEqual(core.util.XmlUtils.getOrDeclareNsPrefix(doc.documentElement, "urn:foo"), prefix, 
			"same prefix is used for future URI requests");
	
	strictEqual(core.util.XmlUtils.getOrDeclareNsPrefix($(doc.documentElement).find("bar")[0], "urn:foo"),
			core.util.XmlUtils.NS_PREFIX_PREFIX + "2", "re-declared prefix isn't used");
	prefix = core.util.XmlUtils.getOrDeclareNsPrefix($(doc.documentElement).find("bar")[0], "urn:foo2");
	strictEqual(prefix, core.util.XmlUtils.NS_PREFIX_PREFIX + "1", "re-declared prefix is used with correct URI");
	
	strictEqual(core.util.XmlUtils.getOrDeclareNsPrefix($(doc.documentElement).find("baz")[0], "urn:foo"), 
			core.util.XmlUtils.NS_PREFIX_PREFIX + "2",
			"parent element's (not root's) prefix declaration is used");
});

test("findNewNsPrefix", function() {
	var doc = core.util.XmlUtils.createXmlDoc("<foo><bar xmlns:" 
			+ core.util.XmlUtils.NS_PREFIX_PREFIX 
			+ "1=\"urn:foo\"><baz/></bar></foo>");
	var prefix = core.util.XmlUtils.findNewNsPrefix(doc.documentElement);
	strictEqual(prefix, core.util.XmlUtils.NS_PREFIX_PREFIX + "1");
	prefix = core.util.XmlUtils.findNewNsPrefix($(doc.documentElement).find("bar")[0]);
	strictEqual(prefix, core.util.XmlUtils.NS_PREFIX_PREFIX + "2");
	prefix = core.util.XmlUtils.findNewNsPrefix($(doc.documentElement).find("baz")[0]);
	strictEqual(prefix, core.util.XmlUtils.NS_PREFIX_PREFIX + "2");
	raises(function(){core.util.XmlUtils.findNewNsPrefix(undefined);});
	raises(function(){core.util.XmlUtils.findNewNsPrefix(null);});
	raises(function(){core.util.XmlUtils.findNewNsPrefix([]);});
	raises(function(){core.util.XmlUtils.findNewNsPrefix({});});
	raises(function(){core.util.XmlUtils.findNewNsPrefix("");});
});

test("declareNamespace", function() {
	var doc = core.util.XmlUtils.createXmlDoc("<foo a=\"b\"><bar/></foo>");
	var prefix = core.util.XmlUtils.declareNamespace(doc.documentElement, "urn:foo", "f");
	strictEqual(prefix, "f");
	strictEqual($(doc.documentElement).attr("xmlns:f"), "urn:foo");
	prefix = core.util.XmlUtils.declareNamespace(doc.documentElement, "urn:foo2");
	ok(prefix);
	strictEqual(typeof prefix, "string");
	strictEqual($(doc.documentElement).attr("xmlns:" + prefix), "urn:foo2");
	raises(function(){core.util.XmlUtils.declareNamespace(undefined, "urn:foo3", "f");});
	raises(function(){core.util.XmlUtils.declareNamespace(null, "urn:foo3", "f");});
	raises(function(){core.util.XmlUtils.declareNamespace({}, "urn:foo3", "f");});
	raises(function(){core.util.XmlUtils.declareNamespace([], "urn:foo3", "f");});
	raises(function(){core.util.XmlUtils.declareNamespace("", "urn:foo3", "f");});
	raises(function(){core.util.XmlUtils.declareNamespace(doc.documentElement, null, "f");});
	raises(function(){core.util.XmlUtils.declareNamespace(doc.documentElement, undefined, "f");});
	raises(function(){core.util.XmlUtils.declareNamespace(doc.documentElement, "", "f");});
	raises(function(){core.util.XmlUtils.declareNamespace(doc.documentElement, " \t", "f");});
});

test("isElement", function() {
	var doc = core.util.XmlUtils.createXmlDoc("<foo a=\"b\"><bar/></foo>");
	strictEqual(core.util.XmlUtils.isElement(doc), false);
	strictEqual(core.util.XmlUtils.isElement(doc.documentElement), true);
	strictEqual(core.util.XmlUtils.isElement(doc.documentElement.attributes.item(0)), false);
	strictEqual(core.util.XmlUtils.isElement($(doc.documentElement).find("bar")[0]), true);
	strictEqual(core.util.XmlUtils.isElement($(doc.documentElement)), false);
	strictEqual(core.util.XmlUtils.isElement(""), false);
	strictEqual(core.util.XmlUtils.isElement(null), false);
	strictEqual(core.util.XmlUtils.isElement(undefined), false);
	strictEqual(core.util.XmlUtils.isElement([]), false);
	strictEqual(core.util.XmlUtils.isElement({}), false);
	strictEqual(core.util.XmlUtils.isElement({ nodeType: core.util.XmlUtils.ELEMENT_NODE_TYPE }), false);
});

test("assertElement", function() {
	var doc = core.util.XmlUtils.createXmlDoc("<foo a=\"b\"><bar/></foo>");
	core.util.XmlUtils.assertElement(doc.documentElement);
	
	try {
		core.util.XmlUtils.assertElement(null);
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
});

test("getNamespaceURIForPrefix", function() {
	var doc = core.util.XmlUtils.createXmlDoc(
			  "<foo1>"
			+ "  <foo2 xmlns:ns1=\"urn:core1\" xmlns:ns2=\"urn:core2\">"
			+ "    <foo3 xmlns:ns3=\"urn:core3\" />"
			+ "  </foo2>"
			+ "  <foo4 />"
			+ "  <foo5 xmlns=\"urn:core4\" />"
			+ "</foo1>");
	
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix(doc.documentElement, "ns1"), undefined);
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix(doc.documentElement, "ns2"), undefined);
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix(doc.documentElement, "ns3"), undefined);
	
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo2")[0], "ns1"), "urn:core1");
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo2")[0], "ns2"), "urn:core2");
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo2")[0], "ns3"), undefined);
	
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo3")[0], "ns1"), "urn:core1");
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo3")[0], "ns2"), "urn:core2");
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo3")[0], "ns3"), "urn:core3");

	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo4")[0], "ns1"), undefined);
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo4")[0], "ns2"), undefined);
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo4")[0], "ns3"), undefined);
	
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo5")[0], "ns1"), undefined);
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo5")[0], "ns2"), undefined);
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo5")[0], "ns3"), undefined);
	
	try {
		core.util.XmlUtils.getNamespaceURIForPrefix(null, "ns1");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.util.XmlUtils.getNamespaceURIForPrefix(undefined, "ns1");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.util.XmlUtils.getNamespaceURIForPrefix("", "ns1");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.util.XmlUtils.getNamespaceURIForPrefix([], "ns1");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.util.XmlUtils.getNamespaceURIForPrefix({}, "ns1");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		var attr = $(doc.documentElement).find("foo2")[0].attributes.item(0);
		core.util.XmlUtils.getNamespaceURIForPrefix(attr, "ns1");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	
	raises(function(){core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo2")[0], undefined);});
	raises(function(){core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo2")[0], null);});
	strictEqual(core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo2")[0], ""), undefined);
	raises(function(){core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo2")[0], []);});
	raises(function(){core.util.XmlUtils.getNamespaceURIForPrefix($(doc.documentElement).find("foo2")[0], {});});
});

test("createXmlDoc", function() {
	ok(core.util.XmlUtils.createXmlDoc("<foo/>"));
	
	try {
		core.util.XmlUtils.createXmlDoc("foo");
		ok(false, "expected exception when XML is invalid");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
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
			+ "    <foo6 xmlns:ns1=\"urn:core4\" />"
			+ "  </foo2>"
			+ "  <foo4 />"
			+ "  <foo5 xmlns=\"urn:core4\" />"
			+ "</foo1>");
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, "urn:core1"), undefined);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, "urn:core2"), undefined);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, "urn:core3"), undefined);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, "urn:core4"), undefined);
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo2")[0], "urn:core1"), "ns1", "foo2");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo2")[0], "urn:core2"), "ns2", "foo2");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo2")[0], "urn:core3"), undefined, "foo2");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo2")[0], "urn:core4"), undefined, "foo2");
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo3")[0], "urn:core1"), "ns1", "foo3");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo3")[0], "urn:core2"), "ns2", "foo3");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo3")[0], "urn:core3"), "ns3", "foo3");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo3")[0], "urn:core4"), undefined, "foo3");
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo4")[0], "urn:core1"), undefined, "foo4");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo4")[0], "urn:core2"), undefined, "foo4");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo4")[0], "urn:core3"), undefined, "foo4");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo4")[0], "urn:core4"), undefined, "foo4");
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo5")[0], "urn:core1"), undefined, "foo5");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo5")[0], "urn:core2"), undefined, "foo5");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo5")[0], "urn:core3"), undefined, "foo5");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo5")[0], "urn:core4"), "", "foo5");

	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo6")[0], "urn:core1"), undefined, "foo6");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo6")[0], "urn:core2"), "ns2", "foo6");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo6")[0], "urn:core3"), undefined, "foo6");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("foo6")[0], "urn:core4"), "ns1", "foo6");
	
	try {
		core.util.XmlUtils.getNamespacePrefixForURI(null, "urn:core4");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.util.XmlUtils.getNamespacePrefixForURI(undefined, "urn:core4");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.util.XmlUtils.getNamespacePrefixForURI([], "urn:core4");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.util.XmlUtils.getNamespacePrefixForURI({foo: 1}, "urn:core4");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	try {
		core.util.XmlUtils.getNamespacePrefixForURI("foo", "urn:core4");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	var attr = $(doc.documentElement).find("foo2")[0].attributes.item(0);
	try {
		core.util.XmlUtils.getNamespacePrefixForURI(attr, "urn:core4");
		ok(false, "expected exception when element parameter is not an element");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
	
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, ""), undefined);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, null), undefined);
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, undefined), undefined);
	raises(function(){core.util.XmlUtils.getNamespacePrefixForURI(doc.documentElement, []);});
	
	doc = core.util.XmlUtils.createXmlDoc("<foo xmlns:ns1=\"urn:foo\"><bar><baz/></bar></foo>");
	strictEqual(core.util.XmlUtils.getNamespacePrefixForURI($(doc.documentElement).find("baz")[0], "urn:foo"), "ns1");
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
	raises(function(){core.util.XmlUtils.getNamespaceURI(doc);}, "passing a Document to getNamespaceURI() raises an exception");
	raises(function(){core.util.XmlUtils.getNamespaceURI(undefined);}, "passing undefined to getNamespaceURI() raises an exception");
	raises(function(){core.util.XmlUtils.getNamespaceURI(null)}, "passing null to getNamespaceURI() raises an exception");
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

test("iterateChildElementsByName", function() {
	var doc = jQuery.parseXML("<foo><bar>1</bar><baz/><foo2/></foo>");
	
	var count = 0;
	var names = "bar baz".split(" ");
	core.util.XmlUtils.iterateChildElementsByName(doc.documentElement, names, function(node) {
		count++;
		same(node.tagName, names[count - 1], "invoked with correct node");
	});
	same(count, 2, "callback was invoked for 2 child nodes");
	
	core.util.XmlUtils.iterateChildElementsByName(doc.documentElement, "foo 123".split(" "), function(node) {
		ok(false, "callback not invoked when child nodes don't match");
	});
	
	count = 0;
	core.util.XmlUtils.iterateChildElementsByName(doc.documentElement, "bar", function(node) {
		count++;
		same(node.tagName, "bar", "callback invoked with correct node");
	});	
	same(count, 1, "callback was invoked for one child node");
});

test("iterateChildElements", function() {
	var doc = jQuery.parseXML("<foo><bar>1</bar><baz/></foo>");
	
	raises(function() { core.util.XmlUtils.iterateChildElements(doc.documentElement, undefined) });
	
	raises(function() { core.util.XmlUtils.iterateChildElements(doc.documentElement, null); });

	var childNodeInvokes = 0;
	var expectedChildNodeNames = ["bar", "baz"];
	core.util.XmlUtils.iterateChildElements(doc.documentElement,
			function(node) {
				same(typeof node, "object", "node argument is an object");
				ok(childNodeInvokes++ <= expectedChildNodeNames.length, "haven't received too many notifications of child nodes");
				same(node.nodeName, expectedChildNodeNames[childNodeInvokes - 1], "");
			}
	);
	same(childNodeInvokes, expectedChildNodeNames.length);
	
	try {
		core.util.XmlUtils.iterateChildElements(doc.documentElement, {});
		ok(false, "expected exception - callback was an invalid object type");
	}
	catch (e) {
		same("" + e, "Invalid callback - expected to be a function or an " +
				"object with a \"callback\" property that is a function", 
				"correct exception was thrown");
	}

	try {
		core.util.XmlUtils.iterateChildElements(doc.documentElement, []);
		ok(false, "expected exception - callback was an invalid object type");
	}
	catch (e) {
		same("" + e, "Invalid callback - expected to be a function or an " +
				"object with a \"callback\" property that is a function", 
				"correct exception was thrown");
	}
	
	doc = jQuery.parseXML("<foo>bar</foo>");
	core.util.XmlUtils.iterateChildElements(doc.documentElement,
			function() {
				ok(false, "parent node has no children");
			}
	);

	core.util.XmlUtils.iterateChildElements(undefined,
		{
			callback: function(node) {
				ok(false, "no child nodes should exist in an undefined parent node");
			}
		});

	core.util.XmlUtils.iterateChildElements(null,
		{
			callback: function(node) {
				ok(false, "no child nodes should exist in an undefined parent node");
			}
		});
	
	raises(function() {
		core.util.XmlUtils.iterateChildElements([],
				{
					callback: function(node) {
						ok(false, "no child nodes should exist in an undefined parent node");
					}
				});
	});
	
	raises(function() {
		core.util.XmlUtils.iterateChildElements({},
				{
					callback: function(node) {
						ok(false, "no child nodes should exist in an undefined parent node");
					}
				});
	});
});