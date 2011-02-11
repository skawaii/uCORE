if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	/**
	 * KmlDomGeoDataContainer
	 */
	var KmlDomGeoDataContainer = function(id, kmlDom, nsPrefix) {
		GeoDataContainer.call(this, id);
		// declare XML namespace prefix
		$(kmlDom.documentElement).attr("xmlns:" + nsPrefix, GeoDataStore.CORE_NS_URI);
		KmlDomGeoDataFeature.call(this, null, id, kmlDom.documentElement, nsPrefix);
		this.kmlDom = kmlDom;
		
	};
	$.extend(KmlDomGeoDataContainer.prototype, 
			GeoDataContainer.prototype,
			KmlDomGeoDataFeature.prototype, {
		getFeatureById: function(id) {
			var self = this;
			var feature = null;
			$("[" + this.nsPrefix + "\\:id=\"" + id + "\"]", this.kmlDom).each(function(index, el) {
				if ($.inArray(this.tagName, KML_FEATURE_ELEMENTS) > -1) {
					feature = new KmlDomGeoDataFeature(self, id, el, self.nsPrefix);
					return false;
				}
				return true;
			});
			return feature;
		}
	});
	ns.KmlDomGeoDataContainer = KmlDomGeoDataContainer;
})(jQuery, window.core.geo);