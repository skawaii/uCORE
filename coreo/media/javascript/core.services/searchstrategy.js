/**
 * Class: SearchStrategy
 * 
 * Performs a search for CORE Links, LinkLibraries, or KML documents. Contains
 * the algorithm for parsing user-entered search text and determining 
 * whether to perform a Link/LinkLibrary search or loading a KML URL 
 * directly.
 * 
 * Namespace:
 *   core.services
 *   
 * Dependencies:
 *   - jQuery
 *   - core.geo.KmlNodeGeoData
 *   - core.util.CallbackUtils
 */

if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function($, ns) {
	var KmlNodeGeoData = core.geo.KmlNodeGeoData;
	var CallbackUtils = core.util.CallbackUtils;

	// private function used by SearchStrategy
	var fetchKml = function(url, callback) {
		$.ajax({
			"url": url,
			dataType: "xml",
			success: function(data, textStatus, jqXHR) {
				var geodata = KmlNodeGeoData.fromKmlDoc(data);
				CallbackUtils.invokeCallback(callback, geodata, "result");
			},
			error: function(jqXHR, textStatus, errorThrown) {
				CallbackUtils.invokeOptionalCallback(callback, "error", errorThrown);
			},
			complete: function(jqXHR, textStatus) {
				CallbackUtils.invokeOptionalCallback(callback, "complete", []);
			}
		});
	};

	/**
	 * Constructor: SearchStrategy
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   searchService - core.services.SearchService. Required.
	 *   searchResultFilter - core.services.SearchResultFilter. Required.
	 */
	var SearchStrategy = function(searchService, searchResultFilter) {
		this.searchService = searchService;
		this.searchResultFilter = searchResultFilter;
	};
	SearchStrategy.prototype = {
		/**
		 * Property: searchService
		 * 
		 * core.util.SearchService. Client to CORE search web service. Invoked
		 * when search term is not a URL.
		 */
		searchService: null,

		/**
		 * Property: searchResultFilter
		 * 
		 * core.services.SearchResultFilter. When search term is not a URL, 
		 * the CORE search web service is queried for matching Links and 
		 * LinkLibraries. The results are fed to this object and this object
		 * determines which results will be returned from the search. 
		 * Typical implementation would be to present the unfiltered results 
		 * to the user in some type of listing and allow the user to select 
		 * the results.
		 */
		searchResultFilter: null,

		/**
		 * Function: search
		 * 
		 * Perform a search. If search text is a URL, KML is retrieved from the
		 * URL. If search text is not a URL, the CORE search web service is 
		 * queried for matching Links and LinkLibraries.
		 * 
		 * Parameters:
		 *   text - String. Required. Search term.
		 *   callback - Object or Function. Required. Callback to be invoked 
		 *         with filtered search results and search status. If callback
		 *         is an object, its "result" function will be invoked with 
		 *         a single parameter, an instance of core.geo.GeoData, for
		 *         each search result. Its "complete" function will be invoked
		 *         when after all search results have been evaluated. Its 
		 *         "error" function will be invoked if an error occurs.  
		 */
		search: function(text, callback) {
			if (text.match('^http')) {
				fetchKml(text, callback);
			}
			else {
				// get Links and LinkLibraries matching the search term, 
				// pass the results through the SearchResultFilter
				// build GeoData objects from the filtered results and 
				// invoke the callback with them
				var geoDataBuilder = {
					result: function(linkOrLibrary) {
						// build geodata
						var kmlUrl = linkOrLibrary.fields.url;
						// need to prevent complete from being called
						//fetchKml(kmlUrl, callback);
						fetchKml(kmlUrl, {
							result: function(geodata) {
								CallbackUtils.invokeCallback(callback, geodata, "result");
							},
							error: function(errorThrown) {
								CallbackUtils.invokeOptionalCallback(callback, "error", errorThrown);
							},
							complete: function() {}
						});
					},
					complete: function() {
						CallbackUtils.invokeOptionalCallback(callback, "complete", []);
					},
					error: function(errorThrown) {
						CallbackUtils.invokeOptionalCallback(callback, "error", errorThrown);
					}
				};
				this.searchResultFilter.begin(geoDataBuilder);
				var searchResultFilterRef = this.searchResultFilter;
				this.searchService.search(text, true, true, {
					result: function(linkOrLibrary) {
						searchResultFilterRef.result(linkOrLibrary);
					},
					error: function(errorThrown) {
						searchResultFilterRef.error(errorThrown);
					},
					complete: function() {
						searchResultFilterRef.end();
					}
				});
			}
		}
	};
	ns.SearchStrategy = SearchStrategy;
})(jQuery, window.core.services);