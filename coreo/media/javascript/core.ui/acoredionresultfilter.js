/**
 * Class: AcoredionResultFilter
 * 
 * Implementation of <SearchResultFilter> that displays the search results in
 * a panel beside the Acoredion element and allows the user to click results
 * to add them to the Acoredion.
 * 
 * Namespace:
 *   core.ui
 * 
 * Dependencies:
 *   - jQuery
 */

if (!window.core)
	window.core = {};
if (!window.core.ui)
	window.core.ui = {};

(function($, ns) {
	/**
	 * Constructor: AcoredionResultFilter
	 * 
	 * Parameters:
	 *   element - DOM element. The element where this object will be rendered.
	 */
	var AcoredionResultFilter = function(element) {
		this.element = element;
		this._init();
	};
	AcoredionResultFilter.prototype = {
		element: null,

		callback: null,
		
		resultCount: 0,

		_init: function() {
			var jqEl = $(this.element);
			jqEl.empty();
			jqEl.hide();
			jqEl.resultslist({
				title: "Search Results"
			});
			jqEl.bind("clickresult", $.proxy(function(evt, resultId, linkOrLibrary, el) {
				core.util.CallbackUtils.invokeCallback(this.callback, linkOrLibrary, "result");
				jqEl.resultslist("removeResult", resultId);
			}, this));
			jqEl.bind("mouseenterresult", $.proxy(function(evt, resultId, linkOrLibrary, el) {
				// console.log("Hovering on " + resultId);
			}, this));
			jqEl.bind("mouseleaveresult", $.proxy(function(evt, resultId, linkOrLibrary, el) {
				// console.log("Done hovering on " + resultId);
			}, this));
			jqEl.bind("close", $.proxy(function(evt) {
				core.util.CallbackUtils.invokeCallback(this.callback, "complete");
				// doesn't need to be cleared here, but do it to free up 
				// memory - remove unused elements from the DOM
				jqEl.resultslist("clear");
			}, this));
		},

		begin: function(callback) {
			this.callback = callback;
			this.resultCount = 0;
			var jqEl = $(this.element);
			jqEl.resultslist("clear");
			if (jqEl.is(":hidden")) {
				jqEl.show("slide", {}, 200, null);				
			}
			jqEl.resultslist("setLoading", true);
			jqEl.resultslist("setMessage", "Searching...");
		},
		
		result: function(linkOrLibrary) {
			this.resultCount++;
			var title = linkOrLibrary.fields.name;
			var description = linkOrLibrary.fields.desc;
			var id = linkOrLibrary.pk;
			var footer = linkOrLibrary.fields.url;
			$(this.element).resultslist("addResult", id, title, description, footer, linkOrLibrary);
		},
		
		end: function() {
			var jqEl = $(this.element);
			jqEl.resultslist("setLoading", false);
			jqEl.resultslist("setMessage", this.resultCount + " results found.");
		},

		error: function(err) {
			alert("Search error: " + err);
		}
	};
	ns.AcoredionResultFilter = AcoredionResultFilter;
})(jQuery, window.core.ui);