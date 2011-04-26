(function($) {

	// result should be: { id: "", title: "", description: "" }
	var SlidePanel = {

		options: {},

		_init: function() {
			var titlebar;
			
			this.element.addClass("ui-widget ui-slidepanel");

			//.append($("<span>").addClass("ui-slidepanel-loading").css("display", "none").html("&#160;"))
			
			titlebar = $("<div>").addClass("ui-widget-header ui-corner-tr")
				.append($("<div>").addClass("title-lens")
							.css({
								"overflow": "hidden",
								"position": "relative",
								"margin": 0,
								"padding": 0
							})
							.append($("<div>").addClass("title-reel")
									.css({
										"width": "10000px",
										"position": "absolute", 
										"left": "-10000", 
										"overflow": "hidden",
										"margin": 0,
										"padding": 0
									})))
				.append($("<div>").addClass("controls")
						.append($("<a>").attr({ "href": "#", "title": "back" })
								.addClass("ui-corner-all")
								.append($("<span>").addClass("ui-icon ui-icon-triangle-1-w"))
								.click($.proxy(function(e) {
									e.preventDefault();
									this.back(1);
								}, this)))
						.append($("<a>").attr({ "href": "#", "title": "forward" })
								.addClass("ui-corner-all")
								.append($("<span>").addClass("ui-icon ui-icon-triangle-1-e"))
								.click($.proxy(function(e) {
									e.preventDefault();
									this.forward(1);
								}, this)))
						.append($("<a>").attr({ "href": "#", "title": "close" })
								.addClass("ui-corner-all")
								.append($("<span>").addClass("ui-icon ui-icon-closethick"))
								.click($.proxy(function(e) {
									e.preventDefault();
									this.close();
								}, this))));
			titlebar.delegate("a", "hover", function() {
				$(this).toggleClass("ui-state-hover");
			});
			this.element.append(titlebar);
			//titlebar.height(titlebar.find("div.controls").outerHeight(true));

			var content = $("<div>").addClass("ui-widget-content ui-corner-br")
				.append($("<div>").addClass("content-lens")
							.css({
								"overflow": "hidden",
								"position": "relative",
								"margin": 0,
								"padding": 0
							})
							.append($("<div>").addClass("content-reel")
										.css({
											"width": "10000px",
											"position": "absolute", 
											"left": "-10000", 
											"overflow": "hidden",
											"margin": 0,
											"padding": 0
										})))
				.appendTo(this.element);
			
			this.element.delegate("*", "click", function(e) {
				console.log("clicked" + e.target);
				e.preventDefault();
				e.stopImmediatePropagation();
			});
			
			this.resize();
		},

		resize: function() {
			var header, totalWidth, titleLens, titleLensWidthPad, 
				titleWidth, titleLensHeightPad, titleHeight, titleReel,
				currentIdx, widgetContent, widgetContentWidthPad, 
				widgetContentHeightPad, contentLens, contentLensWidthPad,
				contentWidth, contentHeight, contentReel, widthDiff, dummyTxt;
			if ($(this.element).is(":visible")) {
				totalWidth = $(this.element).width();
				totalHeight = $(this.element).height();
				
				// header needs to contain text to determine height
				header = $(this.element).find("> .ui-widget-header");
				titleLens = header.find("> div.title-lens");
				titleReel = titleLens.find("> div.title-reel");
				
				/*
				if (titleReel.children().size() == 0) {
					dummyTxt = $("<span>").text("foo");
					header.append(dummyTxt);
				}
				*/

				// resize header
				header.width(totalWidth - (header.outerWidth() - header.width()));
				header.height(header.height());
				
				// resize title
				controlsWidth = header.find("> div.controls").outerWidth(true);
				titleLensWidthPad = titleLens.outerWidth() - titleLens.width();
				titleWidth = header.width() - controlsWidth - titleLensWidthPad;
				titleLens.width(titleWidth);
				titleLensHeightPad = titleLens.outerHeight() - titleLens.height();
				titleHeight = header.height() - titleLensHeightPad;
				
				console.log("titleHeight: " + titleHeight + ", header: " + header.height() + ", titleLensHeightPad: "
						+ titleLensHeightPad + ", titleLens.outerHeight(): " + titleLens.outerHeight()
						+ ", titleLens.height(): " + titleLens.height() + ", titleWidth: " + titleWidth
						+ ", header.width(): " + header.width());
				
				titleLens.height(titleHeight);
				titleReel.children().each(function() {
					$(this).height(titleHeight);
					$(this).width(titleWidth);
				});
				currentIdx = Math.max(this.getCurrentIndex(), 0);
				titleReel.css("left", -1 * currentIdx * titleWidth);
				
				// resize widget content
				widgetContent = $(this.element).find("> .ui-widget-content");
				widgetContentWidthPad = widgetContent.outerWidth() - widgetContent.width();
				widgetContent.width(header.outerWidth() - widgetContentWidthPad);
				widgetContentHeightPad = widgetContent.outerHeight() - widgetContent.height();
				widgetContent.height(totalHeight - header.outerHeight(true) - widgetContentHeightPad);
				
				// resize content frames
				contentLens = widgetContent.find("> div.content-lens");
				contentLensWidthPad = contentLens.outerWidth() - contentLens.width();
				contentWidth = widgetContent.width() - contentLensWidthPad;
				contentLens.width(contentWidth);
				contentLensHeightPad = contentLens.outerHeight() - contentLens.height();
				contentHeight = widgetContent.height() - contentLensHeightPad;
				contentLens.height(contentHeight);
				contentReel = contentLens.find("> div.content-reel");
				contentReel.children().each(function() {
					$(this).height(contentHeight);
					$(this).width(contentWidth);
				});
				contentReel.css("left", -1 * currentIdx * contentWidth);
				
				// make title width = content width so animation is in sync
				widthDiff = contentWidth - titleWidth;
				titleReel.children().each(function() {
					$(this).css("margin-right", widthDiff);
				});

				this.options.contentWidth = contentWidth;
				this.options.contentHeight = contentHeight;
				this.options.titleWidth = titleWidth;
				this.options.titleHeight = titleHeight;
			}
		},

		getIndex: function(title) {
			var idx = -1;
			$(this.element).find("> .ui-widget-header > div.title-lens > div.title-reel > *").each(function(i) {
				if ($(this).html() === title) {
					idx = i;
					return false;
				}
			});
			return idx;
		},

		getCurrentIndex: function() {
			return $(this.element).find("> .ui-widget-content > div.content-lens > div.content-reel > div.content-projected").index();			
		},

		/*
		_resetPanelWidths: function() {
			var widgetContent, newWidth, currentIdx, panels, paddingAndBorderWidth;
			widgetContent = $(this.element).find(".ui-widget-content:visible");
			if (widgetContent.size() > 0) {
				newWidth = widgetContent.width();
				panels = widgetContent.find("> div.panels > div.panel");
				if (panels.size() > 0) {
					// compute desired panel width, accounting for padding 
					// and border width
					paddingAndBorderWidth = panels.outerWidth() - panels.width();
					newDefaultPanelWidth = newWidth - paddingAndBorderWidth;
					this.options.defaultPanelWidth = newDefaultPanelWidth;
					panels.each(function() { $(this).width(newDefaultPanelWidth); });
					// adjust left
					currentIdx = widgetContent.find("> div.panels > div.panel-center").index();
					currentIdx = Math.max(currentIdx, 0);
					widgetContent.find("> div.panels").css({
						"left": -1 * currentIdx * panels.outerWidth(true)
					});
					this.options.leftIncrement = panels.outerWidth(true);
				}
			}
		},
	*/
		
		append: function(cfg) {
			var titleReel, contentReel, idx, newTitle, newContent;
			this.resize();
			titleReel = $(this.element).find("> .ui-widget-header > div.title-lens > div.title-reel");
			idx = titleReel.children().size();
			newTitle = $("<div>").html(cfg.title);
			newTitle.width(this.options.titleWidth);
			newTitle.height(this.options.titleHeight);
			newTitle.css({
				"float": "left",
				"position": "relative",
				"display": "block",
				"overflow": "hidden"
			});
			titleReel.append(newTitle);
			contentReel = $(this.element).find("> .ui-widget-content > div.content-lens > div.content-reel");
			newContent = $("<div>").html(cfg.content);
			newContent.width(this.options.contentWidth);
			newContent.height(this.options.contentHeight);
			newContent.css({
				"float": "left",
				"position": "relative",
				"display": "block",
				"overflow": "auto"
			});
			contentReel.append(newContent);
			if (contentReel.find(".content-projected").size() == 0) {
				newContent.addClass("content-projected");
			}
			return idx;
			/*
			
			var widgetContent = $(this.element).find(".ui-widget-content");
			var panelContainer = widgetContent.find("> div.panels");
			var idx = panelContainer.children("div.panel").size();

			this._resetPanelWidths();
			
			var panel = $("<div>").addClass("panel")
				.attr("slidepanel-title", title)
				.css({ height: "100%", width: this.options.defaultPanelWidth })
				.append($(content))
				.appendTo(panelContainer);
			
			return idx;
			*/
		},

		replace: function(index) {
			
		},

		remove: function(index) {
			
		},
		
		removeAll: function() {
			
		},

		showPanel: function(index, onComplete) {
			var titleReel, contentReel, totalFrames, newLeftVal, frames;
			this.resize();
			titleReel = $(this.element).find("> .ui-widget-header > div.title-lens > div.title-reel")
			contentReel = $(this.element).find("> .ui-widget-content > div.content-lens > div.content-reel");
			frames = contentReel.children();
			totalFrames = frames.size();
			index = index !== undefined ? index : totalFrames - 1;
			index = Math.min(Math.max(index, 0), totalFrames - 1);
			newLeftVal = -1 * index * this.options.contentWidth;
			titleReel.animate({ "left": newLeftVal }, "fast", "easeOutExpo");
			contentReel.animate({ "left": newLeftVal }, "fast", "easeOutExpo", function() {
				frames.removeClass("content-projected");
				frames.filter(":eq(" + index + ")").addClass("content-projected");
				if (onComplete)
					onComplete.call(onComplete);
			});
			/*
			// fit panel inside container
			this._resetPanelWidths();

			newLeftVal = -1 * index * this.options.leftIncrement;
			console.log("showPanel: left=" + newLeftVal);
			
			panelContainer.animate({ "left": newLeftVal },
					"fast", "easeOutExpo", function() {
						panels.removeClass("panel-center");
						panels.filter(":eq(" + index + ")").addClass("panel-center");
						if (onComplete)
							onComplete.call(onComplete); 
					} );
			*/
		},

		back: function(amount, onComplete) {
			var currentIdx = this.getCurrentIndex();
			this.showPanel(currentIdx - amount, onComplete);
		},

		forward: function(amount, onComplete) {
			var currentIdx = this.getCurrentIndex();
			this.showPanel(currentIdx + amount, onComplete);
		},

		clear: function() {
			// this.element.find("> .ui-widget-content > div.panels").empty();
		},

		setLoading: function(isLoading) {
			/*
			if (isLoading === true) {
				this.element.find(".ui-slidepanel-loading").show();
			}
			else {
				this.element.find(".ui-slidepanel-loading").hide();
			}
			*/
		},

		close: function() {
			this.element.trigger("close");
			this.element.hide();
		},
		
		destroy: function() {
			this.element.empty();
		}
	};

	$.widget("ui.slidepanel", SlidePanel);

})(jQuery);