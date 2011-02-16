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
 *  - core.util.Assert
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
	var ASSERT = core.util.Assert;
	
	var KmlDomGeoDataFeature = function(owner, id, node) {
		GDF.call(this, owner, id);
		this.node = node;
	};
	KmlDomGeoDataFeature.NS_URI = "urn:core:geo:KmlDomGeoDataFeature";
	KmlDomGeoDataFeature.getIdFromElement = function(element) {
		var nsPrefix = XMLUTILS.getNamespacePrefixForURI(element, KmlDomGeoDataFeature.NS_URI, true);
		if (nsPrefix != null && nsPrefix != undefined) {
			var id = $(element).attr(nsPrefix + ":id");
			if (id != undefined)
				return id;
		}
		return null;
	};
	KmlDomGeoDataFeature.setIdOnElement = function(element, id) {
		var nsPrefix = XMLUTILS.getOrDeclareNsPrefix(element, KmlDomGeoDataFeature.NS_URI);
		if (id == null || id == undefined) {
			$(element).removeAttr(nsPrefix + ":id");
		}
		else {
			$(element).attr(nsPrefix + ":id", "" + id);			
		}
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
			KMLUTILS.iterateChildKmlElements(this.node, function(element) {
				var owner = self.owner;
				if (owner == null) {
					// this is the owner
					owner = self;
				}
				var id = KmlDomGeoDataFeature.getIdFromElement(element);
				var childFeature = new KmlDomGeoDataFeature(owner, id, element);
				GDS.persist(childFeature);
				CBUTILS.invokeCallback(callback, childFeature);
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