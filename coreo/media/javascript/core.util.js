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
	 * Returns the textual representation of an XML DOM object
	 */
	var getXmlString = function(xmlDom) {
		if (!xmlDom)
			return undefined;
		var xml;
		if (xmlDom.xml) {
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
		var xmlDoc;
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
		return xmlDoc;
	};
	ns.createXmlDoc = createXmlDoc;
	
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
	 * Creates an array from the parameter
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