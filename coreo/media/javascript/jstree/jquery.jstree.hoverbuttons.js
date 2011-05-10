/**
 * jstree plugin for displaying buttons to the right of a tree node when a 
 * user hovers the node.
 * 
 * Configuration:
 *     getHoverButtons - Function. Returns
 *           { icon: "css-class", tooltip: "tooltip text", action: function }
 *     
 */
(function ($) {
	$.jstree.plugin("hoverbuttons", {
		defaults: {
			getHoverButtons: function(node) {}
		},
		__init : function () {
			/*
			
			var superSelectNode = $.proxy(this.select_node, this);
			this.select_node = function (obj, check, e) {
				if (e && $(e.currentTarget).is("a.jstree-checkbox")) {
					// stop propagation because checkbox was checked, node 
					// wasn't selected
					e.stopPropagation();
				}
				else {
					// checkbox wasn't clicked, so propagate the node selection
					superSelectNode(obj, check, e);
				}
			};
			*/
			
			var container = this.get_container();
			
			this.get_container()
				.bind("open_node.jstree create_node.jstree clean_node.jstree", $.proxy(function (e, data) {
						this._prepare_hoverbuttons(data.rslt.obj);
					}, this))
				.bind("loaded.jstree", $.proxy(function (e) {
						this._prepare_hoverbuttons();
					}, this))
				.delegate("li", "mouseenter", function(e) {
					// e.stopImmediatePropagation();
					if (!$(e.target).is("ul")) {
						container.find("div.jstree-hoverbuttons").hide();
						$(e.target).closest("li:has(> div.jstree-hoverbuttons)")
							.addClass("ui-state-highlight")
							.find("> div.jstree-hoverbuttons").show();
					}
				})
				.delegate("li", "mouseleave", function(e) {
					$(e.target).closest("li:has(> div.jstree-hoverbuttons)")
						.removeClass("ui-state-highlight")
						.find("div.jstree-hoverbuttons").hide();
				});
		},
		__destroy : function () {
			this.get_container().find(".jstree-hoverbuttons").remove();
		},
		_fn : {
			_prepare_hoverbuttons: function(obj) {
				var settings, getHoverButtons, _this = this;
				settings = this._get_settings().hoverbuttons;
				getHoverButtons = settings && settings.getHoverButtons 
					&& typeof settings.getHoverButtons === "function" 
						? settings.getHoverButtons : undefined;
				if (getHoverButtons) {
					obj = !obj || obj == -1 ? this.get_container() : this._get_node(obj);
					if (obj) {
						obj.each(function () {
							$(this).find("li").andSelf().filter("li").not(":has(> div.jstree-hoverbuttons)")
								.each(function() {
									var i, hoverButtons, hoverButtonsEl;
									hoverButtons = getHoverButtons.call(getHoverButtons, $(this));
									if (!$.isArray(hoverButtons)) {
										hoverButtons = [hoverButtons];
									}
									hoverButtonsEl = $("<div>").addClass("jstree-hoverbuttons");
									// appended inside function to account for 
									// javascript's function scope
									var appendButton = function(button) {
										var link = $("<a>").attr("href", "#").attr("title", button.tooltip)
											.addClass("ui-state-default ui-corner-all")
											.append($("<span>").addClass("ui-icon")
													.addClass(button.icon).html("&#160;"))
											.click(function(e) {
												e.preventDefault();
												e.stopPropagation();
												var node = $(e.target).closest("li:has(> div.jstree-hoverbuttons)");
												button.action.call(button.action, node);
											})
											.hover(function() {
													$(this).removeClass("ui-state-default")
														.addClass("ui-state-hover");
												},
												function() {
													$(this).removeClass("ui-state-hover")
														.addClass("ui-state-default");
												});
										
										hoverButtonsEl.append(link);
									};
									for (i = 0; i < hoverButtons.length; i++) {
										appendButton(hoverButtons[i]);
									}
									$(this).prepend(hoverButtonsEl);
									/*
									var wrapper = $("<div>").addClass("jstree-title");
									$(this).children(":not(ul)").wrapAll(wrapper);
									wrapper.append(hoverButtonsEl);
									*/
								});
						});
					}
				}
			}
		}
	});
})(jQuery);