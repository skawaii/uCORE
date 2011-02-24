/**
 * Class: GeController
 * 
 * Interface between CORE event framework and Google Earth instance.
 * Consumes CORE events and handles showing/hiding features on the map 
 * accordingly. 
 * 
 * Namespace:
 *  core.gearth
 * 
 * Properties:
 *  - ge - <GEPlugin>
 *  - kmlObjectStore - <KmlObjectStore> 
 * 
 * Functions:
 *  - add
 *  - show
 *  - hide
 *  - showInfo
 *  - flyTo
 * 
 * Dependencies:
 *  - core.gearth.KmlObjectStore
 */

if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function(ns) {
	var KmlObjectStore = core.gearth.KmlObjectStore;

	var GeController = function(ge) {
		this.ge = ge;
		this.kmlObjectStore = new KmlObjectStore(this.ge);
	};
	GeController.prototype = {

		add: function(geoData) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
			this.ge.getFeatures().appendChild(kmlObject);
		},

		show: function(geoData) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
			this.ge.getFeatures().appendChild(kmlObject);
		},

		hide: function(geoData) {
			var kmlObject = this.kmlObjectStore.getKmlObject(geoData);
			this.kmlObjectStore.removeKmlObject(geoData);
			this.ge.getFeatures().removeChild(kmlObject);
		},
		
		info: function(geoData) {
			throw "Not implemented";
		},
		
		flyTo: function(geoData) {
			throw "Not implemented";
		}
		
	};
	ns.GeController = GeController;
})(window.core.gearth);