/**
 * Class: XmlUtils
 * 
 * Namespace:
 *  core.util
 *  
 * Dependencies:
 *  - jQuery
 *  - core.util.QualifiedName
 *  - core.util.CallbackUtils
 *  - core.util.Assert
 *  - core.util.NamespaceContext
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {

	var CallbackUtils = core.util.CallbackUtils;
	var QualifiedName = core.util.QualifiedName;
	var Assert = core.util.Assert;
	var NamespaceContext = core.util.NamespaceContext;

	/*
	 * declareNamespace
	 * - createXmlDoc
	 * - getXmlString
	 * - assertElement
	 * - isElement
	 * - getQualifiedName
	 */

	var XmlUtils = {
		/**
		 * ELEMENT_NODE_TYPE
		 * 
		 * The value of the nodeType attribute of a DOM node when it is an element
		 */
		ELEMENT_NODE_TYPE: 1,
	
		/**
		 * The prefix used when generating new namespace prefixes
		 */
		NS_PREFIX_PREFIX: "cns-",

		isElement: function(o) {
			return (o !== undefined && o !== null 
					&& (typeof o === "object")
					&& ($.isXMLDoc(o))
					&& ("nodeType" in o)
					&& (typeof o.nodeType === "number")
					&& (o.nodeType === XmlUtils.ELEMENT_NODE_TYPE));
		},

		assertElement: function(o) {
			Assert.isTrue(XmlUtils.isElement(o), 
					new TypeError("Not an XML DOM element - " + o));
		},

		createXmlDoc: function(xml) {
			if (xml == null || xml == undefined) {
				return null;
			}
			if ($.isXMLDoc(xml)) {
				return xml;
			}
			Assert.type(xml, "string");
			var xmlDoc = $.parseXML(xml);
			if (typeof ActiveXObject === "object") {
				// this is IE. IE XML DOM objects have a parseError property.
				if ("parseError" in xmlDoc
						&& xmlDoc.parseError
						&& "errorCode" in xmlDoc.parseError
						&& xmlDoc.parseError.errorCode) {
					throw new TypeError("Invalid XML");
				}
			}
			else {
				// Have to inspect the XML elements (not very reliable).
				// Assume the parse failed if there's a parsererror element
				// in the XML DOM, but no parsererror element in the XML text.
				// If the XML text contains a parsererror element, this will
				// not catch XML parsing errors.
				var errorEl = $(xmlDoc.documentElement).find("parsererror");
				if (errorEl.length > 0
						&& !/.*<parsererror.+/i.test(xml)) {
					throw new TypeError("Invalid XML. Error details: " + XmlUtils.getXmlString(xmlDoc));
				}
			}
			return xmlDoc;
		},
		
		/**
		 * Returns the textual representation of an XML DOM object
		 */
		getXmlString: function(xmlDom) {
			if (!xmlDom)
				return undefined;
			var xml;
			if ("xml" in xmlDom) {
				xml = xmlDom.xml;
			}
			else if (typeof XMLSerializer == "function") {
				xml = (new XMLSerializer()).serializeToString(xmlDom);
			}
			else {
				throw new ReferenceError("Unsupported browser");
			}
			return xml;
		},
		
		getQualifiedName: function(element, nsContext) {
			XmlUtils.assertElement(element);
			var fullname = element.tagName;
			var parts = fullname.split(":");
			if (parts.length < 1 || parts.length > 2) {
				throw new TypeError("Illegal element name - " + fullname);
			}
			var nsUri = XmlUtils.getNamespaceURI(element, nsContext);
			return parts.length == 2
				? new QualifiedName(parts[0], nsUri, parts[1])
				: new QualifiedName(null, nsUri, parts[0]);
		},
		
		/**
		 * Declares a namespace prefix on an element. Returns the new prefix.
		 * nsPrefix parameter is optional - will generate a new prefix if 
		 * not provided.
		 */
		declareNamespace: function(element, nsUri, nsPrefix) {
			XmlUtils.assertElement(element);
			Assert.notNull(nsUri, "nsUri cannot be null");
			Assert.type(nsUri, "string", "nsUri must be a string");
			Assert.isTrue($.trim(nsUri).length > 0, "Namespace URI cannot be an empty string");
			if (nsPrefix == undefined || nsPrefix == null) {
				nsPrefix = XmlUtils.findNewNsPrefix(element);
			}
			Assert.type(nsPrefix, "string", "nsPrefix must be a string");
			$(element).attr("xmlns:" + nsPrefix, nsUri);
			return nsPrefix;
		},
		
		iterateElements: function(nodeList, callback) {
			Assert.notNull(callback, "callback cannot be null");
			Assert.notNull(nodeList, "nodeList cannot be null");
			Assert.hasMember(nodeList, "length", "nodeList must be a NodeList object");
			Assert.hasFunction(nodeList, "item", "nodeList must be a NodeList object");
			for (var i = 0; i < nodeList.length; i++) {
				var child = nodeList.item(i);
				if (XmlUtils.isElement(child)) {
					CallbackUtils.invokeCallback(callback, child);
				}
			}
		},
		
		/**
		 * Get the namespace of an XML element
		 */
		getNamespaceURI: function(element, nsContext) {
			XmlUtils.assertElement(element);
			if (nsContext) {
				Assert.type(nsContext, "object");
				Assert.hasFunction(nsContext, "getUri");
				Assert.hasFunction(nsContext, "getDefault");
			}
			if (element.tagName.indexOf(":") > 0) {
				// element name is prefixed with namespace prefix
				// find where the prefix was declared
				var ns = undefined;
				var nsPrefix = element.tagName.split(":", 1)[0];
				if (nsContext) {
					ns = nsContext.getUri(nsPrefix);
				}
				else {
					var xmlnsAttrName = "xmlns:" + nsPrefix;
					if (element.hasAttribute(xmlnsAttrName)) {
						return element.getAttribute(xmlnsAttrName);
					}
					ns = XmlUtils.getAncestorAttributeValue(element, "xmlns:" + nsPrefix);
				}
				if (ns == undefined) {
					throw new ReferenceError("Namespace prefix " + nsPrefix + " is not declared");
				}
				return $.trim(ns);
			}
			else {
				// element name doesn't contain a prefix
				if (nsContext) {
					return nsContext.getDefault();
				}
				else {
					return XmlUtils.getDefaultNamespaceURI(element);
				}
			}
		},

		findNewNsPrefix: function(element, nsContext) {
			if (!nsContext) {
				nsContext = XmlUtils.getNamespaceContext(element, true);
			}
			var i = 0;
			while (++i > 0) {
				var nsPrefix = XmlUtils.NS_PREFIX_PREFIX + i;
				if (!nsContext.containsPrefix(nsPrefix)
						&& !XmlUtils.childDeclaresNsPrefix(element, nsPrefix)) {
					return nsPrefix;
				}
			}
		},

		escapeJquerySelectorValue: function(str) {
			var specialChars = "!\"#$%&'()*+,./:;?@[\\]^`{|}~]";
			var escapedStr = "";
			for (var i = 0; i < str.length; i++) {
				var char = str.charAt(i);
				if (specialChars.indexOf(char) >= 0) {
					escapedStr += "\\";
				}
				escapedStr += char;
			}
			return escapedStr;
		},

		/**
		 * Gets the value of an ancestor's attribute. Value used will be from the 
		 * nearest ancestor containing the attribute.
		 */
		getAncestorAttributeValue: function(element, attributeName) {
			element = $(element);
			while (element.length > 0) {
				element = element.parent();
				if (element.length > 0) {
					var value = element.attr(attributeName);
					if (value) {
						return value;
					}
				}
			}
			return undefined;
		},

		/**
		 * Gets the namespace of an element that is used if the element doesn't 
		 * declare its namespace
		 */
		getDefaultNamespaceURI: function(element) {
			// search for an "xmlns" attribute on the closest parent element
			var xmlns = $(element).closest("[xmlns]").attr("xmlns");
			return xmlns ? xmlns : "";
		},

		childDeclaresNsPrefix: function(element, nsPrefix) {
			return $(element).find("[xmlns\\:" + nsPrefix + "]").length > 0;
		},

		getNamespaceContext: function(element, searchAncestors) {
			XmlUtils.assertElement(element);
			var namespaces = {};
			var attrs = element.attributes;
			for (var i = 0; i < attrs.length; i++) {
				var attr = attrs.item(i);
				if (/xmlns\:\S+/i.test(attr.name)) {
					var prefix = attr.name.substr(6);
					var uri = attr.nodeValue;
					namespaces[prefix] = uri;
				}
				else if (/xmlns/i.test(attr.name)) {
					namespaces[""] = attr.nodeValue;
				}
			}
			if (searchAncestors !== false) {
				XmlUtils.walkParents(element, function(parent) {
					var parentNsMap = XmlUtils.getNamespaceContext(parent, false);
					for (var parentPrefix in parentNsMap.prefixToUriMap) {
						var parentUri = parentNsMap.prefixToUriMap[parentPrefix];
						// if closer (lower-level) element hasn't already 
						// defined this prefix, add this declaration to the 
						// namespace map
						if (!(parentPrefix in namespaces)) {
							namespaces[parentPrefix] = parentUri;
						}
					}
				});
			}
			return new NamespaceContext(namespaces);
		},

		/**
		 * Invoke a callback for each parent node
		 */
		walkParents: function(element, callback) {
			Assert.notNull(callback, "callback cannot be null");
			XmlUtils.assertElement(element);
			if ("parentNode" in element) {
				var parent = element.parentNode;
				if (XmlUtils.isElement(parent)
						&& (CallbackUtils.invokeCallback(callback, parent) !== false)) {
					XmlUtils.walkParents(parent, callback);
				}
			}
		},
		
//		/**
//		 * Invokes a callback for each child node found that is an element node
//		 */
//		iterateChildElements: function(element, callback) {
//			Assert.notNull(callback, "callback cannot be null");
//			if (element != null && element != undefined) {
//				XmlUtils.assertElement(element);
//				XmlUtils.iterateElements(element.childNodes, callback);
//			}
//		},
//
//		/**
//		 * Invokes a callback for each child node found that is an element node and
//		 * also matches a set of names
//		 */
//		iterateChildElementsByName: function(node, names, callback) {
//			var namesArr = $.makeArray(names);
//			XmlUtils.iterateChildElements(node, function(element) {
//				if ($.inArray(element.tagName, namesArr) > -1) {
//					CallbackUtils.invokeCallback(callback, element);
//				}
//			});
//		},
//		
//		getOrDeclareNsPrefix: function(element, nsUri, nsContext) {
//			var nsPrefix = XmlUtils.getNamespacePrefixForURI(element, nsUri, true);
//			if (nsPrefix == null || nsPrefix == undefined) {
//				nsPrefix = XmlUtils.declareNamespace(element, nsUri);
//			}
//			return nsPrefix;
//		},
//		
//		getDeclaredNamespaces: function(element, includeAncestors) {
//			XmlUtils.assertElement(element);
//			var namespaces = {};
//			var attrs = element.attributes;
//			for (var i = 0; i < attrs.length; i++) {
//				var attr = attrs.item(i);
//				if (/xmlns\:\S+/i.test(attr.name)) {
//					var prefix = attr.name.substr(6);
//					var uri = attr.nodeValue;
//					namespaces[prefix] = uri;
//				}
//			}
//			if (includeAncestors === true) {
//				XmlUtils.walkParents(element, function(parent) {
//					var parentNsMap = XmlUtils.getDeclaredNamespaces(parent, false);
//					for (var prefix in parentNsMap) {
//						var uri = parentNsMap[prefix];
//						// if closer (lower-level) element hasn't already 
//						// defined this prefix, add this declaration to the 
//						// namespace map
//						if (!(prefix in namespaces)) {
//							namespaces[prefix] = uri;
//						}
//					}
//				});
//			}
//			return namespaces;
//		},
//		
//		getNamespacePrefixForURI: function(element, nsUri, searchAncestors) {
//			XmlUtils.assertElement(element);
//			if (nsUri == null || nsUri == undefined || nsUri === "")
//				return undefined;
//			Assert.type(nsUri, "string");
//			if ($(element).attr("xmlns") === nsUri) {
//				return "";
//			}
//			searchAncestors = searchAncestors === false ? false : true;
//			var nsMap = XmlUtils.getDeclaredNamespaces(element, searchAncestors);
//			for (var prefix in nsMap) {
//				if (nsMap[prefix] === nsUri) {
//					return prefix;
//				}
//			}
//			return undefined;
//		},
//		
//		getNamespaceURIForPrefix: function(element, nsPrefix, searchAncestors) {
//			XmlUtils.assertElement(element);
//			Assert.notNull(nsPrefix, "nsPrefix cannot be null");
//			Assert.type(nsPrefix, "string", "nsPrefix must be a string");
//			var searchAncestors = searchAncestors === false ? false : true;
//			var nsMap = XmlUtils.getDeclaredNamespaces(element, searchAncestors);
//			return (nsPrefix in nsMap) ? nsMap[nsPrefix] : undefined;
//		}
	};
	ns.XmlUtils = XmlUtils;

})(jQuery, window.core.util);