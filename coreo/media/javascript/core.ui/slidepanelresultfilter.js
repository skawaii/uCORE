/**
 * Class: SlidePanelResultFilter
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
	 * Constructor: SlidePanelResultFilter
	 * 
	 * Parameters:
	 *   element - Mixed. Contains a jQuery SlidePanel.
	 *   panelId - String. ID to assign to the SlidePanel content panel 
	 *         containing the search results.
	 */
	var SlidePanelResultFilter = function(element, panelId) {
		this.element = element;
		this.panelId = panelId;
		this._init();
	};
	SlidePanelResultFilter.prototype = {
		element: null,

		panelId: null,

		callback: null,

		resultCount: 0,

		_panelContent: null,

		_titleContent: null,
		
		_init: function() {
			$(this.element).bind("close", $.proxy(function(e) {
				if (this.callback) {
					core.util.CallbackUtils.invokeCallback(this.callback, "complete");
				}
				// doesn't need to be cleared here, but do it to free up 
				// memory - remove unused elements from the DOM
			}, this));
		},

		clearResults: function() {
			if (this._panelContent) {
				this._panelContent.find("> div.search-results").empty();
				this._panelContent.find("> p").text("0 results found.");
			}
		},

		begin: function(callback) {
			var jqEl, idx, titleContent;

			this.callback = callback;
			this.resultCount = 0;
			jqEl = $(this.element);

			this._panelContent = $("<div>").addClass("ui-slidepanelresultfilter")
				.append($("<p>").text("0 results found."))
				.append($("<div>").addClass("search-results"));
			this._titleContent = $("<div>").addClass("ui-slidepanelresultfilter")
				.append($("<span>").text("Search Results"))
				.append($("<span>").addClass("search-results-loading").html("&#160;"));
			var self = this;
			this._panelContent.delegate("div.search-results > div.result", "click", 
				function() {
					var resultId = $(this).attr("resultid");
					var linkOrLibrary = $(this).data("linkOrLibrary");
					//$(this).remove();
					$(this).addClass("ui-state-active");
					core.util.CallbackUtils.invokeCallback(self.callback, linkOrLibrary, "result");
				});
			this._panelContent.delegate("div.search-results > div.result", "mouseenter",
				function() {
					$(this).addClass("ui-state-highlight");
				});
			this._panelContent.delegate("div.search-results > div.result", "mouseleave", 
				function() {
					$(this).removeClass("ui-state-highlight");
				});
			
			idx = jqEl.slidepanel("getIndex", this.panelId);
			if (idx == -1) {
				idx = jqEl.slidepanel("append", {
					"id": this.panelId,
					"title": this._titleContent,
					"content": this._panelContent
				});
			}
			else {
				jqEl.slidepanel("getContentById", this.panelId).empty().append(this._panelContent);
				jqEl.slidepanel("getTitleById", this.panelId).empty().append(this._titleContent);
			}

			jqEl.slidepanel("showPanelByIndex", idx, function() {
				if (jqEl.is(":hidden")) {
					jqEl.show("slide", {}, 200, function() {
						jqEl.slidepanel("resize");
					});
				}				
			});
		},

		result: function(linkOrLibrary) {
			var title, description, id, footer, resultContainer;
			this.resultCount++;
			this._panelContent.find("> p")
				.text(this.resultCount + " results found.");
			
			title = linkOrLibrary.fields.name;
			description = linkOrLibrary.fields.desc;
			id = linkOrLibrary.pk;
			footer = linkOrLibrary.fields.url;
			
			resultContainer = $("<div>").addClass("result").attr("resultid", id);
			resultContainer.append($("<h4>").addClass("title")
					.append($("<a>").attr("href", "#").html(title)));
			resultContainer.append($("<div>").addClass("description").html(description));
			resultContainer.append($("<div>").addClass("footer").html(footer));
			resultContainer.data("linkOrLibrary", linkOrLibrary);
			
			this._panelContent.find("> div.search-results")
				.append(resultContainer);
		},

		end: function() {
			var titleEl;
			titleEl =  $(this.element).slidepanel("getTitleById", this.panelId);
			titleEl.find(".search-results-loading").hide();
		},

		error: function(err) {
			alert("Search error: " + err);
		}
	};
	ns.SlidePanelResultFilter = SlidePanelResultFilter;
})(jQuery, window.core.ui);