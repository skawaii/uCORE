/**
 * The core.geo namespace
 * 
 * Contains classes related to the CORE geospatial object model.
 * 
 * Dependences:
 * 
 *     - core.util
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function(ns) {
	var GeoData = function(kmlDom) {
		this._kmlDom = kmlDom;
	};
	GeoData.fromKmlString = function(kmlString) {
		return new GeoData(core.util.createXmlDoc(kmlString));
	};
	GeoData.prototype = {
		getKmlDom: function() {
			return this._kmlDom;
		}
	};
	ns.GeoData = GeoData;
})(window.core.geo);