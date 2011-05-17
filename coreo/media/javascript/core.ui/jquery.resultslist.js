(function($) {

	// result should be: { id: "", title: "", description: "" }
	var ResultsList = {

		options: {
			title: "Search Results"
		},

		_init: function() {
			this.element.addClass("ui-widget ui-resultslist")
//			this.element.append($("<div>").addClass("ui-widget-shadow")
//					.css({"margin-top": "-10px", "margin-left": "10px"}));
			
			var closeLink = $("<a>").attr("href", "#").append($("<span>")
					.addClass("ui-icon ui-icon-closethick"));
			closeLink.bind("click", $.proxy(function() {
				this.close();
			}, this));

			var title = $("<span>").html(this.options.title);
			
			var titlebar = $("<div>").addClass("ui-widget-header ui-corner-tr")
				.append(title)
				.append($("<span>").addClass("ui-resultslist-loading").css("display", "none").html("&#160;"))
				.append(closeLink);
			
			this.element.append(titlebar);

			var contentHeight = this.element.innerHeight() - titlebar.outerHeight();
			
			var content = $("<div>").addClass("ui-widget-content ui-corner-br").height(contentHeight);
			this.element.append(content);
			
			var self = this;
			content.delegate("div.ui-resultslist-result", "click", 
				function() {
					var resultId = $(this).attr("resultid");
					var data = $(this).data("resultslist");
					self.element.trigger("clickresult", [resultId, data, $(this)]);
				});
			content.delegate("div.ui-resultslist-result", "mouseenter",
					function() {
						$(this).addClass("ui-state-highlight");
						var resultId = $(this).attr("resultid");
						var data = $(this).data("resultslist");
						self.element.trigger("mouseenterresult", [resultId, data, $(this)]);
					});
			content.delegate("div.ui-resultslist-result", "mouseleave", 
					function() {
						$(this).removeClass("ui-state-highlight");
						var resultId = $(this).attr("resultid");
						var data = $(this).data("resultslist");
						self.element.trigger("mouseleaveresult", [resultId, data, $(this)]);
					});
		},

		setMessage: function(msg) {
			var content = this.element.find("> .ui-widget-content");
			var msgEl = content.children("p:first");
			if (msgEl.length == 0) {
				msgEl = $("<p>").prependTo(content);
			}
			msgEl.html(msg);
		},

		addResult: function(id, title, description, footer, data) {
			var resultContainer = $("<div>").addClass("ui-resultslist-result")
				.attr("resultid", id);
			resultContainer.append($("<h4>").addClass("ui-resultslist-result-title")
					.append($("<a>").attr("href", "#").html(title)));
			resultContainer.append($("<div>").addClass("ui-resultslist-result-desc").html(description));
			resultContainer.append($("<div>").addClass("ui-resultslist-result-footer").html(footer));
			resultContainer.data("resultslist", data);
			this.element.find("> .ui-widget-content").append(resultContainer);
		},
		
		removeResult: function(resultId) {
			var content = this.element.find("> .ui-widget-content");
			content.find("div.ui-resultslist-result[resultid=\"" + resultId + "\"]").remove();
		},

		clear: function() {
			this.element.find("> .ui-widget-content").empty();
		},

		setLoading: function(isLoading) {
			if (isLoading === true) {
				this.element.find(".ui-resultslist-loading").show();
			}
			else {
				this.element.find(".ui-resultslist-loading").hide();
			}
		},

		close: function() {
			this.element.trigger("close");
			this.element.hide();
		},
		
		destroy: function() {
			this.element.empty();
		}
	};

	$.widget("ui.resultslist", ResultsList);
	
})(jQuery);