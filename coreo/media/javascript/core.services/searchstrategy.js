/**
 * Class: SearchStrategy
 * 
 * Performs a search for CORE Links, LinkLibraries, or KML documents.
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

	var SearchStrategy = function(searchService, searchResultFilter) {
		this.searchService = searchService;
		this.searchResultFilter = searchResultFilter;
	};
	SearchStrategy.prototype = {
		searchService: null,

		searchResultFilter: null,

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