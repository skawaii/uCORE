/**
 * Class: SearchResultFilter
 * 
 * Filters the results from a search. Caller invokes functions in a specific 
 * order - begin, result, end, getResults. error function may be invoked at any
 * time.
 * 
 * This is merely an interface. Implementations should extend this class.
 * 
 * Example Use Case:
 * This is how a caller would use SearchResultFilter.
 * (start code)
 * var searchResultFilter;
 * var filteredResults = [];
 * var filteredResultsReceiver = {
 *     result: function(data) {
 *         filteredResults.push(data);
 *     },
 *     complete: function() {
 *         alert("The array is complete");
 *     },
 *     error: function(errorThrown) {
 *         alert("An error occurred: " + errorThrown);
 *     }
 * };
 * searchResultFilter.begin(filteredResultsReceiver);
 * searchResultFilter.result("1");
 * searchResultFilter.result("2");
 * searchResultFilter.result("3");
 * searchResultFilter.end();
 * (end code) 
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   None.
 */

if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function(ns) {
	var SearchResultFilter = function() {};
	SearchResultFilter.prototype = {
		/**
		 * Function: begin
		 * 
		 * Signals the beginning of a new set of results to filter.
		 * 
		 * Paramters:
		 *   callback - Object or Function. Required. Invoked with each 
		 *         result that passes the filter. If an object, the 
		 *         "result" function will be invoked for each result, 
		 *         the "complete" function will be invoked after 
		 *         all results have been evaluated, and the "error" 
		 *         function will be invoked if an error occurs.
		 */
		begin: function(callback) {},

		/**
		 * Function: result
		 * 
		 * Requests that this filter be applied to another result.
		 * 
		 * Parameters:
		 *   data - Object. Unfiltered result.
		 */
		result: function(data) {},

		/**
		 * Function: end
		 * 
		 * Signals that all unfiltered results have been added.
		 */
		end: function() {},
		
		/**
		 * Function: error
		 * 
		 * Invoked after begin, in place of invoking end. Signals that an 
		 * error has occurred and evaluation of results should be aborted.
		 * 
		 * Parameters:
		 *   errorThrown - String. Error details.
		 */
		error: function(errorThrown) {}
	};
	ns.SearchResultFilter = SearchResultFilter;
})(window.core.services);