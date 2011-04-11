/**
 * Class: KmlUtils
 * 
 * Utility functions related to KML.
 * 
 * Namespace:
 *  core.util
 * 
 * Dependencies:
 *  - jQuery
 *  - core.util.XmlUtils
 *  - core.util.CallbackUtils
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	var XmlUtils = core.util.XmlUtils;
	if (!XmlUtils)
		throw "Dependency not found: core.util.XmlUtils";
	var CallbackUtils = core.util.CallbackUtils;
	if (!CallbackUtils)
		throw "Dependency not found: core.util.CallbackUtils";
	
	var KmlUtils = {
		/**
		 * Constant: KML_NS
		 * 
		 * Array. All KML namespace URIs defined in KML schemas.
		 */
		KML_NS: ["http://www.opengis.net/kml/2.2", "http://www.opengis.net/kml/2.2/", 
			     "http://earth.google.com/kml/2.1", "http://earth.google.com/kml/2.1/"],

		/**
		 * Constant: KML_FEATURE_ELEMENTS
		 * 
		 * Array. Tag names of elements defined in the KML schema for features.
		 */
		KML_FEATURE_ELEMENTS: "NetworkLink Placemark PhotoOverlay ScreenOverlay GroundOverlay Folder Document".split(" "),

		/**
		 * Function: isKmlElement
		 * 
		 * Determins if an XML DOM node is a KML feature element.
		 * 
		 * Parameters:
		 *   node - XML DOM node.
		 *   
		 * Returns:
		 *   true if "node" is an element node with a tag name contained 
		 *   in KML_FEATURE_ELEMENTS and a namespace contained in KML_NS.
		 */
		isKmlElement: function(node) {
			if (XmlUtils.isElement(node)) {
				var qname = XmlUtils.getQualifiedName(node);
				return ($.inArray(qname.localName, KmlUtils.KML_FEATURE_ELEMENTS) >= 0)
						&& ($.inArray(qname.nsUri, KmlUtils.KML_NS) >= 0);
			}
			return false;
		},

		/**
		 * Function: findNextKmlElementParent
		 * 
		 * Identifies the closest ancestor that is a KML feature element.
		 * 
		 * Parameters:
		 *   node - XML DOM node. Child element of starting point for search.
		 *   
		 * Returns:
		 *   XML DOM element. Closest ancestor that is a KML feature element, 
		 *   or null if none found.
		 */
		findNextKmlElementParent: function(node) {
			node = $(node);
			while (node.length > 0) {
				node = node.parent();
				if (node.length > 0 && KmlUtils.isKmlElement(node[0])) {
					return node[0];
				}
			}
			return null;
		},

		hasChildKmlElements: function(element) {
			var children = $(element).find(KmlUtils.KML_FEATURE_ELEMENTS.join(","));
			return children.length > 0;
		},

		/**
		 * Function: iterateChildKmlElements
		 * 
		 * Iterates children of an XML element node that are KML 
		 * features.
		 * 
		 * Parameters:
		 *   element - XML DOM element node. Parent node.
		 *   callback - Function or Object. Callback to invoke with each 
		 *         child KML feature element. Function will be invoked 
		 *         with one parameter - the child XML DOM element.
		 */
		iterateChildKmlElements: function(element, callback) {
			XmlUtils.assertElement(element);
			// don't retrieve all children with jQuery.children() - might 
			// return more elements than can fit in memory
			element = $(element).children(":first-child");
			while (element.length > 0) {
				if (KmlUtils.isKmlElement(element[0])
						&& CallbackUtils.invokeCallback(callback, element[0]) === false) {
					break;
				}
				element = element.next();
			}
		},
		
		getKmlNsPrefixInUse: function(element) {
			var nsContext = XmlUtils.getNamespaceContext(element);
			for (var i = 0; i < KmlUtils.KML_NS.length; i++) {
				if (KmlUtils.KML_NS[i] === nsContext.getDefault()) {
					return "";
				}
				var prefix = nsContext.getPrefix(KmlUtils.KML_NS[i]);
				if (prefix !== undefined) {
					return prefix;
				}
			}
			return undefined;
		}
		
	};
	ns.KmlUtils = KmlUtils;
})(jQuery, window.core.util);