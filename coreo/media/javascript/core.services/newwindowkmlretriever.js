/**
 * Class: NewWindowKmlRetriever
 * 
 * Retrieves KML by opening a new browser window, navigating to the KML URL, 
 * and scraping the contents of the page.
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   - jQuery
 *   - core.services.KmlRetriever
 *   - core.util.CallbackUtils
 */
if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function($, ns) {
	var CallbackUtils = core.util.CallbackUtils;
	var KmlRetriever = core.services.KmlRetriever;

	var kmlWindow = ;
	
	/**
	 * Constructor: NewWindowKmlRetriever
	 * 
	 * Initializes the object.
	 */
	var NewWindowKmlRetriever = function() {
		
	};
	$.extend(NewWindowKmlRetriever.prototype, KmlRetriever.prototype, {
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
	ns.NewWindowKmlRetriever = NewWindowKmlRetriever;
})(jQuery, window.core.services);