/**
 * Class: KmlUtils
 * 
 * Utility functions related to KML.
 * 
 * Namespace:
 *  core.util
 * 
 * Properties:
 *  - KML_NS - (array) All namespace URI's defined in KML schemas
 *  - KML_FEATURE_ELEMENTS - (array) Tag names (local names) of elements 
 *        defined in the KML schema
 *        
 * Functions:
 *  - isKmlElement
 *  - findNextKmlElementParent
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
	var CallbackUtils = core.util.CallbackUtils;

	var KmlUtils = {
		KML_NS: ["http://www.opengis.net/kml/2.2", "http://www.opengis.net/kml/2.2/", 
			     "http://earth.google.com/kml/2.1", "http://earth.google.com/kml/2.1/"],

		KML_FEATURE_ELEMENTS: "kml NetworkLink Placemark PhotoOverlay ScreenOverlay GroundOverlay Folder Document".split(" "),

		isKmlElement: function(node) {
			if (XmlUtils.isElement(node)) {
				var qname = XmlUtils.getQualifiedName(node);
				return ($.inArray(qname.localName, KmlUtils.KML_FEATURE_ELEMENTS) >= 0)
						&& ($.inArray(qname.nsUri, KmlUtils.KML_NS) >= 0);
			}
			return false;
		},

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

		iterateChildKmlElements: function(element, callback) {
			XmlUtils.assertElement(element);
			// don't retrieve all children with jQuery.children() - might 
			// return more elements than can fit in memory
			element = $(element.firstChild);
			while (element.length > 0) {
				if (KmlUtils.isKmlElement(element[0])
						&& CallbackUtils.invokeCallback(callback, element[0]) === false) {
					break;
				}
				element = element.next();
			}
		}
	};
	ns.KmlUtils = KmlUtils;
})(jQuery, window.core.util);