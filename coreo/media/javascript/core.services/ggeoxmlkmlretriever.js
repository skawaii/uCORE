/**
 * Class: GGeoXmlKmlRetriever
 * 
 * Retrieves KML by using the GGeoXml Google API class.
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   - jQuery
 *   - core.services.KmlRetriever
 *   - core.util.CallbackUtils
 *   - Google Maps GGeoXml class
 */
if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function($, ns) {
	var CallbackUtils = core.util.CallbackUtils;
	var KmlRetriever = core.services.KmlRetriever;

	/**
	 * Constructor: GGeoXmlKmlRetriever
	 * 
	 * Initializes the object.
	 */
	var GGeoXmlKmlRetriever = function() {};
	$.extend(GGeoXmlKmlRetriever.prototype, KmlRetriever.prototype, {
		/**
		 * Function: fetch
		 * 
		 * See Also:
		 *   <KmlRetriever.fetch>
		 */
		fetch: function(url, callback) {
			var geoxml = new google.maps.GeoXml(url);
			geoxml.getKml(function(kml) {
				if (kml) {
					CallbackUtils.invokeCallback(callback, kml, "success");
				}
				else {
					CallbackUtils.invokeOptionalCallback(callback, "error", 
							"Couldn't retrieve KML");
				}
			});
		}
	});
	ns.GGeoXmlKmlRetriever = GGeoXmlKmlRetriever;
})(jQuery, window.core.services);