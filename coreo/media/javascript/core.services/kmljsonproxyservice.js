/**
 * Class: KmlJsonProxyService
 * 
 * Dependencies:
 *   - jQuery
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
	
	var KmlJsonProxyService = function(endpoint) {
		this.endpoint = endpoint;
	};
	KmlJsonProxyService.prototype = {
		endpoint: null,
		
		getKmlJson: function(kmlUrl, callback) {
			$.ajax(this.endpoint + "?" + kmlUrl, {
				dataType: "json",
				success: function(data, textStatus, jqXHR) {
					CallbackUtils.invokeCallback(callback, data, "success");
				},
				error: function(jqXHR, textStatus, errorThrown) {
					CallbackUtils.invokeOptionalCallback(callback, "error", 
						"Couldn't retrieve KML. " + jqXHR.responseText);
				}
			});
		}
	};
	ns.KmlJsonProxyService = KmlJsonProxyService;
})(jQuery, window.core.services);