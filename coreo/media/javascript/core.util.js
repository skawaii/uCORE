/**
 * The core.util namespace
 * 
 * Contains utility functions.
 * 
 * Dependences:
 * 
 *     - jQuery
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	
	/**
	 * ELEMENT_NODE_TYPE
	 * 
	 * The value of the nodeType attribute of a DOM node when it is an element
	 */
	var ELEMENT_NODE_TYPE = 1;
	ns.ELEMENT_NODE_TYPE = ELEMENT_NODE_TYPE;
	
	var invokeCallback = function(callback, args) {
		if (!callback) {
			return;
		}
		var fn = callback;
		var ctx = this;
		var fnParams = args;
		if (typeof fn !== "function") {
			if (typeof fn === "object" && "callback" in fn 
					&& typeof fn.callback === "function") {
				fn = fn.callback;
				if ("context" in callback) {
					ctx = callback.context;
				}
			}
			else {
				throw "Invalid callback - expected to be a function or an " +
						"object with a \"callback\" property that is a function";
			}
		}
		if (!jQuery.isArray(fnParams)) {
			fnParams = [fnParams];
		}
		return fn.apply(ctx, fnParams);
	};
	ns.invokeCallback = invokeCallback;
	
	/**
	 * Invokes a callback for each child node found that is an element node
	 */
	var walkChildElements = function(node, callback) {
		if (node && ("childNodes" in node)) {
			var nodeList = node.childNodes;
			if (nodeList && ("length" in nodeList) && ("item" in nodeList)) {
				for (var i = 0; i < nodeList.length; i++) {
					var child = nodeList.item(i);
					if (child && ("nodeType" in child) && (child.nodeType === ELEMENT_NODE_TYPE)) {
						invokeCallback(callback, child);
					}
				}
			}
		}
	};
	ns.walkChildElements = walkChildElements;
	
	/**
	 * Invokes a callback for each child node found that is an element node and
	 * also matches a set of names
	 */
	var walkChildElementsByName = function(node, names, callback) {
		var namesArr = asArray(names);
		walkChildElements(node, function(element) {
			if ($.inArray(element.tagName, namesArr) > -1) {
				invokeCallback(callback, element);
			}
		});
	};
	ns.walkChildElementsByName = walkChildElementsByName;
	
	/**
	 * Returns the textual representation of an XML DOM object
	 */
	var getXmlString = function(xmlDom) {
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
	};
	ns.getXmlString = getXmlString;
	
	/**
	 * Creates an XML document object from an XML string
	 */
	var createXmlDoc = function(xmlString) {
		var xmlDoc = jQuery.parseXML(xmlString);
		if (!xmlDoc || !jQuery.isXMLDoc(xmlDoc)
				|| !"documentElement" in xmlDoc
				|| "parsererror" === xmlDoc.documentElement.tagName
				|| $("html > body:first-child > parsererror:first-child", xmlDoc).length > 0) {
			throw "string does not contain well-formed XML";
		}
		/*
		if (window.DOMParser) {
			var parser = new DOMParser();
			xmlDoc = parser.parseFromString(xmlString, "text/xml");
		}
		else {
			// IE
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = "false";
			xmlDoc.loadXML(xmlString);
		}
		*/
		return xmlDoc;
	};
	ns.createXmlDoc = createXmlDoc;

	/**
	 * Invoke a callback for each parent node
	 */
	var walkParents = function(element, callback) {
		var keepGoing = true;
		while (keepGoing && "parentNode" in element && !("documentElement" in element)) {
			element = element.parentNode;
			if (!("documentElement" in element)) {
				keepGoing = invokeCallback(callback, element);
			}
		}
	};
	ns.walkParents = walkParents;
	
	/**
	 * Gets the value of an ancestor's attribute. Value used will be from the 
	 * nearest ancestor containing the attribute.
	 */
	var getAncestorAttributeValue = function(element, attributeName) {
		var value = undefined;
		walkParents(element, function(parent) {
			if (parent.hasAttribute(attributeName)) {
				value = parent.getAttribute(attributeName);
				return false;
			}
			return true;
		});
		return value;
	};
	ns.getAncestorAttributeValue = getAncestorAttributeValue;
	
	/**
	 * Gets the namespace of an element that is used if the element doesn't 
	 * declare its namespace
	 */
	var getDefaultNamespaceURI = function(element) {
		// search for an "xmlns" attribute on the closest parent element
		var ns = getAncestorAttributeValue(element, "xmlns");
		return ns !== undefined ? ns : "";
	};
	ns.getDefaultNamespaceURI = getDefaultNamespaceURI;
	
	/**
	 * Get the namespace of an XML element
	 */
	var getNamespaceURI = function(element, defaultNs) {
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
			var ns = getAncestorAttributeValue(element, "xmlns:" + nsPrefix);
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
				defaultNs = getDefaultNamespaceURI(element);
			}
			return jQuery.trim(defaultNs);
		}
	};
	ns.getNamespaceURI = getNamespaceURI;
	
	var QualifiedName = function(nsPrefix, nsUri, localName) {
		this.nsPrefix = nsPrefix;
		this.nsUri = nsUri;
		this.localName = localName;
	};
	ns.QualifiedName = QualifiedName;
	
	var getQualifiedName = function(element) {
		var fullname = element.tagName;
		var parts = fullname.split(":");
		if (parts.length < 1 || parts.length > 2) {
			throw "Illegal element name - " + fullname;
		}
		var nsUri = getNamespaceURI(element);
		return parts.length == 2 
				? new QualifiedName(parts[0], nsUri, parts[1])
				: new QualifiedName(null, nsUri, parts[0]);
	};
	ns.getQualifiedName = getQualifiedName;
	
	/**
	 * Creates a new unique DOM element ID
	 */
	var generateId = function() {
		var prefix = "core-";
		var id = null;
		do {
			id = prefix + ++idSeed;
		} while ($("#" + id).length > 0);
		return id;
	};
	ns.generatedId = generateId;
	
	/**
	 * Creates an array with no null elements from the parameter
	 */
	var asArray = function(obj) {
		var arr = [];
		if (jQuery.isArray(obj)) {
			for (var i = 0; i < obj.length; i++) {
				if (obj[i]) {
					arr.push(obj[i]);
				}
			}
		}
		else if (obj) {
			arr.push(obj);
		}
		return arr;
	};
	ns.asArray = asArray;
	
	/**
	 * Generates a string describing the properties of an object
	 */
	var describe = function(obj, includeFunctions) {
		var str = "";
		for (var p in obj) {
			var t = typeof obj[p];
			if (t !== "function" || includeFunctions === true) {
				str += t + " " + p;
				if (t !== "function") {
					str += " = " + obj[p];
				}
				str += "\n";
			}
		}
		return str;
	};
	ns.describe = describe;
	
	var isOrContains = function(container, contained) {
		return jQuery.contains(container, contained.get(0))
			|| (container && contained && $(container).get(0) == $(contained).get(0));
	};
	ns.isOrContains = isOrContains;
	
})(jQuery, window.core.util);