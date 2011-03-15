/**
 * Class: KmlRetriever
 * 
 * Fetches KML. Handles cross-domain requests.
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
	 * Constructor: KmlRetriever
	 * 
	 * Initializes the object.
	 */
	var KmlRetriever = function() {};
	KmlRetriever.prototype = {
		/**
		 * Function: fetch
		 * 
		 * Retrieves a KML file from a URL.
		 * 
		 * Parameters:
		 *   url - String. Required. URL of KML.
		 *   callback - Function or Object. Required. Invoked upon KML 
		 *         retrieval. If a function, invoked only when successful.
		 *         If an object, its "success" function is invoked with 
		 *         one parameter - the KML string. Its "error" function
		 *         will be invoked in the event an error occurs, with 
		 *         one parameter - an error string.
		 */
		fetch: function(url, callback) {
			throw "Not implemented";
		}
	};
	ns.KmlRetriever = KmlRetriever;
})(window.core.services);