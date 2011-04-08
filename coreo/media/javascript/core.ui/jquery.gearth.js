/**
 * Class: gearth
 * 
 * jQuery widget plugin for rendering a Google Earth instance.
 */

(function($) {

	var GEarth = {

		EARTH_LOADED: "earthloaded",

		// default options
		options: {
			earth: null
		},

		_init: function() {
			// create Google Earth instance
			var initEarthSuccess = $.proxy(function(geInstance) {
				this.options.earth = geInstance;
				this.options.earth.getWindow().setVisibility(true);
				this.element.trigger(GEarth.EARTH_LOADED, [geInstance]);
			}, this);
			var initEarthFailure = $.proxy(function(errorCode) {
				alert("Google Earth initialization failed. Error Code: " + errorCode);  
			}, this);
			google.earth.createInstance(this.element[0], initEarthSuccess, initEarthFailure);
		}

	};

	$.widget("ui.gearth", GEarth);

})(jQuery);