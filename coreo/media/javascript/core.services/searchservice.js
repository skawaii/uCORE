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
			if (searchLinksVal) {
				this.searchLinks(term, callback);
			}
			if (searchLibrariesVal) {
				this.searchLibraries(term, callback);
			}
		},

		searchLinks: function(term, callback) {
			$.getJSON(this.linksEndpoint, {q: term}, function(data) {
				$.each(data, function(key, val) {
					CallbackUtils.invokeCallback(callback, val);
				});
			});
		},

		searchLibraries: function(term, callback) {
			$.getJSON(this.libEndpoint, {q: term}, function(data) {
				$.each(data, function(key, val) {
					CallbackUtils.invokeCallback(callback, val);
				});
			});
		}

	};
	ns.SearchService = SearchService;
})(jQuery, window.core.services);