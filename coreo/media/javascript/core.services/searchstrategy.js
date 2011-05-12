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
 *   - core.util.CallbackUtils
 *   - core.geo.LinkGeoData
 *   - core.geo.LinkLibraryGeoData
 */

if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function($, ns) {
	var CallbackUtils = core.util.CallbackUtils;
	var LinkGeoData = core.geo.LinkGeoData;
	var LinkLibraryGeoData = core.geo.LinkLibraryGeoData;
	
	/**
	 * Constructor: SearchStrategy
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   searchService - <SearchService>. Required.
	 *   searchResultFilter - <SearchResultFilter>. Required.
	 *   geoDataRetriever - <GeoDataRetriever>. Required. 
	 */
	var SearchStrategy = function(searchService, searchResultFilter, geoDataRetriever, linkService) {
		this.searchService = searchService;
		this.searchResultFilter = searchResultFilter;
		this.geoDataRetriever = geoDataRetriever;
		this.linkService = linkService;
	};
	SearchStrategy.prototype = {
		/**
		 * Property: linkService
		 * 
		 * <LinkService>.
		 */
		linkService: null,
		
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
		 * Property: geoDataRetriever
		 * 
		 * <GeoDataRetriever>. Retrieves GeoData for selected search results.
		 */
		geoDataRetriever: null,
		
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
		 *         after all search results have been evaluated. Its 
		 *         "error" function will be invoked if an error occurs.  
		 */
		search: function(text, callback) {
			if (text.match('^http')) {
				CallbackUtils.invokeOptionalCallback(callback, "resultBegin", 
						[text, text, null]);
				this.geoDataRetriever.fetch(text)
					.then(function(geodata) {
						CallbackUtils.invokeCallback(callback, geodata, "resultSuccess");
						CallbackUtils.invokeOptionalCallback(callback, "complete");
					},
					function(errorThrown) {
						CallbackUtils.invokeOptionalCallback(callback, "resultError", 
								[text, errorThrown]);
					});
			}
			else {
				// get Links and LinkLibraries matching the search term, 
				// pass the results through the SearchResultFilter
				// build GeoData objects from the filtered results and 
				// invoke the callback with them
				var self = this;
				var geoDataBuilder = {
					result: function(linkOrLibrary) {
						var i;
						var id = linkOrLibrary.pk;
						var creatorId = linkOrLibrary.fields.creator ? linkOrLibrary.fields.creator.pk : null;
						CallbackUtils.invokeOptionalCallback(callback, "resultBegin", 
								[id, linkOrLibrary.fields.name, creatorId]);
						if (linkOrLibrary.model === "ucore.linklibrary") {
							var linkLibraryGeoData = new LinkLibraryGeoData(null, 
									linkOrLibrary, this.linkService, 
									this.geoDataRetriever);
							CallbackUtils.invokeCallback(callback, 
									[id, linkLibraryGeoData], "resultSuccess");
						}
						else if (linkOrLibrary.model === "ucore.link") {
							var linkGeoData = new LinkGeoData(null, 
									linkOrLibrary, null, this.geoDataRetriever);
							CallbackUtils.invokeCallback(callback, 
									[id, linkGeoData], "resultSuccess");
						}
						else {
							CallbackUtils.invokeOptionalCallback(callback, "resultError", 
									[id, "Unknown result model - " + linkOrLibrary.model]);
						}
					},
					complete: function() {
						CallbackUtils.invokeOptionalCallback(callback, "complete", []);
					},
					error: function(errorThrown) {
						CallbackUtils.invokeOptionalCallback(callback, "error", errorThrown);
					},
					context: self
				};
				this.searchResultFilter.begin.call(this.searchResultFilter, geoDataBuilder);
				var searchResultFilterRef = this.searchResultFilter;
				this.searchService.search(text, true, true, {
					result: function(linkOrLibrary) {
						searchResultFilterRef.result.call(searchResultFilterRef, linkOrLibrary);
					},
					error: function(errorThrown) {
						searchResultFilterRef.error.call(searchResultFilterRef, errorThrown);
					},
					complete: function() {
						searchResultFilterRef.end.call(searchResultFilterRef);
					},
					context: self
				});
			}
		}
	};
	ns.SearchStrategy = SearchStrategy;
})(jQuery, window.core.services);