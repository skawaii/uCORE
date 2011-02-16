/**
 * Class: KmlDomGeoDataContainer
 * 
 * SuperClass:
 *  <GeoDataContainer>, <KmlDomGeoDataFeature>
 *  
 * A <GeoDataContainer> implementation for XML DOM objects representing KML.
 * 
 * Namespace:
 *  core.geo
 *  
 * Dependencies:
 *  - jQuery
 *  - core.geo.GeoDataContainer
 *  - core.geo.KmlDomGeoDataFeature
 *  - core.geo.GeoDataStore
 *  - core.util.KmlUtils
 */
if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	var GDC = core.geo.GeoDataContainer;
	var KMLGDF = core.geo.KmlDomGeoDataFeature;
	var GDS = core.geo.GeoDataStore;
	var KMLUTILS = core.util.KmlUtils;
	
	var KmlDomGeoDataContainer = function(id, kmlDom) {
		if (!jQuery.isXMLDoc(kmlDom)) {
			throw "parameter must be a non-null XML DOM";
		}
		var rootElement = null;
		if ("documentElement" in kmlDom) {
			rootElement = kmlDom.documentElement;
		}
		else {
			throw "kmlDom parameter must be an XML DOM object";
		}
		var rootElementName = rootElement.tagName;
		if (typeof rootElementName !== "string"
			|| (!/kml/i.test(rootElementName) 
					&& jQuery.inArray(rootElementName, KMLUTILS.KML_FEATURE_ELEMENTS) < 0)) {
			throw "parameter contains invalid KML";
		}
		GDC.call(this, id);
		KMLGDF.call(this, null, id, rootElement);
		this.kmlDom = kmlDom;
	};
	KmlDomGeoDataContainer.fromKmlDom = function(kmlDom) {
		var nsUri = $(kmlDom.documentElement).attr("xmlns:" + KMLGDF.DEFAULT_NS_PREFIX);
		if (nsUri === undefined) {
			// define the namespace prefix
			$(kmlDom.documentElement).attr("xmlns:" + KMLGDF.DEFAULT_NS_PREFIX, KMLGDF.DEFAULT_NS_URI);
		}
		else if (nsUri !== KMLGDF.DEFAULT_NS_URI) {
			throw "Can't create KmlDomGeoDataContainer from this KML document "
				+ "- namespace prefix '" + KMLGDF.DEFAULT_NS_URI + "' is "
				+ "already in use";
		}
		var id = KMLGDF.getIdFromElement(kmlDom.documentElement);
		var container = new KmlDomGeoDataContainer(id, kmlDom);
		GDS.persist(container);
		return container;
	};
	$.extend(KmlDomGeoDataContainer.prototype, 
			GDC.prototype,
			KMLGDF.prototype, {
		getFeatureById: function(id) {
			var self = this;
			var feature = null;
			$("[" + KMLGDF.DEFAULT_NS_PREFIX + "\\:id=\"" + id + "\"]", this.kmlDom).each(function(index, el) {
				if ($.inArray(this.tagName, KMLUTILS.KML_FEATURE_ELEMENTS) > -1) {
					feature = KMLGDF.call({}, self, id, el);
					return false;
				}
				return true;
			});
			return feature;
		}
	});
	ns.KmlDomGeoDataContainer = KmlDomGeoDataContainer;
})(jQuery, window.core.geo);