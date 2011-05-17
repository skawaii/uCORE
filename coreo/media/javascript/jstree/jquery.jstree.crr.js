(function ($) {
	$.jstree.plugin("crr", { 
		__init : function () {
			/*
			this.get_container()
				.bind("move_node.jstree", $.proxy(function (e, data) {
					if(this._get_settings().crrm.move.open_onmove) {
						var t = this;
						data.rslt.np.parentsUntil(".jstree").andSelf().filter(".jstree-closed").each(function () {
							t.open_node(this, false, true);
						});
					}
				}, this));
			*/
		},
		defaults : {
			input_width_limit : 200,
			move : {
				always_copy			: false, // false, true or "multitree"
				open_onmove			: true,
				default_position	: "last",
				check_move			: function (m) { return true; }
			}
		},
		_fn : {
			_show_input : function (obj, callback) {
				obj = this._get_node(obj);
				var nameEl = obj.find("> a:last > span:last > span:last");
				nameEl.wrapAll($("<div>").hide());
				var name = nameEl.text();
				
				// disable hover buttons
				obj.mouseout();
				var disableEvent = function(e) { e.stopImmediatePropagation(); };
				obj.bind("mouseenter mouseleave click", disableEvent);
//				obj.mouseenter(disableHover);
	//			obj.mouseleave(disableHover);
				// obj.hover(disableEvent, disableEvent);
		//		obj.click(disableEvent);
				
				// calculate width of input box = the node width - width of 
				// all visible children 
				var inputWidth = obj.innerWidth();
				obj.children(":not(ul)").filter(":visible").each(function() {
					inputWidth -= $(this).outerWidth();
				});
				
				var inputBox = $("<input>", { 
					"value" : name,
					"css" : {
						"padding" : "0",
						"border" : "1px solid silver",
						"height" : (this.data.core.li_height - 2) + "px",
						"lineHeight" : (this.data.core.li_height - 2) + "px",
						"width" : inputWidth + "px"
					},
					"blur" : $.proxy(function () {
						var v = inputBox.val();
						if(v === "") { v = name; }
						inputBox.remove();
						nameEl.unwrap();
						this.set_text(obj,v); // rollback purposes
						this.rename_node(obj, v);
						callback.call(this, obj, v, name);
						obj.unbind("mouseenter mouseleave click", disableEvent);
					}, this),
					"keyup" : function (event) {
						var key = event.keyCode || event.which;
						if(key == 27) { this.value = name; this.blur(); return; }
						else if(key == 13) { this.blur(); return; }
					}
				});
				nameEl.parent().before(inputBox);
				inputBox.focus();
				inputBox.select();
				
				/*
				
				
				
				var rtl = this._get_settings().core.rtl,
					w = this._get_settings().crrm.input_width_limit,
					w1 = obj.children("ins").width(),
					w2 = obj.find("> a:visible > ins").width() * obj.find("> a:visible > ins").length,
					t = this.get_text(obj),
					h1 = $("<div>", { css : { "position" : "absolute", "top" : "-200px", "left" : (rtl ? "0px" : "-1000px"), "visibility" : "hidden" } }).appendTo("body"),
					h2 = obj.css("position","relative").append(
					$("<input>", { 
						"value" : t,
						// "size" : t.length,
						"css" : {
							"padding" : "0",
							"border" : "1px solid silver",
							"position" : "absolute",
							"left"  : (rtl ? "auto" : (w1 + w2 + 4) + "px"),
							"right" : (rtl ? (w1 + w2 + 4) + "px" : "auto"),
							"top" : "0px",
							"height" : (this.data.core.li_height - 2) + "px",
							"lineHeight" : (this.data.core.li_height - 2) + "px",
							"width" : "150px" // will be set a bit further down
						},
						"blur" : $.proxy(function () {
							var i = obj.children("input"),
								v = i.val();
							if(v === "") { v = t; }
							i.remove(); // rollback purposes
							this.set_text(obj,t); // rollback purposes
							this.rename_node(obj, v);
							callback.call(this, obj, v, t);
							obj.css("position","");
						}, this),
						"keyup" : function (event) {
							var key = event.keyCode || event.which;
							if(key == 27) { this.value = t; this.blur(); return; }
							else if(key == 13) { this.blur(); return; }
							else {
								h2.width(Math.min(h1.text("pW" + this.value).width(),w));
							}
						}
					})
				).children("input"); 
				this.set_text(obj, "");
				h1.css({
						fontFamily		: h2.css('fontFamily')		|| '',
						fontSize		: h2.css('fontSize')		|| '',
						fontWeight		: h2.css('fontWeight')		|| '',
						fontStyle		: h2.css('fontStyle')		|| '',
						fontStretch		: h2.css('fontStretch')		|| '',
						fontVariant		: h2.css('fontVariant')		|| '',
						letterSpacing	: h2.css('letterSpacing')	|| '',
						wordSpacing		: h2.css('wordSpacing')		|| ''
				});
				h2.width(Math.min(h1.text("pW" + h2[0].value).width(),w))[0].select();
				*/
			},
			rename : function (obj) {
				obj = this._get_node(obj);
				this.__rollback();
				var f = this.__callback;
				this._show_input(obj, function (obj, new_name, old_name) { 
					f.call(this, { "obj" : obj, "new_name" : new_name, "old_name" : old_name });
				});
			},
			rename_node : function (obj, val) {
				obj = this._get_node(obj);
				this.__rollback();
				if(obj && obj.length && this.set_text.apply(this, Array.prototype.slice.call(arguments))) { this.__callback({ "obj" : obj, "name" : val }); }
			},
			set_text	: function (obj, val) {
				obj = this._get_node(obj);
				if(!obj.length) { return false; }
				var nameEl = obj.find("> a:last > span:last > span:last");
				nameEl.text(val);
				this.__callback({ "obj" : obj, "name" : val });
				/*
				obj = obj.children("a:eq(0)");
				if(this._get_settings().core.html_titles) {
					var tmp = obj.children("INS").clone();
					obj.html(val).prepend(tmp);
					this.__callback({ "obj" : obj, "name" : val });
					return true;
				}
				else {
					obj = obj.contents().filter(function() { return this.nodeType == 3; })[0];
					this.__callback({ "obj" : obj, "name" : val });
					return (obj.nodeValue = val);
				}
				*/
			},
			create : function (obj, position, js, callback, skip_rename) {
				var t, _this = this;
				obj = this._get_node(obj);
				if(!obj) { obj = -1; }
				this.__rollback();
				t = this.create_node(obj, position, js, function (t) {
					var p = this._get_parent(t),
						pos = $(t).index();
					if(callback) { callback.call(this, t); }
					if(p.length && p.hasClass("jstree-closed")) { this.open_node(p, false, true); }
					if(!skip_rename) { 
						this._show_input(t, function (obj, new_name, old_name) { 
							_this.__callback({ "obj" : obj, "name" : new_name, "parent" : p, "position" : pos });
						});
					}
					else { _this.__callback({ "obj" : t, "name" : this.get_text(t), "parent" : p, "position" : pos }); }
				});
				return t;
			},
			remove : function (obj) {
				obj = this._get_node(obj, true);
				this.__rollback();
				this.delete_node(obj);
				this.__callback({ "obj" : obj });
			},
			check_move : function () {
				if(!this.__call_old()) { return false; }
				var s = this._get_settings().crr.move;
				if(!s.check_move.call(this, this._get_move())) { return false; }
				return true;
			},
			move_node : function (obj, ref, position, is_copy, is_prepared, skip_check) {
				var s = this._get_settings().crr.move;
				if(!is_prepared) { 
					if(!position) { position = s.default_position; }
					if(position === "inside" && !s.default_position.match(/^(before|after)$/)) { position = s.default_position; }
					return this.__call_old(true, obj, ref, position, is_copy, false, skip_check);
				}
				// if the move is already prepared
				if(s.always_copy === true || (s.always_copy === "multitree" && obj.rt.get_index() !== obj.ot.get_index() )) {
					is_copy = true;
				}
				this.__call_old(true, obj, ref, position, is_copy, true, skip_check);
			},

			cut : function (obj) {
				obj = this._get_node(obj);
				this.data.crr.cp_nodes = false;
				this.data.crr.ct_nodes = false;
				if(!obj || !obj.length) { return false; }
				this.data.crr.ct_nodes = obj;
			},
			copy : function (obj) {
				obj = this._get_node(obj);
				this.data.crr.cp_nodes = false;
				this.data.crr.ct_nodes = false;
				if(!obj || !obj.length) { return false; }
				this.data.crr.cp_nodes = obj;
			},
			paste : function (obj) { 
				obj = this._get_node(obj);
				if(!obj || !obj.length) { return false; }
				if(!this.data.crr.ct_nodes && !this.data.crr.cp_nodes) { return false; }
				if(this.data.crr.ct_nodes) { this.move_node(this.data.crr.ct_nodes, obj); }
				if(this.data.crr.cp_nodes) { this.move_node(this.data.crr.cp_nodes, obj, false, true); }
				this.data.crr.cp_nodes = false;
				this.data.crr.ct_nodes = false;
			}
		}
	});
	// include the crr plugin by default
	$.jstree.defaults.plugins.push("crr");
})(jQuery);