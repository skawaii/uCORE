if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	/**
	 * GeoDataStore
	 * 
	 * A repository for GeoDataFeature objects.
	 */
	var GeoDataStore = {
		
		CORE_NS_URI: "urn:core:client-data",
		CORE_NS_PREFIX: "core-ext-111",
		
		generateId: function() {
			var idExists = function(id) {
				for (var existingId in store) {
					if (existingId === id || store[existingId].getFeatureById(id)) {
						return true;
					}
				};
				return false;
			};
			var id = null;
			do {
				id = idSequence.nextId();
			}
			while (idExists(id));
			return id;
		},
		
		createFromKmlString: function(kmlString) {
			if (!(typeof kmlString === "string")) {
				throw "parameter must be a non-null string";
			}
			var kmlDom = core.util.createXmlDoc(kmlString);
			return this.createFromKmlDom(kmlDom);
		},
		
		createFromKmlDom: function(kmlDom) {
			if (!jQuery.isXMLDoc(kmlDom)) {
				throw "parameter must be a non-null XML DOM";
			}
			var rootElement = null;
			if ("documentElement" in kmlDom) {
				rootElement = kmlDom.documentElement;
			}
			else if (kmlDom.nodeType === core.util.ELEMENT_NODE_TYPE) {
				// kmlDom is an element
				var xml = core.util.getXmlString(kmlDom);
				kmlDom = core.util.createXmlDoc(xml);
				rootElement = kmlDom.documentElement;
			}
			else {
				throw "parameter contains invalid KML";
			}
			var rootElementName = rootElement.tagName;
			if (typeof rootElementName !== "string"
				|| (!/kml/i.test(rootElementName) 
						&& jQuery.inArray(rootElementName, KML_FEATURE_ELEMENTS) < 0)) {
				throw "parameter contains invalid KML";
			}
			var id = this.generateId();
			// If needed, the namespace prefix can be assigned to something
			// different if it conflicts with a namespace that already exists
			// in the KML document. A more robust way to pick a namespace 
			// prefix would be to search the KML document for all existing 
			// namespace prefixes and then choose a new unique one. However, 
			// that would be a challenge to implement because not all 
			// browsers (IE) support namespaces. So for now, just use a prefix 
			// that isn't likely to exist.
			var geoData = new KmlDomGeoDataContainer(id, kmlDom, this.CORE_NS_PREFIX);
			store[id] = geoData;
			return geoData;
		},
		
		getById: function(id) {
			if (id) {
				for (var existingId in store) {
					if (existingId === id) {
						return store[existingId];
					}
					var feature = store[existingId].getFeatureById(id);
					if (feature) {
						return feature;
					}
				}
			}
			return null;
		},
		
		deleteById: function(id) {
			store[id] = null;
			delete store[id];
		}
	};
	ns.GeoDataStore = GeoDataStore;
})(jQuery, window.core.geo);