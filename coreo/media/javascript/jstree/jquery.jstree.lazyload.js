/**
 * loadChildren:
 *   data = {
 *       attr: Object.
 *       metadata: Object.
 *       state: String. CSS class suffix for jsTree state.
 *       title: String. Text or HTML for node name.
 *       icon: String. CSS class name.
 *   }
 */
(function ($) {
	$.jstree.plugin("lazyload", {
		defaults : { 
			data : false,
			loadChildren: function(obj, dataFn, completeFn, errorFn) {}
		},
		_fn : {
			load_node : function (obj, s_call, e_call) {
				var _this = this;
				var s = this._get_settings().lazyload;
				var parentNode = this._get_node(obj);
				if (!parentNode) {
					return;
				}
				var isRoot = (parentNode === -1);
				if (isRoot) {
					parentNode = this.get_container().children("ul");
					if (parentNode.length === 0) {
						var ul = $("<ul>");
						ul.appendTo(this.get_container());
						parentNode = ul;
					}
					else {
						parentNode.empty();
					}
				}
				else {
					if (parentNode.data("jstree-is-loading")) { 
						return;
					}
					else {
						parentNode.data("jstree-is-loading",true);
						var ul = $("<ul>");
						parentNode.append(ul);
						parentNode = ul;
					}					
				}
				
				var dataCallback = function(data) {
					var childNode = $("<li>");
					if (data) {
						if (data["class"]) {
							childNode.addClass(data["class"]);
						}
						if (data.attr) {
							childNode.attr(data.attr);
						}
						if (data.metadata) {
							childNode.data("jstree", data.metadata);
						}
						if (data.state) {
							if ($.isArray(data.state)) {
								$.each(data.state, function(idx, state) {
									childNode.addClass("jstree-" + state);
								});								
							}
							else {
								childNode.addClass("jstree-" + data.state);
							}
						}
						var title = $("<a>").attr("href", "#")[_this._get_settings().core.html_titles ? "html" : "text"](data.title);
						childNode.append("<ins class='jstree-icon'>&#160;</ins>");
						childNode.append(title);
						if (data.icon) {
							childNode.children("ins").addClass(data.icon);
						}
					}
					parentNode.append(childNode);
				};
				var completeCallback = function() {
					if (!isRoot) {
						parentNode.data("jstree-is-loading", false);
						parentNode.removeClass("jstree-loading");
						var children = parentNode.children("li");
						if (children.length > 0) {
							children.data("jstree-is-loading", false);
							children.each(function() {
								_this.clean_node(this);
							});
						}
						else {
							parentNode.closest("li").find(".jstree-loading").removeClass("jstree-loading");
							parentNode.closest("li").removeClass("jstree-closed").addClass("jstree-open");
						}
					}
					_this.__callback({"obj": obj});
					if(s_call) {
						s_call.call(_this);
					}
				};
				if (isRoot) {
					dataCallback(s.data);
					completeCallback();
				}
				else {
					s.loadChildren(obj, dataCallback, completeCallback, e_call);
				}
			},
			_is_loaded: function(obj) {
				var loaded = obj == -1 || !obj || obj.is(".jstree-open, .jstree-leaf") 
					|| obj.children("ul").children("li").size() > 0;
				return loaded;
			}
		}
	});
})(jQuery);