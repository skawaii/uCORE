/**
 * Class: LibraryService
 * 
 * Creates CORE LinkLibrary objects.
 * 
 * Usage:
 *   (start code)
 *   var libraryService = new core.services.LibraryService({
 *       createLibraryEndpoint: "/create-library/"
 *   });
 *   
 *   libraryService.createLibrary("new library", "just a test", [], ["foo", "bar"])
 *         .then(function(newLibrary) {
 *                   // library was created successfully
 *                   // newLibrary is the new LinkLibrary
 *               },
 *               function(errorThrown) {
 *                   // library creation failed
 *                   alert("Error creating LinkLibrary: " + errorThrown);
 *               });
 *   (end code)
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
				$.ajax(cfg.createLibraryEndpoint, {
					type: "POST",
					data: {
						"name": name,
						"desc": description,
						"tags": tags ? tags.join(',') : "",
						"links": links ? links.join(',') : ""
					},
					dataType: "json",
					success: function(linkLibrary, textStatus, jqXHR) {
						deferred.resolve(linkLibrary);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						deferred.reject(jqXHR.responseText);
					}
				});
				return deferred.promise();
			}
		};
	};
	ns.LibraryService = LibraryService;
})(jQuery, window.core.services);