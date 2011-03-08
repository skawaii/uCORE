/**
 * Class: SearchService
 * 
 * Client for searching CORE Links and LinkLibraries.
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   - jQuery
 *   - core.util.Assert
 *   - core.util.CallbackUtils
 */

if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function($, ns) {
	var Assert = core.util.Assert;
	var CallbackUtils = core.util.CallbackUtils;
	
	var SearchService = function(linksEndpoint, libEndpoint) {
		this.linksEndpoint = linksEndpoint;
		this.libEndpoint = libEndpoint;
	};
	SearchService.prototype = {
		linksEndpoint: null,

		libEndpoint: null,

		/**
		 * Function: search
		 * 
		 * Invokes a web service to find links and link libraries related 
		 * to a search term. Web service invocation is asynchronous - caller 
		 * processes results and determines query status through the callback
		 * parameter.
		 * 
		 * The callback function receives a single parameter that is a query 
		 * result. The query result has the following structure:
		 * (start code)
		 * pk: Number. Unique ID.
		 * model: String. Name of the relational object model.
		 * fields:
		 *     url: String. URL path to Link.
		 *     tags: Array of Number. Unique IDs of tags.
		 *     poc: Number. Unique ID of POC.
		 *     name: String. Name of link.
		 *     desc: String. Description of link.
		 * (end code)
		 * 
		 * Parameters:
		 *   term - String. Required. Search term.
		 *   searchLinks - Boolean. Optional. Defaults to true.
		 *   searchLibraries - Boolean. Optional. Defaults to true.
		 *   callback - Function or Object. Required. Invoked with results.
		 *         Contains the following functions:
		 *           - result - invoked once per result
		 *           - error - invoked once if an error occurs
		 *           - complete - invoked once when the query is complete and 
		 *                 there are no more results to process
		 */
		search: function(term, searchLinks, searchLibraries, callback) {
			Assert.isTrue(arguments.length >= 2 && arguments.length <= 4, 
					"Invalid number of arguments");
			Assert.type(term, "string");
			var searchLinksVal = (typeof searchLinks === "boolean") ? searchLinks : true;
			var searchLibrariesVal = (typeof searchLibraries === "boolean") ? searchLibraries : true;
			
			callback = arguments[arguments.length - 1];
			if (typeof callback !== "object"
				&& typeof callback !== "function") {
				throw "Invalid arguments - expected last argument to be a callback, not " + (typeof callback);
			}
			if (searchLinksVal && searchLibrariesVal) {
				var self = this;
				this.searchLinks(term, {
					result: function(link) {
						return CallbackUtils.invokeCallback(callback, link, "result");
					},
					error: function(errorThrown) {
						CallbackUtils.invokeOptionalCallback(callback, errorThrown, "error");
					},
					complete: function() {
						self.searchLibraries(term, callback);
					}
				});
			}
			else if (searchLinksVal) {
				this.searchLinks(term, callback);
			}
			else if (searchLibrariesVal) {
				this.searchLibraries(term, callback);
			}
		},

		/**
		 * Function: searchLinks
		 * 
		 * Invokes a web service to find links related to a search term. Web 
		 * service invocation is asynchronous - caller processes results and 
		 * determines query status through the callback parameter.
		 * 
		 * Parameters:
		 *   term - String. Required. Search term.
		 *   callback - Function or Object. Required.
		 */
		searchLinks: function(term, callback) {
			$.ajax(this.linksEndpoint, {
				data: {q: term},
				dataType: "json",
				success: function(data, textStatus, jqXHR) {
					$.each(data, function(key, val) {
						return CallbackUtils.invokeCallback(callback, val, "result");
					});
				},
				error: function(jqXHR, textStatus, errorThrown) {
					CallbackUtils.invokeOptionalCallback(callback, "error", errorThrown);
				},
				complete: function(jqXHR, textStatus) {
					CallbackUtils.invokeOptionalCallback(callback, "complete", []);
				}
			});
		},

		/**
		 * Function: searchLibraries
		 * 
		 * Invokes a web service to find link libraries related to a search 
		 * term. Web service invocation is asynchronous - caller processes 
		 * results and determines query status through the callback parameter.
		 * 
		 * Parameters:
		 *   term - String. Required. Search term.
		 *   callback - Function or Object. Required.
		 */
		searchLibraries: function(term, callback) {
			$.ajax(this.libEndpoint, {
				data: {q: term},
				dataType: "json",
				success: function(data, textStatus, jqXHR) {
					$.each(data, function(key, val) {
						return CallbackUtils.invokeCallback(callback, val, "result");
					});
				},
				error: function(jqXHR, textStatus, errorThrown) {
					CallbackUtils.invokeOptionalCallback(callback, "error", errorThrown);
				},
				complete: function(jqXHR, textStatus) {
					CallbackUtils.invokeOptionalCallback(callback, "complete", []);
				}
			});
		}

	};
	ns.SearchService = SearchService;
})(jQuery, window.core.services);