/**
 * Class: XmlUtils
 * 
 * Utility functions related to XML.
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

	var XmlUtils = {
		/**
		 * Constant: ELEMENT_NODE_TYPE
		 * 
		 * Number. The value of the nodeType attribute of a DOM node when 
		 * it is an element
		 */
		ELEMENT_NODE_TYPE: 1,
	
		/**
		 * Constant: NS_PREFIX_PREFIX
		 * 
		 * String. The prefix used when generating new namespace prefixes.
		 */
		NS_PREFIX_PREFIX: "cns-",

		/**
		 * Function: isElement
		 * 
		 * Determines if an object is an XML DOM element node.
		 * 
		 * Parameters:
		 *   o - Object.
		 *   
		 * Returns:
		 *   Boolean. True if the object is an XML DOM element node.
		 */
		isElement: function(o) {
			return (o !== undefined && o !== null 
					&& (typeof o === "object")
					&& ($.isXMLDoc(o))
					&& ("nodeType" in o)
					&& (typeof o.nodeType === "number")
					&& (o.nodeType === XmlUtils.ELEMENT_NODE_TYPE));
		},

		/**
		 * Function: assertElement
		 * 
		 * Raises an exception if an object is not an XML DOM element node.
		 * 
		 * Parameters:
		 *   o - Object.
		 */
		assertElement: function(o) {
			Assert.isTrue(XmlUtils.isElement(o), 
					new TypeError("Not an XML DOM element - " + o));
		},

		/**
		 * Function: createXmlDoc
		 * 
		 * Creates an XML DOM object from an XML string. Raises an exception 
		 * if a parsing error occurs that prevents the XML DOM object from 
		 * being created.
		 * 
		 * Parameters:
		 *   xml - String. XML text.
		 *   
		 * Returns:
		 *   XML DOM.
		 */
		createXmlDoc: function(xml) {
			console.log(xml);
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
		 * Function: getXmlString
		 * 
		 * Returns the textual representation of an XML DOM object.
		 * 
		 * Parameters:
		 *   xmlDom - XML DOM node.
		 *   
		 * Returns:
		 *   String.
		 */
		getXmlString: function(xmlDom) {

			if (!xmlDom)
				return undefined;
			var xml;
			if ("xml" in xmlDom) {
				xml = xmlDom.xml;
			}
			// NOTE: This used to check for "function"
			// but, I changed it to work in Safari. - JRH
			else if (typeof XMLSerializer == "object") {
				xml = (new XMLSerializer()).serializeToString(xmlDom);
			}
			else {
				throw new ReferenceError("Unsupported browser");
			}
			return xml;
		},
		
		/**
		 * Function: getQualifiedName
		 * 
		 * Gets the fully-qualified name of an XML DOM element node.
		 * 
		 * Parameters:
		 *   element - XML DOM element node. Required.
		 *   nsContext - core.util.NamespaceContext. Optional.
		 *   
		 * Returns:
		 *   core.util.QualifiedName.
		 */
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
		 * Function: declareNamespace
		 * 
		 * Declares a namespace prefix on an element. Returns the new prefix.
		 * nsPrefix parameter is optional - will generate a new prefix if 
		 * not provided.
		 * 
		 * Parameters:
		 *   element - XML DOM element node. Required. XML element where 
		 *         namespace will be declared.
		 *   nsUri - String. Required. Namespace URI.
		 *   nsPrefix - String. Optional. Namespace prefix. If null or
		 *         undefined, a new namespace prefix will be generated.
		 *         
		 * Returns:
		 *   String. Namespace prefix.
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
		
		/**
		 * Function: iterateElements
		 * 
		 * Iterates over the nodes in a NodeList that are element nodes.
		 * Ignores nodes that are not elements.
		 * 
		 * Parameters:
		 *   nodeList - NodeList.
		 *   callback - Function or Object. Invoked for each element node. 
		 *         The element node is provided to the callback function 
		 *         as an argument.
		 */
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
		 * Function: getNamespaceURI
		 * 
		 * Get the namespace URI of an XML element.
		 * 
		 * Parameters:
		 *   element - XML DOM element node.
		 *   nsContext - core.util.NamespaceContext. Optional.
		 *   
		 * Returns:
		 *   String. Namespace URI.
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

		/**
		 * Function: findNewNsPrefix
		 * 
		 * Generates a new unique namespace prefix.
		 * 
		 * Parameters:
		 *   element - XML DOM element node. Required.
		 *   nsContext - core.util.NamesapaceContext. Optional.
		 *   
		 * Returns:
		 *   String. Namespace prefix.
		 */
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

		/**
		 * Function: escapeJquerySelectorValue
		 * 
		 * Quotes/escapes special characters within a string to be used as 
		 * a jQuery selector.
		 * 
		 * Parameters:
		 *   str - String. jQuery selector string.
		 *   
		 * Returns:
		 *   String.
		 */
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
		 * Function: getAncestorAttributeValue
		 * 
		 * Gets the value of an ancestor's attribute. Value used will be 
		 * from the nearest ancestor containing the attribute.
		 * 
		 * Parameters:
		 *   element - XML DOM element node.
		 *   attributeName - String.
		 *   
		 * Returns:
		 *   String. Value of ancestor's attribute.
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
		 * Function: getDefaultNamespaceURI
		 * 
		 * Gets the namespace of an element that is used if the element 
		 * doesn't declare its namespace.
		 * 
		 * Parameters:
		 *   element - XML DOM element node.
		 *   
		 * Returns:
		 *   String. Namespace URI.
		 */
		getDefaultNamespaceURI: function(element) {
			// search for an "xmlns" attribute on the closest parent element
			var xmlns = $(element).closest("[xmlns]").attr("xmlns");
			return xmlns ? xmlns : "";
		},

		/**
		 * Function: childDeclaresNsPrefix
		 * 
		 * Determines if a child XML element declares a namespace prefix.
		 * 
		 * Parameters:
		 *   element - XML DOM element node.
		 *   nsPrefix - String.
		 * 
		 * Returns:
		 *   Boolean.
		 */
		childDeclaresNsPrefix: function(element, nsPrefix) {
			return $(element).find("[xmlns\\:" + nsPrefix + "]").length > 0;
		},

		/**
		 * Function: getNamespaceContext
		 * 
		 * Builds the NamespaceContext for an XML element.
		 * 
		 * Parameters:
		 *   element - XML DOM element node.
		 *   searchAncestors - Boolean. Optional. Defaults to true.
		 *         Determines if ancestor node namespace declarations
		 *         are added to the namespace context.
		 *         
		 * Returns:
		 *   core.util.NamespaceContext.
		 */
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
		 * Function: walkParents
		 * 
		 * Invoke a callback for each parent node.
		 * 
		 * Parameters:
		 *   element - XML DOM element node.
		 *   callback - Function or Object. Invoked for each ancestor XML 
		 *         element node. Ancestor element is provided as the 
		 *         argument to the callback function.
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
		}
		
	};
	ns.XmlUtils = XmlUtils;

})(jQuery, window.core.util);
