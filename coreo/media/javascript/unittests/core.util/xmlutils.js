module("core.util.XmlUtils");

test("ELEMENT_NODE_TYPE", function() {
	strictEqual(core.util.XmlUtils.ELEMENT_NODE_TYPE, 1, "ELEMENT_NODE_TYPE property is defined");
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

test("iterateElements", function() {
	var doc = core.util.XmlUtils.createXmlDoc("<foo a=\"b\"><bar/><baz/></foo>");
	var elements = [];
	core.util.XmlUtils.iterateElements(doc.documentElement.childNodes, function(element) {
		elements.push(element);
	});
	strictEqual(elements.length, 2);
	strictEqual(elements[0].tagName, "bar");
	strictEqual(elements[1].tagName, "baz");
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
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"2\"]")[0]), "urn:ns1");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"2\"]")[0], 
			new core.util.NamespaceContext({"":"foo", "ns1":"urn:ns2"})), "urn:ns2");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"3\"]")[0]), "");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"3\"]")[0], 
			new core.util.NamespaceContext({"":"foo"})), "foo");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"4\"]")[0]), "urn:ns1");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"4\"]")[0], 
			new core.util.NamespaceContext({"":"foo", "ns1":"urn:ns2"})), "urn:ns2");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"5\"]")[0]), "urn:ns2");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"5\"]")[0], 
			new core.util.NamespaceContext({"":"foo", "ns2":"urn:ns3"})), "foo");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"6\"]")[0]), "urn:ns2");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"6\"]")[0], 
			new core.util.NamespaceContext({"":"foo"})), "foo");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"7\"]")[0]), "urn:ns3");
	strictEqual(core.util.XmlUtils.getNamespaceURI($(doc.documentElement).find("[id=\"7\"]")[0], 
			new core.util.NamespaceContext({"":"foo"})), "foo");

	doc = jQuery.parseXML("<ns1:foo id=\"1\" xmlns:ns1=\"urn:ns1\"><ns1:bar/></ns1:foo>");
	strictEqual(core.util.XmlUtils.getNamespaceURI(doc.documentElement), "urn:ns1", "found correct namespace for root element");
	strictEqual(core.util.XmlUtils.getNamespaceURI(doc.documentElement.childNodes[0]), "urn:ns1", "found namespace for child element");
});

test("findNewNsPrefix", function() {
	var doc = core.util.XmlUtils.createXmlDoc("<foo><bar xmlns:" 
			+ core.util.XmlUtils.NS_PREFIX_PREFIX 
			+ "1=\"urn:foo\"><baz/></bar></foo>");
	var prefix = core.util.XmlUtils.findNewNsPrefix(doc.documentElement);
	strictEqual(prefix, core.util.XmlUtils.NS_PREFIX_PREFIX + "2");
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

test("escapeJquerySelectorValue", function() {
	strictEqual(core.util.XmlUtils.escapeJquerySelectorValue("!\"#$%&'()*+,./:;?@[\\]^`{|}~"),
			"\\!\\\"\\#\\$\\%\\&\\'\\(\\)\\*\\+\\,\\.\\/\\:\\;\\?\\@\\[\\\\\\]\\^\\`\\{\\|\\}\\~");
});

test("getAncestorAttributeValue", function() {
	var xml = "<foo xmlns:a=\"urn:foo\"><foo1 a:b=\"1\" c=\"2\">"
		+ "<foo2 a:b=\"3\"></foo2></foo1></foo>";
	var dom = core.util.XmlUtils.createXmlDoc(xml);
	var el = $(dom.documentElement).find("foo2")[0];
	strictEqual(core.util.XmlUtils.getAncestorAttributeValue(el, "a:b"), "1");
	strictEqual(core.util.XmlUtils.getAncestorAttributeValue(el, "c"), "2");
});

test("getDefaultNamespaceURI", function() {
	var dom = core.util.XmlUtils.createXmlDoc("<foo1><foo2 xmlns=\"urn:foo2\">"
			+ "<foo3 xmlns=\"urn:foo3\"><foo4 /></foo3></foo2><foo5 /></foo1>");
	strictEqual(core.util.XmlUtils.getDefaultNamespaceURI($(dom.documentElement)[0]), "");
	strictEqual(core.util.XmlUtils.getDefaultNamespaceURI($(dom.documentElement).find("foo2")[0]), "urn:foo2");
	strictEqual(core.util.XmlUtils.getDefaultNamespaceURI($(dom.documentElement).find("foo3")[0]), "urn:foo3");
	strictEqual(core.util.XmlUtils.getDefaultNamespaceURI($(dom.documentElement).find("foo4")[0]), "urn:foo3");
	strictEqual(core.util.XmlUtils.getDefaultNamespaceURI($(dom.documentElement).find("foo5")[0]), "");
});

test("childDeclaresNsPrefix", function() {
	var dom = core.util.XmlUtils.createXmlDoc("<foo1><foo2 xmlns:a=\"urn:foo\">"
			+ "<foo3 xmlns:b=\"urn:foo2\" /></foo2><foo4 /></foo1>");
	strictEqual(core.util.XmlUtils.childDeclaresNsPrefix($(dom.documentElement)[0], "a"), true);
	strictEqual(core.util.XmlUtils.childDeclaresNsPrefix($(dom.documentElement).find("foo2")[0], "a"), false);
	strictEqual(core.util.XmlUtils.childDeclaresNsPrefix($(dom.documentElement)[0], "b"), true);
	strictEqual(core.util.XmlUtils.childDeclaresNsPrefix($(dom.documentElement)[0], "c"), false);
});

test("getNamespaceContext", function() {
	var dom = core.util.XmlUtils.createXmlDoc("<foo1 xmlns=\"urn:defaultns\"><foo2 xmlns:a=\"urn:foo\" xmlns:b=\"urn:foo4\">"
			+ "<foo3 xmlns:b=\"urn:foo2\" xmlns:abc=\"urn:foo3\"/></foo2><foo4 /></foo1>");
	var nsContext = core.util.XmlUtils.getNamespaceContext($(dom.documentElement).find("foo3")[0], true);
	ok(nsContext);
	
	strictEqual(nsContext.getDefault(), "urn:defaultns");

	strictEqual(nsContext.getPrefix("urn:foo2"), "b");
	strictEqual(nsContext.getUri("b"), "urn:foo2");

	strictEqual(nsContext.getPrefix("urn:foo3"), "abc");
	strictEqual(nsContext.getUri("abc"), "urn:foo3");

	strictEqual(nsContext.getPrefix("urn:foo"), "a");
	strictEqual(nsContext.getUri("a"), "urn:foo");

	strictEqual(nsContext.getPrefix("urn:foo4"), undefined);
});

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