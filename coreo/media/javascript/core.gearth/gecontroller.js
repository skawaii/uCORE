if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function($, ns) {
	/**
	 * Class: GeController
	 * 
	 * Interface between CORE event framework and Google Earth instance.
	 * Consumes CORE events and handles showing/hiding features on the map 
	 * accordingly.
	 */
	var GeController = function(ge) {
		this.ge = ge;
		this.kmlObjectStore = new KmlObjectStore(this.ge);
	};
	GeController.prototype = {

		add: function(geoDataFeature) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoDataFeature);
			this.ge.getFeatures().appendChild(kmlObject);
		},

		show: function(geoDataFeature) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoDataFeature);
			this.ge.getFeatures().appendChild(kmlObject);
		},

		hide: function(geoDataFeature) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoDataFeature);
			this.kmlObjectStore.removeKmlObject(geoDataFeature);
			this.ge.getFeatures().removeChild(kmlObject);
		},
		
		showNodeInfo: function(node, geoData) {
			
		},
		
		flyToNode: function(node, geoData) {
			
		}
		
	};
	ns.GeController = GeController;
})(jQuery, window.core.gearth);