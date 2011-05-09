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
	 *         - getByIdEndpoint: String. URL to retrieve a LinkLibrary by its ID.
	 *         - createLibraryEndpoint: String. URL to create-library view.
	 *         - deleteEndpoint: String. URL to delete libraries.
	 *         - updateEndpoint: String. URL to update libraries.
	 */
	var LibraryService = function(cfg) {
		var _this = {
			/**
			 * Function: getById
			 * 
			 * Retrieves a LinkLibrary by its ID.
			 * 
			 * Parameters:
			 *   id - String. ID of the LinkLibrary to retrieve.
			 * 
			 * Returns:
			 *   jQuery Deferred. Success callback is invoked with LinkLibrary 
			 *   object. Failure callback is invoked with an error string.
			 */
			getById: function(id) {
				var deferred = $.Deferred(), endpoint;
				endpoint = cfg.getByIdEndpoint;
				$.ajax(cfg.getByIdEndpoint 
						+ (cfg.getByIdEndpoint.charAt(cfg.getByIdEndpoint.length-1) != '/' ? '/' : '')
						+ id, {
							type: "GET",
							dataType: "json",
							success: function(linkLibrary, textStatus, jqXHR) {
								deferred.resolve(linkLibrary);
							},
							error: function(jqXHR, textStatus, error) {
								deferred.reject(error);
							}
						});
				return deferred.promise();
			},

			/**
			 * Function: deleteLibrary
			 * 
			 * Deletes a LinkLibrary using its ID.
			 * 
			 * Parameters:
			 *   id - String. ID of the LinkLibrary to delete.
			 *   
			 * Returns:
			 *   jQuery Deferred. Success callback is invoked with no 
			 *   parameters. Failure callback is invoked with an error 
			 *   string.
			 */
			deleteLibrary: function(id) {
				var deferred = $.Deferred();
				$.ajax(cfg.deleteEndpoint, {
					type: "POST",
					data: { "library_id": id },
					success: function(content, textStatus, jqXHR) {
						deferred.resolve();
					},
					error: function(jqXHR, textStatus, error) {
						deferred.reject(jqXHR.responseText);
					}
				});
				return deferred.promise();
			},
			
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
						console.log(linkLibrary);
						deferred.resolve(linkLibrary);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						deferred.reject(jqXHR.responseText);
					}
				});
				return deferred.promise();
			},
			
			/**
			 * Function: update
			 * 
			 * Updates a LinkLibrary.
			 * 
			 * Parameters:
			 *   library - Object. Contains the following properties:
			 *         id - String. LinkLibrary ID to update.
			 *         name - String.
			 *         description - String.
			 *         links - Array of String. IDs of links that the library will contain.
			 *         tags - Array of String. Names of tags.
			 *         
			 *  Returns:
			 *    jQuery Deferred. Success callback is invoked with the 
			 *    updated LinkLibrary object. Failure callback is invoked 
			 *    with an error string.
			 */
			update: function(library) {
				var deferred = $.Deferred();
				$.ajax(cfg.updateEndpoint, {
					type: "POST",
					data: {
						"id": library.id,
						"name": library.name,
						"desc": library.description,
						"tags": library.tags ? library.tags.join(',') : "",
						"links": library.links ? library.links.join(',') : ""
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
			},
			
			retrieveAndUpdate: function(libraryId, updateFn) {
				var deferred = $.Deferred();
				_this.getById(libraryId)
					.then(function(linkLibrary) {
							var i, linkIds = [], updates;
							for (i = 0; linkLibrary.fields.links && i < linkLibrary.fields.links.length; i++) {
								linkIds.push(linkLibrary.fields.links[i].pk);
							}
							updates = {
								id: linkLibrary.pk,
								name: linkLibrary.fields.name,
								description: linkLibrary.fields.desc,
								tags: linkLibrary.fields.tags,
								links: linkIds
							};
							updates = updateFn.call(updateFn, updates);
							_this.update(updates)
								.then(function(updatedLibrary) {
										deferred.resolve(updatedLibrary);
									},
									function(error) {
										deferred.reject("Error updating LinkLibrary: " 
												+ error);
									});
						},
						function(error) {
							deferred.reject("Couldn't retrieve LinkLibrary " 
									+ libraryId + ": " + error);
						});
				return deferred.promise();
			},
			
			/**
			 * Function: addLink
			 * 
			 * Adds a link to a library.
			 * 
			 * Parameters:
			 *   libraryId - String. LinkLibrary ID.
			 *   linkId - String. Link ID.
			 *   index - Integer. Position where link will be inserted.
			 * 
			 * Returns:
			 *   jQuery Deferred. Success callback is invoked with the new 
			 *   LinkLibrary. Failure callback is invoked with an error 
			 *   message.
			 */
			addLink: function(libraryId, linkId, index) {
				return this.retrieveAndUpdate(libraryId, function(library) {
					if (library.links && library.links.length > 0) {
						library.links.splice(index, 0, linkId);
					}
					else {
						library.links = [linkId];
					}
					return library;
				});
			},
			
			/**
			 * Function: removeLink
			 * 
			 * Removes a link from a library.
			 * 
			 * Parameters:
			 *   libraryId - String. LinkLibrary ID from which link will be removed.
			 *   linkId - String. Link ID to be removed from the LinkLibrary.
			 * 
			 * Returns:
			 *   jQuery Deferred. Success callback is invoked with the new 
			 *   LinkLibrary JSON. Failure callback is invoked with an error 
			 *   string.
			 */
			removeLink: function(libraryId, linkId) {
				return this.retrieveAndUpdate(libraryId, function(library) {
					var i, linkIds = [], oldLinkId;
					if (library.links) {
						for (i = 0; i < library.links.length; i++) {
							oldLinkId = library.links[i];
							if (oldLinkId !== linkId) {
								linkIds.push(oldLinkId);
							}
						}
						library.links = linkIds;
					}
					return library;
				});
			},
		};
		return _this;
	};
	ns.LibraryService = LibraryService;
})(jQuery, window.core.services);