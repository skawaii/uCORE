/**
 * Class: KmlFeatureType
 * 
 * Constants defining all possible types of KML features.
 * 
 * Namespace:
 *   core.geo
 *   
 * Dependencies:
 *   None
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function(ns) {
	var KmlFeatureType = {
		/**
		 * Constant: NETWORK_LINK
		 * 
		 * String. NetworkLink KML element.
		 */
		NETWORK_LINK: "NetworkLink",
		
		/**
		 * Constant: PLACEMARK
		 * 
		 * String. Placemark KML element.
		 */
		PLACEMARK: "Placemark",
		
		/**
		 * Constant: PHOTO_OVERLAY
		 * 
		 * String. PhotoOverlay KML element.
		 */
		PHOTO_OVERLAY: "PhotoOverlay",
		
		/**
		 * Constant: SCREEN_OVERLAY
		 * 
		 * String. ScreenOverlay KML element.
		 */
		SCREEN_OVERLAY: "ScreenOverlay",
		
		/**
		 * Constant: GROUND_OVERLAY
		 * 
		 * String. GroundOverlay KML element.
		 */
		GROUND_OVERLAY: "GroundOverlay",
		
		/**
		 * Constant: FOLDER
		 * 
		 * String. Folder KML element.
		 */
		FOLDER: "Folder",
		
		/**
		 * Constant: DOCUMENT
		 * 
		 * String. Document KML element.
		 */
		DOCUMENT: "Document"
	};
	ns.KmlFeatureType = KmlFeatureType;
})(window.core.geo);