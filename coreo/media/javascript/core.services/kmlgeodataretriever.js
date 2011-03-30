/**
 * Class: KmlGeoDataRetriever
 * 
 * SuperClass: <GeoDataRetriever>
 * 
 * Assumes that all URLs return KML. Creates <KmlNodeGeoData> objects from the 
 * returned KML.
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   - jQuery
 *   - core.services.GeoDataRetriever
 *   - core.util.CallbackUtils
 *   - core.geo.KmlNodeGeoData
 */

if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function($, ns) {
	var GeoDataRetriever = core.services.GeoDataRetriever;
	if (!GeoDataRetriever)
		throw "Dependency not found: core.services.GeoDataRetriever";
	var CallbackUtils = core.util.CallbackUtils;
	if (!CallbackUtils)
		throw "Dependency not found: core.util.CallbackUtils";
	var KmlNodeGeoData = core.geo.KmlNodeGeoData;
	if (!KmlNodeGeoData)
		throw "Dependency not found: core.geo.KmlNodeGeoData";

	/**
	 * Constructor: KmlGeoDataRetriever
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   kmlRetriever - <KmlRetriever>. Required. Object used to retrieve KML.
	 */
	var KmlGeoDataRetriever = function(kmlRetriever) {
		this.kmlRetriever = kmlRetriever;
	};
	$.extend(KmlGeoDataRetriever.prototype, GeoDataRetriever.prototype, {
		/**
		 * Property: kmlRetriever
		 * 
		 * <KmlRetriever>.
		 */
		kmlRetriever: null,

		/**
		 * Function: fetch
		 * 
		 * See Also:
		 * <GeoDataRetriever.fetch>
		 */
		fetch: function(url, callback) {
			var localCb = {
				success: function(kml) {
					var geodata = KmlNodeGeoData.fromKmlString(kml, url);
					CallbackUtils.invokeCallback(callback, geodata, "success");
				},
				error: function(errorThrown) {
					CallbackUtils.invokeOptionalCallback(callback, "error", errorThrown);
				}
			};
			this.kmlRetriever.fetch(url, localCb);
		}
	});
	ns.KmlGeoDataRetriever = KmlGeoDataRetriever;
})(jQuery, window.core.services);