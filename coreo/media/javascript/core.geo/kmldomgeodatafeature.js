/**
 * Class: KmlDomGeoDataFeature
 * 
 * SuperClass:
 *  <GeoDataFeature>
 *  
 * Dependencies:
 *  - jQuery
 *  - core.geo.GeoDataFeature
 *  - core.util.KmlUtils
 *  - core.util.XmlUtils
 *  - core.geo.GeoDataStore
 *  - core.util.CallbackUtils
 */
if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	var GDF = core.geo.GeoDataFeature;
	var KMLUTILS = core.util.KmlUtils;
	var XMLUTILS = core.util.XmlUtils;
	var GDS = core.geo.GeoDataStore;
	var CBUTILS = core.util.CallbackUtils;
	
	var KmlDomGeoDataFeature = function(owner, id, node) {
		GDF.call(this, owner, id);
		this.node = node;
	};
	KmlDomGeoDataFeature.DEFAULT_NS_URI = "urn:core:client-data";
	KmlDomGeoDataFeature.DEFAULT_NS_PREFIX = "core-ext-111";
	KmlDomGeoDataFeature.getIdFromElement = function(element) {
		return $(element).attr(KmlDomGeoDataFeature.DEFAULT_NS_PREFIX + ":id");
	};
	KmlDomGeoDataFeature.setIdOnElement = function(element, id) {
		$(element).attr(KmlDomGeoDataFeature.DEFAULT_NS_PREFIX + ":id", id);
	};
	$.extend(KmlDomGeoDataFeature.prototype, GDF.prototype, {
		getParent: function() {
			if (this.owner == null) {
				// this is the root
				return null;
			}
			else {
				var parentNode = KMLUTILS.findNextKmlElementParent(this.node);
				if (parentNode != null) {
					var parentId = KmlDomGeoDataFeature.getIdFromElement(parentNode);
					if (parentId === this.owner.id) {
						// parent is the root element
						return this.owner;
					}
					else {
						var parent = new KmlDomGeoDataFeature(this.owner, parentId, parentNode);
						GDS.persist(parent);
						return parent;
					}
				}
				else {
					// this is the root
					return null;
				}
			}
		},
		walkChildren: function(callback) {
			var self = this;
			$(this.node).children().each(function(index, element) {
				var qname = XMLUTILS.getQualifiedName(element);
				if ($.inArray(qname.localName, KMLUTILS.KML_FEATURE_ELEMENTS) >= 0
						&& $.inArray(qname.nsUri, KMLUTILS.KML_NS) >= 0) {
					var owner = self.owner;
					if (owner == null) {
						// this is the owner
						owner = self;
					}
					var id = KmlDomGeoDataFeature.getIdFromElement(element);
					var childFeature = new KmlDomGeoDataFeature(owner, id, element);
					GDS.persist(childFeature);
					CBUTILS.invokeCallback(callback, childFeature);
				}
			});
		},
		getKmlString: function() {
			return XMLUTILS.getXmlString(this.node);
		},
		getKmlDomNode: function() {
			return this.node;
		},
		/**
		 * Invoked by GeoDataStore after the ID is set
		 */
		_postSetId: function() {
			KmlDomGeoDataFeature.setIdOnElement(this.node, this.id);
		}
	});
	ns.KmlDomGeoDataFeature = KmlDomGeoDataFeature;
})(jQuery, window.core.geo);