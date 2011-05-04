/**
 * Class: LinkService
 * 
 * Client to CORE Link related services.
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   - jQuery
 */

if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function($, ns) {
	/**
	 * Constructor: LinkService
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   cfg - Object. Contains the following properties:
	 *         getLinkEndpoint: String. URL to retrieve a link object by its ID.
	 */
	var LinkService = function(cfg) {
		var getLinkEndpoint;
		getLinkEndpoint = $.trim(cfg.getLinkEndpoint);
		if (getLinkEndpoint && getLinkEndpoint.length > 0
				&& getLinkEndpoint.charAt(getLinkEndpoint.length - 1) !== '/')
			getLinkEndpoint = getLinkEndpoint + '/'
		return {
			/**
			 * Function: getLinkById
			 * 
			 * Retrieves a link by its ID.
			 * 
			 * Parameters:
			 *   id - String. Link's ID.
			 * 
			 * Returns:
			 *   jQuery Deferred. If link is found, success callback is invoked 
			 *   with the link object. If an error occurs or the link isn't found, 
			 *   the error callback is invoked with the error string.
			 */
			getLinkById: function(id) {
				var deferred = $.Deferred();
				$.ajax(cfg.createLibraryEndpoint, {
					type: "GET",
					dataType: "json",
					success: function(link, textStatus, jqXHR) {
						deferred.resolve(link);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						deferred.reject(jqXHR.responseText);
					}
				});
				return deferred.promise();
			}
		};
	};
	ns.LinkService = LinkService;
})(jQuery, window.core.services);