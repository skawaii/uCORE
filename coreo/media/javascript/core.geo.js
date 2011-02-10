/**
 * The core.geo namespace
 * 
 * Contains classes related to the CORE geospatial object model.
 * 
 * Dependences:
 * 
 *     - jQuery
 *     - core.util
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	/**
	 * GeoDataFeature
	 * 
	 * Represents geospatial data that can be displayed on a map (i.e. KML 
	 * placemark). Instances are created with GeoDataFactory.
	 * 
	 * Properties:
	 * 
	 *      owner:
	 *          GeoDataContainer. Root ancestor that contains this feature.
	 *      id:
	 *          String. An ID unique to all GeoDataFeature instances.
	 *         
	 *  Methods:
	 *  
	 *      walkChildren( callback ):
	 *          Invokes a callback for each GeoDataFeature that is a direct 
	 *          descendent of this object.
	 *          
	 *          Parameters:
	 *              callback:
	 *                  Function. Invoked for each child GeoDataFeature. 
	 *                  Accepts one parameter of type GeoDataFeature. 
	 *          Return:
	 *              void
	 *              
	 *     getKmlString():
	 *         Generates KML text for this object.
	 *         
	 *         Parameters:
	 *             None
	 *         Return:
	 *             String. The KML fragment describing this object.
	 *     
	 *     getKmlDomNode():
	 *         Generates an XML DOM node that is the KML representation of this object.
	 *         
	 *         Parameters:
	 *             None
	 *         Return:
	 *             XML DOM node.
	 */
	var GeoDataFeature = function(owner, id) {
		this.owner = owner;
		this.id = id;
	};
	GeoDataFeature.prototype = {
		getParent: function() {},
		walkChildren: function(callback) {},
		getKmlString: function() {},
		getKmlDomNode: function() {},
	};
	ns.GeoDataFeature = GeoDataFeature;
	
	/**
	 * GeoDataContainer
	 * 
	 * Extends GeoDataFeature. A container for GeoDataFeature objects (i.e. KML document).
	 * 
	 * Methods:
	 *
	 *     getFeatureById():
	 *         Retrieves a GeoDataFeature object by its ID.
	 *         
	 *         Parameters:
	 *             None
	 *         Return:
	 *             GeoDataFeature. Returns null if an object doesn't exist with the ID.
	 */
	var GeoDataContainer = function(id) {
		GeoDataFeature.call(this, null, id);
	};
	$.extend(GeoDataContainer.prototype, GeoDataFeature.prototype, {
		getFeatureById: function(id) {}
	});
	ns.GeoDataContainer = GeoDataContainer;

	// all supported KML namespaces
	var KML_NS = ["http://www.opengis.net/kml/2.2", "http://www.opengis.net/kml/2.2/", 
	              "http://earth.google.com/kml/2.1", "http://earth.google.com/kml/2.1/",
	              ""];
	// all names of supported KML feature elements 
	var KML_FEATURE_ELEMENTS = "kml NetworkLink Placemark PhotoOverlay ScreenOverlay GroundOverlay Folder Document".split(" ");
	
	var isKmlElement = function(node) {
		return (node && ("nodeType" in node) 
				&& (node.nodeType === core.util.ELEMENT_NODE_TYPE)
				&& ("tagName" in node) 
				&& ($.inArray(node.tagName, KML_FEATURE_ELEMENTS) > -1));
	};

	var findNextKmlElementParent = function(node) {
		var ancestors = $(node).parent().closest(KML_FEATURE_ELEMENTS.join(","));
		if (ancestors !== undefined 
				&& ancestors !== null 
				&& "length" in ancestors 
				&& ancestors.length > 0 
				&& "get" in ancestors 
				&& typeof ancestors.get === "function") {
			return ancestors.get(0);
		}
		return null;
	};
	
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
	
	/**
	 * IdSequence
	 */
	var IdSequence = function(prefix) {
		this.prefix = prefix;
		this.idCounter = 0;
	};
	IdSequence.prototype = {
		nextId: function() {
			return "" + this.prefix + this.idCounter++;
		}
	};
	var idSequence = new IdSequence("core-");
	
	// store of GeoDataFeature objects
	var store = {};
	
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