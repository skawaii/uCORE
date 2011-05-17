/**
 * Class: GeoDataRetriever
 * 
 * Fetches a GeoData object from a URL.
 * This is an interface, providing a contract for subclasses to implement. 
 * This class does not contain any implementation.
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   None
 */

if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function(ns) {
	/**
	 * Constructor: GeoDataRetriever
	 * 
	 * Initializes the object.
	 */
	var GeoDataRetriever = function() {};
	GeoDataRetriever.prototype = {
		/**
		 * Function: fetch
		 * 
		 * Parameters:
		 *   url - String. Required. Endpoint where GeoData exists. URL may 
		 *         contain request parameters.
		 * 
		 * Returns:
		 *   jQuery Deferred. Invoked with the GeoData instance upon 
		 *   successful retrieval.
		 */
		fetch: function(url) {
			throw "Not implemented";
		}
	};
	ns.GeoDataRetriever = GeoDataRetriever;
})(window.core.services);