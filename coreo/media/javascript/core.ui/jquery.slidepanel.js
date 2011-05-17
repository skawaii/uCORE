/**
 * Class: SlidePanel
 * 
 * jQuery widget plugin. Renders a slideshow-ish widget that is manually 
 * navigated by the user. Content is dynamically added and removed.
 */

(function($) {

	var showPanelState = [];

	var SlidePanel = {

		options: {},

		_init: function() {
			var titlebar, content;
			
			this.element.addClass("ui-widget ui-slidepanel");

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
									if (!$(e.target).closest("a").hasClass("ui-state-disabled")) {
										this.back(1);
									}
								}, this)))
						.append($("<a>").attr({ "href": "#", "title": "forward" })
								.addClass("ui-corner-all")
								.append($("<span>").addClass("ui-icon ui-icon-triangle-1-e"))
								.click($.proxy(function(e) {
									e.preventDefault();
									if (!$(e.target).closest("a").hasClass("ui-state-disabled")) {
										this.forward(1);
									}
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

			content = $("<div>").addClass("ui-widget-content ui-corner-br")
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
				
				header = $(this.element).find("> .ui-widget-header");
				titleLens = header.find("> div.title-lens");
				titleReel = titleLens.find("> div.title-reel");

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
				
				titleLens.height(titleHeight);
				titleReel.children().each(function() {
					$(this).height(titleHeight);
					$(this).width(titleWidth);
				});
				currentIdx = Math.max(this.getProjectedIndex(), 0);
				
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
				titleReel.css("left", -1 * currentIdx * (titleWidth + widthDiff));
				
				this.options.contentWidth = contentWidth;
				this.options.contentHeight = contentHeight;
				this.options.titleWidth = titleWidth;
				this.options.titleHeight = titleHeight;
				this.options.titleWidthDiff = widthDiff;
			}
		},

		getIndex: function(id) {
			return this.getContentById(id).index();
		},

		getProjectedIndex: function() {
			return this.getProjected().index();			
		},

		getProjectedId: function() {
			return this.getProjected().attr("slidepanel-id");
		},

		getProjected: function() {
			return $(this.element).find("> .ui-widget-content > div.content-lens > div.content-reel > div.content-projected");
		},
		
		getContentById: function(id) {
			return $(this.element).find("> .ui-widget-content > div.content-lens > div.content-reel > div[slidepanel-id=\"" + id + "\"]");
		},

		getTitleById: function(id) {
			return $(this.element).find("> .ui-widget-header > div.title-lens > div.title-reel > div[slidepanel-id=\"" + id + "\"]");
		},

		/**
		 * Function: append
		 * 
		 * Parameters:
		 *   cfg - Object. Contains properties: id, title, and content.
		 *         (start code)
		 *         {
		 *             id: "New panel's ID",
		 *             title: "HTML to be displayed in the widget header area",
		 *             content: "HTML to be displayed in the widget content area"
		 *         }
		 *         (end code)
		 */
		append: function(cfg) {
			var titleReel, contentReel, idx, newTitle, newContent;
			this.resize();
			titleReel = $(this.element).find("> .ui-widget-header > div.title-lens > div.title-reel");
			idx = titleReel.children().size();
			newTitle = $("<div>").html(cfg.title);
			if (cfg.id) {
				newTitle.attr("slidepanel-id", cfg.id);
			}
			newTitle.width(this.options.titleWidth);
			newTitle.height(this.options.titleHeight);
			newTitle.css({
				"float": "left",
				"position": "relative",
				"display": "block",
				"overflow": "hidden",
				"margin-right": this.options.titleWidthDiff
			});
			titleReel.append(newTitle);
			contentReel = $(this.element).find("> .ui-widget-content > div.content-lens > div.content-reel");
			newContent = $("<div>").html(cfg.content);
			if (cfg.id) {
				newContent.attr("slidepanel-id", cfg.id);
			}
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
		},

		removeId: function(id) {
			var currentIdx, idxToRemove, title, content;
			currentIdx = this.getProjectedIndex();
			idxToRemove = this.getIndex(id);
			title = this.getTitleById(id);
			title.remove();
			content = this.getContentById(id);
			content.remove();
			if (currentIdx > -1 && idxToRemove === currentIdx
					&& this.size() > 0) {
				// move to the next panel
				this.showPanelByIndex(currentIdx);
			}
			if (title.size() > 0 || content.size() > 0) {
				$(this.element).trigger("removepanel");
			}
		},

		size: function() {
			return $(this.element).find("> .ui-widget-header > div.title-lens > div.title-reel > div").size();
		},
		
		showPanelByIndex: function(index, onComplete) {
			var titleReel, contentReel, totalFrames, newLeftVal, frames, 
				animDuration = 400, animEasing = "easeOutExpo",
				controls, fwd, back;
			titleReel = $(this.element).find("> .ui-widget-header > div.title-lens > div.title-reel")
			contentReel = $(this.element).find("> .ui-widget-content > div.content-lens > div.content-reel");
			frames = contentReel.children();
			totalFrames = frames.size();
			index = index !== undefined ? index : totalFrames - 1;
			index = Math.min(Math.max(index, 0), totalFrames - 1);
			frames.removeClass("content-projected");
			frames.filter(":eq(" + index + ")").addClass("content-projected");
			newLeftVal = -1 * index * this.options.contentWidth;
			controls = $(this.element).find("> .ui-widget-header > div.controls");
			fwd = controls.find("a:has(> .ui-icon-triangle-1-e)");
			back = controls.find("a:has(> .ui-icon-triangle-1-w)")
			if (index == 0)
				back.addClass("ui-state-disabled");
			else
				back.removeClass("ui-state-disabled");
			if (index == (totalFrames - 1))
				fwd.addClass("ui-state-disabled");
			else
				fwd.removeClass("ui-state-disabled");
			if (!$(this.element).is(":visible")) {
				// no need to animate if the elements isn't shown
				animDuration = 0;
			}
			titleReel.animate({ "left": newLeftVal }, {
				duration: animDuration,
				easing: animEasing
			});
			contentReel.animate({ "left": newLeftVal }, {
				duration: animDuration,
				easing: animEasing,
				complete: function() {
					if (onComplete)
						onComplete.call(onComplete);
				}
			});
		},

		back: function(amount, onComplete) {
			var currentIdx = this.getProjectedIndex();
			this.showPanelByIndex(currentIdx - amount, onComplete);
		},

		forward: function(amount, onComplete) {
			var currentIdx = this.getProjectedIndex();
			this.showPanelByIndex(currentIdx + amount, onComplete);
		},

		clear: function() {
			// this.element.find("> .ui-widget-content > div.panels").empty();
		},

		close: function() {
			$(this.element).trigger("close");
		},
		
		destroy: function() {
			this.element.empty();
		}
	};

	$.widget("ui.slidepanel", SlidePanel);

})(jQuery);