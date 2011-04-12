(function($) {

	var EmptyText = {

		options: {
			text: "Enter a value"
		},

		_init: function() {
			var self = this;
			this.element.focusin(function(event) {
				if (self.element.val() === self.options.text) {
					self.element.val("");
					self.element.removeClass("ui-emptytext-empty");
					self.element.addClass("ui-emptytext-filled");
				}
			});
			var focusout = function() {
				var val = self.element.val().trim();
				if (val === "" || val === self.options.text) {
					self.clear();
				}
				else {
					self.element.addClass("ui-emptytext-filled");
					self.element.removeClass("ui-emptytext-empty");
				}
			};
			this.element.focusout(focusout);
			this.clear();
		},

		getValue: function() {
			var val = this.element.val();
			if (val.trim() === this.options.text) {
				val = "";
			}
			return val;
		},

		clear: function() {
			this.element.val(this.options.text);
			this.element.removeClass("ui-emptytext-filled");
			this.element.addClass("ui-emptytext-empty");
			this.element.blur();
		}

	};

	$.widget("ui.emptytext", EmptyText);

})(jQuery);