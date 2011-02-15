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
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	
	var CBUTILS = core.util.CallbackUtils;
	var QN = core.util.QualifiedName;
	
	var XmlUtils = {
		/**
		 * ELEMENT_NODE_TYPE
		 * 
		 * The value of the nodeType attribute of a DOM node when it is an element
		 */
		ELEMENT_NODE_TYPE: 1,

		/**
		 * Invokes a callback for each child node found that is an element node
		 */
		walkChildElements: function(node, callback) {
			if (node && ("childNodes" in node)) {
				var nodeList = node.childNodes;
				if (nodeList && ("length" in nodeList) && ("item" in nodeList)) {
					for (var i = 0; i < nodeList.length; i++) {
						var child = nodeList.item(i);
						if (child && ("nodeType" in child) && (child.nodeType === XmlUtils.ELEMENT_NODE_TYPE)) {
							CBUTILS.invokeCallback(callback, child);
						}
					}
				}
			}
		},

		/**
		 * Invokes a callback for each child node found that is an element node and
		 * also matches a set of names
		 */
		walkChildElementsByName: function(node, names, callback) {
			var namesArr = $.makeArray(names);
			XmlUtils.walkChildElements(node, function(element) {
				if ($.inArray(element.tagName, namesArr) > -1) {
					CBUTILS.invokeCallback(callback, element);
				}
			});
		},
		
		createXmlDoc: function(xml) {
			if ($.isXMLDoc(xml)) {
				return xml;
			}
			var xmlDoc = $.parseXML(xml);
			if (typeof ActiveXObject === "object") {
				// this is IE. IE XML DOM objects have a parseError property.
				if ("parseError" in xmlDoc
						&& xmlDoc.parseError
						&& "errorCode" in xmlDoc.parseError
						&& xmlDoc.parseError.errorCode) {
					throw "Invalid XML";
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
					throw "Invalid XML";
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
				throw "Unsupported browser";
			}
			return xml;
		},
		
		/**
		 * Invoke a callback for each parent node
		 */
		walkParents: function(element, callback) {
			var keepGoing = true;
			while (keepGoing && "parentNode" in element && !("documentElement" in element)) {
				element = element.parentNode;
				if (!("documentElement" in element)) {
					keepGoing = CBUTILS.invokeCallback(callback, element);
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
			if (element === undefined || element === null
					|| !"tagName" in element
					|| element.tagName === undefined) {
				return undefined;
			}
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
					throw "Namespace prefix " + nsPrefix + " is not declared";
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
			var fullname = element.tagName;
			var parts = fullname.split(":");
			if (parts.length < 1 || parts.length > 2) {
				throw "Illegal element name - " + fullname;
			}
			var nsUri = XmlUtils.getNamespaceURI(element);
			var qname = {};
			if (parts.length == 2)
				QN.call(qname, parts[0], nsUri, parts[1])
			else
				QN.call(qname, null, nsUri, parts[0]);
			return qname;
		},

		getDeclaredNamespaces: function(element) {
			if (!element) {
				return {};
			}
			var namespaces = {};
			if (element && "attributes" in element 
					&& typeof element.attributes === "object") {
				var attrs = element.attributes;
				if (attrs && "length" in attrs && typeof attrs.length === "number"
					&& "item" in attrs && typeof attrs.item === "function") {
					for (var i = 0; i < attrs.length; i++) {
						var attr = attrs.item(i);
						if (/xmlns\:\S+/i.test(attr.name)) {
							var prefix = attr.name.substr(6);
							var uri = attr.nodeValue;
							namespaces[prefix] = uri;
						}
					}
				}
			}
			return namespaces;
		},
		
		getNamespacePrefixForURI: function(element, nsUri, searchAncestors) {
			if (!$.isXMLDoc(element))
				return null;
			if (!nsUri || nsUri === "" || typeof nsUri !== "string")
				return null;
			var defaultNs = $(element).attr("xmlns");
			if (defaultNs === nsUri) {
				return "";
			}
			var nsMap = XmlUtils.getDeclaredNamespaces(element);
			var prefix = null;
			for (var declaredPrefix in nsMap) {
				if (nsMap[declaredPrefix] === nsUri) {
					prefix = declaredPrefix;
					break;
				}
			}
			if (!prefix && searchAncestors !== false) {
				XmlUtils.walkParents(element, function(parent) {
					var prefixHere = XmlUtils.getNamespacePrefixForURI(parent, nsUri, false);
					if (prefixHere) {
						prefix = prefixHere;
						return false;
					}
					return true;
				});
			}
			return prefix;
		}
		
	};
	ns.XmlUtils = XmlUtils;

})(jQuery, window.core.util);