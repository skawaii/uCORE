/**
 * A pickier DND plugin.
 */

$.jstree.plugin("pickydnd", {
	__init : function () {
		this.get_container().bind("before.jstree", $.proxy(function(e, data) {
			var draggable, dragTarget;
			if (data.func === "dnd_prepare") {
				this.data.dnd.foreign = true;
			}
			if (data.func === "start_drag") {
				draggable = this._get_settings().pickydnd.draggable || false;
				dragTarget = data.args[0];
				if (typeof draggable === "string") {
					draggable = $(dragTarget).is(draggable);
				}
				if (typeof draggable === "function") {
					draggable = !!draggable.call(draggable, $(dragTarget));
				}
				if (!draggable) {
					e.stopImmediatePropagation();
					return false;
				}
			}
		}, this));
	},
	defaults : {
		draggable: true
	},
	_fn : {
		dnd_prepare : function () {
			if(!r || !r.length) { return; }
			this.data.dnd.off = r.offset();
			if(this._get_settings().core.rtl) {
				this.data.dnd.off.right = this.data.dnd.off.left + r.width();
			}
			if(this.data.dnd.foreign) {
				var a = this._get_settings().dnd.drag_check.call(this, { "o" : o, "r" : r });
				this.data.dnd.after = a.after;
				this.data.dnd.before = a.before;
				this.data.dnd.inside = a.inside;
				console.log(a);
				this.data.dnd.prepared = true;
				return this.dnd_show();
			}
			console.log("Not a foreigner");
			this.prepare_move(o, r, "before");
			this.data.dnd.before = this.check_move();
			this.prepare_move(o, r, "after");
			this.data.dnd.after = this.check_move();
			if(this._is_loaded(r)) {
				this.prepare_move(o, r, "inside");
				this.data.dnd.inside = this.check_move();
			}
			else {
				this.data.dnd.inside = false;
			}
			this.data.dnd.prepared = true;
			return this.dnd_show();
		}
	}
});