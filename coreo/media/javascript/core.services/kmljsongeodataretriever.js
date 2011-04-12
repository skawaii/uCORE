/**
 * Class: KmlJsonGeoDataRetriever
 * 
 * SuperClass: <GeoDataRetriever>
 * 
 * Retrieves KML JSON from the CORE KML proxy service and constructs 
 * KmlJsonGeoData objects.
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   - jQuery,
 *   - core.services.GeoDataRetriever
 *   - core.util.CallbackUtils
 *   - core.geo.KmlJsonGeoData
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
	var KmlJsonGeoData = core.geo.KmlJsonGeoData;
	if (!KmlJsonGeoData)
		throw "Dependency not found: core.geo.KmlJsonGeoData";

	/**
	 * Constructor: KmlJsonGeoDataRetriever
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   kmlRetriever - <KmlRetriever>. Required. Object used to retrieve KML.
	 */
	var KmlJsonGeoDataRetriever = function(kmlJsonProxyService) {
		this.kmlJsonProxyService = kmlJsonProxyService;
	};
	$.extend(KmlJsonGeoDataRetriever.prototype, GeoDataRetriever.prototype, {
		/**
		 * Property: kmlJsonProxyService
		 * 
		 * <KmlJsonProxyService>.
		 */
		kmlJsonProxyService: null,

		/**
		 * Function: fetch
		 * 
		 * See Also:
		 * <GeoDataRetriever.fetch>
		 */
		fetch: function(url, callback) {
			var localCb = {
				success: function(kmlRoot) {
					if (kmlRoot && "children" in kmlRoot) {
						if (kmlRoot.children.length > 0) {
							if (kmlRoot.children.length == 1) {
								var firstChild = kmlRoot.children[0];
								var geodata = KmlJsonGeoData.fromKmlJson(firstChild, kmlRoot);
								CallbackUtils.invokeCallback(callback, geodata, "success");
							}
							else {
								CallbackUtils.invokeOptionalCallback(callback, 
										"error", "Too many root-level KML "
										+ "features in KML retrieved from " 
										+ url + ". Expected only one, found " 
										+ kmlRoot.children.length + ".");
							}
						}
					}
					else {
						CallbackUtils.invokeCallback(callback, null, "success");
					}
				},
				error: function(errorThrown) {
					CallbackUtils.invokeOptionalCallback(callback, "error", errorThrown);
				}
			};
			this.kmlJsonProxyService.getKmlJson(url, localCb);
		}
	});
	ns.KmlJsonGeoDataRetriever = KmlJsonGeoDataRetriever;
})(jQuery, window.core.services);