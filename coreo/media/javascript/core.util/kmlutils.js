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
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	var XMLUTILS = core.util.XmlUtils;
	
	var KmlUtils = {
		KML_NS: ["http://www.opengis.net/kml/2.2", "http://www.opengis.net/kml/2.2/", 
			     "http://earth.google.com/kml/2.1", "http://earth.google.com/kml/2.1/",
			     ""],
		
		KML_FEATURE_ELEMENTS: "kml NetworkLink Placemark PhotoOverlay ScreenOverlay GroundOverlay Folder Document".split(" "),
	
		isKmlElement: function(node) {
				return (node && ("nodeType" in node) 
						&& (node.nodeType === XMLUTILS.ELEMENT_NODE_TYPE)
						&& ("tagName" in node) 
						&& ($.inArray(node.tagName, KmlUtils.KML_FEATURE_ELEMENTS) > -1));
			},
		
		findNextKmlElementParent: function(node) {
				var ancestors = $(node).parent().closest(KmlUtils.KML_FEATURE_ELEMENTS.join(","));
				if (ancestors !== undefined 
						&& ancestors !== null 
						&& "length" in ancestors 
						&& ancestors.length > 0 
						&& "get" in ancestors 
						&& typeof ancestors.get === "function") {
					return ancestors.get(0);
				}
				return null;
			}
	};
	ns.KmlUtils = KmlUtils;
})(jQuery, window.core.util);