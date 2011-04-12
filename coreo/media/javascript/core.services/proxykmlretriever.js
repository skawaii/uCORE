/**
 * Class: ProxyKmlRetriever
 * 
 * Retrieves KML by using the CORE server application's proxy service.
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
	if (!CallbackUtils)
		throw "Dependency not found: core.util.CallbackUtils";
	var KmlRetriever = core.services.KmlRetriever;
	if (!KmlRetriever)
		throw "Dependency not found: core.services.KmlRetriever";

	/**
	 * Constructor: ProxyKmlRetriever
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   endpoint - String. Required. Endpoint for the CORE kmlproxy service.
	 */
	var ProxyKmlRetriever = function(endpoint) {
		this.endpoint = endpoint;
	};
	$.extend(ProxyKmlRetriever.prototype, KmlRetriever.prototype, {
		/**
		 * Property: endpoint
		 * 
		 * String. URL for the CORE kmlproxy service.
		 */
		endpoint: null,
		
		/**
		 * Function: fetch
		 * 
		 * See Also:
		 *   <KmlRetriever.fetch>
		 */
		fetch: function(url, callback) {
			$.ajax(this.endpoint + "?" + url, {
				success: function(data, textStatus, jqXHR) {
					CallbackUtils.invokeCallback(callback, data, "success");
				},
				error: function(jqXHR, textStatus, errorThrown) {
					CallbackUtils.invokeOptionalCallback(callback, "error", 
						"Couldn't retrieve KML: " + errorThrown);
				}
			});
		}
	});
	ns.ProxyKmlRetriever = ProxyKmlRetriever;
})(jQuery, window.core.services);