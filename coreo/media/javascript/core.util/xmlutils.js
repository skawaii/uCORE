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
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	
	var CBUTILS = core.util.CallbackUtils;
	var QN = core.util.QualifiedName;
	var ASSERT = core.util.Assert;
	
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
			ASSERT.isTrue(XmlUtils.isElement(o), 
					new TypeError("Not an XML DOM element - " + o));
		},
		
		iterateElements: function(nodeList, callback) {
			ASSERT.notNull(callback, "callback cannot be null");
			ASSERT.notNull(nodeList, "nodeList cannot be null");
			ASSERT.hasMember(nodeList, "length", "nodeList must be a NodeList object");
			ASSERT.hasFunction(nodeList, "item", "nodeList must be a NodeList object");
			for (var i = 0; i < nodeList.length; i++) {
				var child = nodeList.item(i);
				if (XmlUtils.isElement(child)) {
					CBUTILS.invokeCallback(callback, child);
				}
			}
		},
		
		/**
		 * Invokes a callback for each child node found that is an element node
		 */
		iterateChildElements: function(element, callback) {
			ASSERT.notNull(callback, "callback cannot be null");
			if (element != null && element != undefined) {
				XmlUtils.assertElement(element);
				XmlUtils.iterateElements(element.childNodes, callback);
			}
		},

		/**
		 * Invokes a callback for each child node found that is an element node and
		 * also matches a set of names
		 */
		iterateChildElementsByName: function(node, names, callback) {
			var namesArr = $.makeArray(names);
			XmlUtils.iterateChildElements(node, function(element) {
				if ($.inArray(element.tagName, namesArr) > -1) {
					CBUTILS.invokeCallback(callback, element);
				}
			});
		},
		
		createXmlDoc: function(xml) {
			if (xml == null || xml == undefined) {
				return null;
			}
			if ($.isXMLDoc(xml)) {
				return xml;
			}
			ASSERT.type(xml, "string");
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
		
		/**
		 * Invoke a callback for each parent node
		 */
		walkParents: function(element, callback) {
			ASSERT.notNull(callback, "callback cannot be null");
			XmlUtils.assertElement(element);
			if ("parentNode" in element) {
				var parent = element.parentNode;
				if (XmlUtils.isElement(parent)
						&& (CBUTILS.invokeCallback(callback, parent) !== false)) {
					XmlUtils.walkParents(parent, callback);
				}
			}
		},
		
		/**
		 * Gets the value of an ancestor's attribute. Value used will be from the 
		 * nearest ancestor containing the attribute.
		 */
		getAncestorAttributeValue: function(element, attributeName) {
			var value = undefined;
			XmlUtils.walkParents(element, function(parent) {
				if (parent.hasAttribute(attributeName)) {
					value = parent.getAttribute(attributeName);
					return false;
				}
				return true;
			});
			return value;
		},
		
		/**
		 * Gets the namespace of an element that is used if the element doesn't 
		 * declare its namespace
		 */
		getDefaultNamespaceURI: function(element) {
			// search for an "xmlns" attribute on the closest parent element
			var ns = XmlUtils.getAncestorAttributeValue(element, "xmlns");
			return ns !== undefined ? ns : "";
		},
		
		/**
		 * Get the namespace of an XML element
		 */
		getNamespaceURI: function(element, defaultNs) {
			XmlUtils.assertElement(element);
			if (element.tagName.indexOf(":") > 0) {
				// element name is prefixed with namespace prefix
				// find where the prefix was declared
				var nsPrefix = element.tagName.split(":", 1)[0];
				var xmlnsAttrName = "xmlns:" + nsPrefix;
				if (element.hasAttribute(xmlnsAttrName)) {
					return element.getAttribute(xmlnsAttrName);
				}
				var ns = XmlUtils.getAncestorAttributeValue(element, "xmlns:" + nsPrefix);
				if (ns == undefined) {
					throw new ReferenceError("Namespace prefix " + nsPrefix + " is not declared");
				}
				return jQuery.trim(ns);
			}
			else {
				// element name doesn't contain a prefix
				var xmlns = $(element).attr("xmlns");
				if (xmlns !== undefined) {
					return xmlns;
				}
				// element is in the default namespace
				if (defaultNs === undefined) {
					// search for the default namespace
					defaultNs = XmlUtils.getDefaultNamespaceURI(element);
				}
				return jQuery.trim(defaultNs);
			}
		},

		getQualifiedName: function(element) {
			XmlUtils.assertElement(element);
			var fullname = element.tagName;
			var parts = fullname.split(":");
			if (parts.length < 1 || parts.length > 2) {
				throw new TypeError("Illegal element name - " + fullname);
			}
			var nsUri = XmlUtils.getNamespaceURI(element);
			return parts.length == 2
				? new QN(parts[0], nsUri, parts[1])
				: new QN(null, nsUri, parts[0]);
		},

		findNewNsPrefix: function(element) {
			var allPrefixes = XmlUtils.getDeclaredNamespaces(element, true);
			var i = 0;
			while (++i > 0) {
				var nsPrefix = XmlUtils.NS_PREFIX_PREFIX + i;
				if (!(nsPrefix in allPrefixes)) {
					return nsPrefix;
				}
			}
		},
		
		/**
		 * Declares a namespace prefix on an element. Returns the new prefix.
		 * nsPrefix parameter is optional - will generate a new prefix if 
		 * not provided.
		 */
		declareNamespace: function(element, nsUri, nsPrefix) {
			XmlUtils.assertElement(element);
			ASSERT.notNull(nsUri, "nsUri cannot be null");
			ASSERT.type(nsUri, "string", "nsUri must be a string");
			ASSERT.isTrue($.trim(nsUri).length > 0, "Namespace URI cannot be an empty string");
			if (nsPrefix == undefined || nsPrefix == null) {
				nsPrefix = XmlUtils.findNewNsPrefix(element);
			}
			ASSERT.type(nsPrefix, "string", "nsPrefix must be a string");
			$(element).attr("xmlns:" + nsPrefix, nsUri);
			return nsPrefix;
		},

		getOrDeclareNsPrefix: function(element, nsUri) {
			var nsPrefix = XmlUtils.getNamespacePrefixForURI(element, nsUri, true);
			if (nsPrefix == null || nsPrefix == undefined) {
				nsPrefix = XmlUtils.declareNamespace(element, nsUri);
			}
			return nsPrefix;
		},
		
		getDeclaredNamespaces: function(element, includeAncestors) {
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
			}
			if (includeAncestors === true) {
				XmlUtils.walkParents(element, function(parent) {
					var parentNsMap = XmlUtils.getDeclaredNamespaces(parent, false);
					for (var prefix in parentNsMap) {
						var uri = parentNsMap[prefix];
						// if closer (lower-level) element hasn't already 
						// defined this prefix, add this declaration to the 
						// namespace map
						if (!(prefix in namespaces)) {
							namespaces[prefix] = uri;
						}
					}
				});
			}
			return namespaces;
		},
		
		getNamespacePrefixForURI: function(element, nsUri, searchAncestors) {
			XmlUtils.assertElement(element);
			if (nsUri == null || nsUri == undefined || nsUri === "")
				return undefined;
			ASSERT.type(nsUri, "string");
			if ($(element).attr("xmlns") === nsUri) {
				return "";
			}
			searchAncestors = searchAncestors === false ? false : true;
			var nsMap = XmlUtils.getDeclaredNamespaces(element, searchAncestors);
			for (var prefix in nsMap) {
				if (nsMap[prefix] === nsUri) {
					return prefix;
				}
			}
			return undefined;
		},
		
		getNamespaceURIForPrefix: function(element, nsPrefix, searchAncestors) {
			XmlUtils.assertElement(element);
			ASSERT.notNull(nsPrefix, "nsPrefix cannot be null");
			ASSERT.type(nsPrefix, "string", "nsPrefix must be a string");
			var searchAncestors = searchAncestors === false ? false : true;
			var nsMap = XmlUtils.getDeclaredNamespaces(element, searchAncestors);
			return (nsPrefix in nsMap) ? nsMap[nsPrefix] : undefined;
		}
		
	};
	ns.XmlUtils = XmlUtils;

})(jQuery, window.core.util);