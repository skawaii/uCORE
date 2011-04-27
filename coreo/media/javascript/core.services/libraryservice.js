/**
 * Class: LibraryService
 * 
 * Creates CORE LinkLibrary objects.
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
	 * Constructor: LibraryService
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   cfg - Object. Contains properties:
	 *         - createLibraryEndpoint: String. URL to create-library view.
	 */
	var LibraryService = function(cfg) {
		return {
			/**
			 * Function: createLibrary
			 * 
			 * Creates a LinkLibrary.
			 * 
			 * Parameters:
			 *   name - String. Name of the new library.
			 *   description - String. Description of the new library.
			 *   links - Array of String. IDs of links that the library will contain.
			 *   tags - Array of String. Names of tags.
			 *   
			 * Returns:
			 *   jQuery Deferred. The Deferred object's resolve callback will be 
			 *   invoked with a LinkLibrary object. The fail callback will be 
			 *   invoked with an error string.
			 */
			createLibrary: function(name, description, links, tags) {
				var deferred, data;
				deferred = new $.Deferred();
				data = {
					"name": name,
					"desc": description,
					"tags": tags,
					"links": links
				};
				$.ajax(cfg.createLibraryEndpoint, {
					type: "POST",
					"data": data,
					traditional: true,
					dataType: "json",
					success: function(linkLibrary, textStatus, jqXHR) {
						deferred.resolve(linkLibrary);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						deferred.reject(errorThrown);
					}
				});
				return deferred.promise();
			}
		};
	};
	ns.LibraryService = LibraryService;
})(jQuery, window.core.services);