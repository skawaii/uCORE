(function ($) {
	$.jstree.plugin("bettercheckbox", {
		__init : function () {
			// this.select_node = this.deselect_node = this.deselect_all = $.noop;
			// this.get_selected = this.get_checked;

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
			
			this.get_container()
				.bind("open_node.jstree create_node.jstree clean_node.jstree", $.proxy(function (e, data) {
						this._prepare_checkboxes(data.rslt.obj);
					}, this))
				.bind("loaded.jstree", $.proxy(function (e) {
						this._prepare_checkboxes();
					}, this))
				.delegate("a.jstree-checkbox", "click.jstree", $.proxy(function (e) {
						if(this._get_node(e.target).hasClass("jstree-checked")) { this.uncheck_node(e.target); }
						else { this.check_node(e.target); }
						if(this.data.ui) { this.save_selected(); }
						if(this.data.cookies) { this.save_cookie("select_node"); }
						e.preventDefault();
					}, this));
		},
		__destroy : function () {
			this.get_container().find(".jstree-checkbox").remove();
		},
		_fn : {
			_prepare_checkboxes : function (obj) {
				obj = !obj || obj == -1 ? this.get_container() : this._get_node(obj);
				if (obj) {
					var c, _this = this, t;
					obj.each(function () {
						t = $(this);
						var thisChecked = t.is("li") && obj.hasClass("jstree-checked");
						var parentChecked = t.parent().closest("li").hasClass("jstree-checked");
						c = thisChecked || parentChecked ? "jstree-checked" : "jstree-unchecked";
						t.find("li").andSelf().filter("li").not(":has(> a.jstree-checkbox)").find("a:first").before("<a class=\"jstree-checkbox\">&#160;</a>").parent().not(".jstree-checked, .jstree-unchecked").addClass(c);
					});
					if(obj.is("li")) { this._repair_state(obj); }
					else { obj.find("> ul > li").each(function () { _this._repair_state(this); }); }
				}
			},
			change_state : function (obj, state, suppressEvent) {
				obj = this._get_node(obj);
				state = (state === false || state === true) ? state : obj.hasClass("jstree-checked");
				if(state) { obj.find("li").andSelf().removeClass("jstree-checked jstree-undetermined").addClass("jstree-unchecked"); }
				else { 
					obj.find("li").andSelf().removeClass("jstree-unchecked jstree-undetermined").addClass("jstree-checked"); 
					if(this.data.ui) { this.data.ui.last_selected = obj; }
					this.data.bettercheckbox.last_selected = obj;
				}
				obj.parentsUntil(".jstree", "li").each(function () {
					var $this = $(this);
					if(state) {
						if($this.children("ul").children(".jstree-checked, .jstree-undetermined").length) {
							$this.parentsUntil(".jstree", "li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");
							return false;
						}
						else {
							$this.removeClass("jstree-checked jstree-undetermined").addClass("jstree-unchecked");
						}
					}
					else {
						if($this.children("ul").children(".jstree-unchecked, .jstree-undetermined").length) {
							$this.parentsUntil(".jstree", "li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");
							return false;
						}
						else {
							$this.removeClass("jstree-unchecked jstree-undetermined").addClass("jstree-checked");
						}
					}
				});
				if(this.data.ui) { this.data.ui.selected = this.get_checked(); }
				if (suppressEvent !== true) {
					this.__callback(obj);
				}
			},
			check_node : function (obj, suppressEvent) {
				this.change_state(obj, false, suppressEvent);
			},
			uncheck_node : function (obj, suppressEvent) {
				this.change_state(obj, true, suppressEvent);
			},
			check_all : function () {
				var _this = this;
				this.get_container().children("ul").children("li").each(function () {
					_this.check_node(this, false);
				});
			},
			uncheck_all : function () {
				var _this = this;
				this.get_container().children("ul").children("li").each(function () {
					_this.change_state(this, true);
				});
			},

			is_checked : function(obj) {
				obj = this._get_node(obj);
				return obj.length ? obj.is(".jstree-checked") : false;
			},
			get_checked : function (obj) {
				obj = !obj || obj === -1 ? this.get_container() : this._get_node(obj);
				return obj.find("> ul > .jstree-checked, .jstree-undetermined > ul > .jstree-checked");
			},
			get_unchecked : function (obj) { 
				obj = !obj || obj === -1 ? this.get_container() : this._get_node(obj);
				return obj.find("> ul > .jstree-unchecked, .jstree-undetermined > ul > .jstree-unchecked");
			},

			show_checkboxes : function () { this.get_container().children("ul").removeClass("jstree-no-checkboxes"); },
			hide_checkboxes : function () { this.get_container().children("ul").addClass("jstree-no-checkboxes"); },

			_repair_state : function (obj) {
				obj = this._get_node(obj);
				if(!obj.length) { return; }
				var a = obj.find("> ul > .jstree-checked").length,
					b = obj.find("> ul > .jstree-undetermined").length,
					c = obj.find("> ul > li").length;

				if(c === 0) { if(obj.hasClass("jstree-undetermined")) { this.check_node(obj, true); } }
				else if(a === 0 && b === 0) { this.uncheck_node(obj, true); }
				else if(a === c) { this.check_node(obj, true); }
				else { 
					obj.parentsUntil(".jstree","li").removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");
				}
			},
			reselect : function () {
				if(this.data.ui) { 
					var _this = this,
						s = this.data.ui.to_select;
					s = $.map($.makeArray(s), function (n) { return "#" + n.toString().replace(/^#/,"").replace('\\/','/').replace('/','\\/'); });
					this.deselect_all();
					$.each(s, function (i, val) { _this.check_node(val); });
					this.__callback();
				}
			}
		}
	});
})(jQuery);