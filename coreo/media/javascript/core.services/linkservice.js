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
	 *         getByIdEndpoint: String. URL to retrieve a link object by its ID.
	 *         getByUrlEndpoint: String. URL to query links by their URL.
	 *         createEndpoint: String. URL to create links.
	 *         deleteEndpoint: String. URL to delete links.
	 */
	var LinkService = function(cfg) {
		var getByIdEndpoint;
		getByIdEndpoint = $.trim(cfg.getByIdEndpoint);
		if (getByIdEndpoint && getByIdEndpoint.length > 0
				&& getByIdEndpoint.charAt(getByIdEndpoint.length - 1) !== '/')
			getByIdEndpoint = getByIdEndpoint + '/'
		return {
			/**
			 * Function: deleteLink
			 * 
			 * Deletes a Link by its ID.
			 * 
			 * Parameters:
			 *   id - String. ID of the link to delete.
			 *   
			 * Returns:
			 *   jQuery Deferred. Success callback is invoked with no 
			 *   parameters if link is deleted. Failure callback is invoked
			 *   with an error string parameter if the link could not be 
			 *   deleted. 
			 */
			deleteLink: function(id) {
				var deferred = $.Deferred();
				$.ajax(cfg.deleteEndpoint, {
					type: "POST",
					data: {
						"id": id
					},
					success: function(content, textStatus, jqXHR) {
						deferred.resolve();
					},
					error: function(jqXHR, textStatus, errorThrown) {
						deferred.reject(jqXHR.responseText);
					}
				});
				return deferred.promise();
			},
			
			/**
			 * Function: create
			 * 
			 * Creates a Link.
			 * 
			 * Parameters:
			 *   link - Object. Contains the following properties:
			 *         name - String. Name of the new link.
			 *         desc - String. Description of the new link.
			 *         url - String. URL of the new link.
			 *         tags - Array of String. Names of tags to assign to the new link.
			 *         firstname - String. First name of the POC of the new link.
			 *         lastname - String. Last name of the POC of the new link.
			 *         email - String. Email of the POC of the new link.
			 *         phone - String. Phone number of the POC of the new link.
			 * 
			 * Returns:
			 *   jQuery Deferred. Success callback is invoked with the new 
			 *   Link JSON. Failure callback is invoked with an error 
			 *   string.
			 */
			create: function(link) {
				var deferred = $.Deferred(), tags = [], i, tag;
				if (link && typeof link === "object") {
					if (link.tags) {
						if ($.isArray(link.tags)) {
							for (i = 0; i < link.tags.length; i++) {
								tag = $.trim(link.tags[i]);
								if (tag && tag.length > 0) {
									tags.push(tag);
								}
							}
						}
						else {
							tags.push("" + $.trim(link.tags));
						}
					}
					$.ajax(cfg.createEndpoint, {
						type: "POST",
						data: {
							name: $.trim(link.name),
							desc: $.trim(link.desc),
							url: $.trim(link.url),
							"tags": tags.join(','),
							firstname: $.trim(link.firstname),
							lastname: $.trim(link.lastname),
							email: $.trim(link.email),
							phone: $.trim(link.phone)
						},
						dataType: "json",
						success: function(newLink, textStatus, jqXHR) {
							deferred.resolve(newLink);
						},
						error: function(jqXHR, textStatus, errorThrown) {
							deferred.reject(jqXHR.responseText);
						}
					});
				}
				else {
					deferred.reject("Invalid link: " + link);
				}
				return deferred.promise();
			},
			
			/**
			 * Function: getByUrl
			 * 
			 * Queries Links by URL (wildcard supported). May return multiple 
			 * Links.
			 * 
			 * Parameters:
			 *   url - String. Link URL pattern.
			 * 
			 * Returns:
			 *   jQuery Deferred. Success callback is invoked with an array of 
			 *   JSON Links. Failure callback is invoked with an error string.
			 */
			getByUrl: function(url) {
				var deferred = $.Deferred();
				$.ajax(cfg.getByUrlEndpoint, {
					type: "GET",
					data: { "url": url },
					dataType: "json",
					success: function(links, textStatus, jqXHR) {
						deferred.resolve(links);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						deferred.reject(jqXHR.responseText);
					}
				});
				return deferred.promise();
			},
			
			/**
			 * Function: getById
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
			getById: function(id) {
				var deferred = $.Deferred();
				$.ajax(getByIdEndpoint + id + '/', {
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