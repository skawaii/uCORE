(function($) {

	// result should be: { id: "", title: "", description: "" }
	var ResultsList = {

		options: {
			title: "Search Results"
		},

		_init: function() {
			this.element.addClass("ui-widget ui-resultslist");
			
			var closeLink = $("<a>").attr("href", "#").append($("<span>").addClass("ui-icon ui-icon-closethick"));
			closeLink.bind("click", $.proxy(function() {
				this.close();
			}, this));

			var title = $("<div>").html(this.options.title)
				.addClass("ui-widget-header")
				.append(closeLink);
			this.element.append(title);

			var contentHeight = this.element.innerHeight() - title.outerHeight();
			
			var content = $("<div>").addClass("ui-widget-content").height(contentHeight);
			this.element.append(content);
			
			var self = this;
			content.delegate("div.ui-resultslist-result", "click", 
				function() {
					var resultId = $(this).attr("resultid");
					var data = $(this).data("resultslist");
					self.element.trigger("clickresult", [resultId, data]);
				});
			content.delegate("div.ui-resultslist-result", "mouseenter", 
					function() {
						$(this).addClass("ui-state-highlight");
					});
			content.delegate("div.ui-resultslist-result", "mouseleave", 
					function() {
						$(this).removeClass("ui-state-highlight");
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

		addResult: function(id, title, description, data) {
			var resultContainer = $("<div>").addClass("ui-resultslist-result")
				.attr("resultid", id);
			resultContainer.append($("<h4>").append(
					$("<a>").attr("href", "#").html(title)));
			resultContainer.append($("<p>").html(description));
			resultContainer.data("resultslist", data);
			this.element.find("> .ui-widget-content").append(resultContainer);
		},
		
		removeResult: function(resultId) {
			var content = this.element.find("> .ui-widget-content");
			content.find("div.ui-resultslist-result[resultid=\"" + resultId + "\"]").remove();
			
			// this.element.remove("div.ui-resultslist-result[resultid=\"" + resultId + "\"]");
		},
		
		close: function() {
			this.element.hide();
		}
	};

	$.widget("ui.resultslist", ResultsList);
	
})(jQuery);