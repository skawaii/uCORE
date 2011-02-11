if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	/**
	 * KmlDomGeoDataFeature
	 */
	var KmlDomGeoDataFeature = function(owner, id, node, nsPrefix) {
		GeoDataFeature.call(this, owner, id);
		this.node = node;
		this.nsPrefix = nsPrefix;
		$(this.node).attr(this.nsPrefix + ":id", id);
	};
	$.extend(KmlDomGeoDataFeature.prototype, GeoDataFeature.prototype, {
		getParent: function() {
			if (this.owner == null) {
				// this is the root
				return null;
			}
			else {
				var parentNode = findNextKmlElementParent(this.node);
				if (parentNode != null) {
					var id = $(parentNode).attr(this.nsPrefix + ":id");
					if (id === this.owner.id) {
						// parent is the root element
						return this.owner;
					}
					else {
						return new KmlDomGeoDataFeature(this.owner, id, parentNode, this.nsPrefix);
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
				var qname = core.util.getQualifiedName(element);
				if ($.inArray(qname.localName, KML_FEATURE_ELEMENTS) >= 0
						&& $.inArray(qname.nsUri, KML_NS) >= 0) {
					// assign an ID to this element if it doesn't have one
					var id = $(element).attr(self.nsPrefix + ":id");
					if (!id) {
						id = GeoDataStore.generateId();
						$(element).attr(self.nsPrefix + ":id", id);
					}
					var owner = self.owner;
					if (owner == null) {
						// this is the owner
						owner = self;
					}
					var childFeature = new KmlDomGeoDataFeature(owner, id, element, self.nsPrefix);
					core.util.invokeCallback(callback, childFeature);
				}
			});
		},
		getKmlString: function() {
			return core.util.getXmlString(this.node);
		},
		getKmlDomNode: function() {
			return this.node;
		}
	});
	ns.KmlDomGeoDataFeature = KmlDomGeoDataFeature;
})(jQuery, window.core.geo);