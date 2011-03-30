/**
 * Class: KmlNodeGeoData
 * 
 * <GeoData> implementation for nodes in a KML document.
 * 
 * Unique IDs are assigned to KML element children when they are read the 
 * first time. This ID is specific to <KmlNodeGeoData> and not associated 
 * with the true XML element ID or the KML feature ID. The reason for this is 
 * that some KML elements might already have IDs assigned to them, and 
 * we cannot guarantee that another KML document won't be loaded in the future
 * with KML IDs that already exist.
 * 
 * SuperClass:
 *  <GeoData>
 *  
 * Properties:
 *   node - XML DOM node. Node from the KML document.
 *   nsPrefix - Namespace prefix assigned to the <KmlNodeGeoData> XML 
 *         namespace in the KML document.
 * 
 * Dependencies:
 *  - jQuery
 *  - core.geo.GeoData
 *  - core.util.KmlUtils
 *  - core.util.XmlUtils
 *  - core.geo.GeoDataStore
 *  - core.util.CallbackUtils
 *  - core.util.Assert
 *  - core.geo.KmlFeatureType
 *  - core.geo.NetworkLinkGeoData
 */
if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	var GeoData = core.geo.GeoData;
	var KmlUtils = core.util.KmlUtils;
	var XmlUtils = core.util.XmlUtils;
	var GeoDataStore = core.geo.GeoDataStore;
	var CallbackUtils = core.util.CallbackUtils;
	var Assert = core.util.Assert;
	var KmlFeatureType = core.geo.KmlFeatureType;
	var NetworkLinkGeoData = core.geo.NetworkLinkGeoData;
	
	var tagNameForKmlFeature = function(kmlFeatureType) {
		if (kmlFeatureType) {
			switch(kmlFeatureType) {
			case KmlFeatureType.NETWORK_LINK:
				return "NetworkLink";
			case KmlFeatureType.PLACEMARK:
				return "Placemark";
			case KmlFeatureType.PHOTO_OVERLAY:
				return "PhotoOverlay";
			case KmlFeatureType.SCREEN_OVERLAY:
				return "ScreenOverlay";
			case KmlFeatureType.GROUND_OVERLAY:
				return "GroundOverlay";
			case KmlFeatureType.FOLDER:
				return "Folder";
			case KmlFeatureType.DOCUMENT:
				return "Document";
			};
		}
		throw "No KML element for " + kmlFeatureType;
	};

	/**
	 * Constructor: KmlNodeGeoData
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   id - String. Unique ID.
	 *   node - XML DOM node. KML document node.
	 *   nsPrefix - Namespace prefix assigned to the <KmlNodeGeoData> 
	 *         XML namespace
	 *   path - String. URL to this KML.
	 */
	var KmlNodeGeoData = function(id, node, nsPrefix, path) {
		GeoData.call(this, id);
		this.path = $.trim(path);
		this.node = node;
		this.nsPrefix = nsPrefix;
		if (this.getKmlFeatureType() === KmlFeatureType.NETWORK_LINK) {
			var linkNode = $(this.node).children("link:first");
			var href = $.trim(linkNode.children("href").text());
			if (href.length > 0 && href.charAt(0) !== '/') {
				// handle relative URL
				if (this.path && this.path.length > 0) {
					if (this.path.charAt(this.path.length - 1) !== '/') {
						href = this.path + '/' + href;
					}
					else {
						href = this.path + href;
					}
				}
				else {
					throw "Must specify base path to KML file to handle " +
							"relative URL in NetworkLink";
				}
			}
			NetworkLinkGeoData.call(this, id, href);
			// $.extend(this, NetworkLinkGeoData.prototype);
			this.refreshMode = $.trim(linkNode.children("refreshMode").text());
			var str = $.trim(linkNode.children("refreshInterval").text());
			if (str && typeof str === "string" && str.length > 0) {
				this.refreshInterval = parseInt(str, 10);
			}
			this.viewRefreshMode = $.trim(linkNode.children("viewRefreshMode").text());
			str = $.trim(linkNode.children("viewRefreshTime").text());
			if (str && typeof str === "string" && str.length > 0) {
				this.viewRefreshTime = parseInt(str, 10);
			}
			str = $.trim(linkNode.children("viewBoundScale").text());
			if (str && typeof str === "string" && str.length > 0) {
				this.viewBoundScale = parseInt(str, 10);
			}
			this.viewFormat = $.trim(linkNode.children("viewFormat").text());
			this.httpQuery = $.trim(linkNode.children("httpQuery").text());
			this.linkData = null;
		}
	};

	/**
	 * Function: fromKmlDoc
	 * 
	 * Creates a <KmlNodeGeoData> instance from a KML document.
	 * 
	 * Parameters:
	 *   kmlDoc - XML DOM. The KML document.
	 *   url - String. URL where document was retrieved from.
	 *   
	 * Returns:
	 *   <KmlNodeGeoData>.
	 */
	KmlNodeGeoData.fromKmlDoc = function(kmlDoc, url) {
		var root = kmlDoc.documentElement;
		var nsPrefix = XmlUtils.declareNamespace(root, KmlNodeGeoData.NS_URI);
		var localName = root.tagName.substring(root.tagName.indexOf(":") + 1).toLowerCase();
		if (localName === "kml") {
			$(root).children().each(function() {
				if (KmlUtils.isKmlElement(this)) {
					root = this;
					return false;
				}
			});
		}
		var kmlNodeGeoData = new KmlNodeGeoData(null, root, nsPrefix, url);
		GeoDataStore.persist(kmlNodeGeoData);
		return kmlNodeGeoData;
	};

	/**
	 * Function: fromKmlString
	 * 
	 * Creates a <KmlNodeGeoData> instance from a KML string.
	 * 
	 * Parameters:
	 *   kmlString - String. KML document text.
	 *   
	 * Returns:
	 *   <KmlNodeGeoData>.
	 */
	KmlNodeGeoData.fromKmlString = function(kmlString) {
		var kmlDoc = XmlUtils.createXmlDoc(kmlString);
		return KmlNodeGeoData.fromKmlDoc(kmlDoc);
	};

	/**
	 * Constant: NS_URI
	 * 
	 * The namespace URI for XML attributes containing data relevant 
	 * to <KmlNodeGeoData>.
	 */
	KmlNodeGeoData.NS_URI = "urn:core:geo:KmlNodeGeoData";

	/**
	 * Function: getIdFromElement
	 * 
	 * Retrieves the <KmlNodeGeoData> ID from a KML element.
	 * 
	 * Parameters:
	 *   element - XML DOM node. The KML element.
	 *   nsPrefix - String. Namespace prefix assigned to the 
	 *         <KmlNodeGeoData> namespace URI.
	 *         
	 * Returns:
	 *   String. <KmlNodeGeoData> ID assigned to the element, or null if no
	 *   ID has been assigned.
	 */
	KmlNodeGeoData.getIdFromElement = function(element, nsPrefix) {
		XmlUtils.assertElement(element);
		if (nsPrefix != null && nsPrefix != undefined) {
			var id = $(element).attr(nsPrefix + ":id");
			if (id != undefined)
				return id;
		}
		return null;
	};
	
	/**
	 * Function: setIdOnElement
	 * 
	 * Sets the <KmlNodeGeoData> ID on a KML element.
	 * 
	 * Parameters:
	 *   element - XML DOM node. KML element.
	 *   id - String. ID to assign.
	 *   nsPrefix - Namespace prefix assigned to the <KmlNodeGeoData>
	 *         namespace URI.
	 */
	KmlNodeGeoData.setIdOnElement = function(element, id, nsPrefix) {
		XmlUtils.assertElement(element);
		if (id == null || id == undefined) {
			$(element).removeAttr(nsPrefix + ":id");
		}
		else {
			$(element).attr(nsPrefix + ":id", "" + id);			
		}
	};
	
	/**
	 * Function: getChildElementById
	 * 
	 * Finds a child KML element with an ID. The ID in this context is the 
	 * KmlNodeGeoData ID, not the true XML element ID nor the KML 
	 * feature ID.
	 * 
	 * Parameters:
	 *   element - XML DOM node. KML element.
	 *   id - String. ID to find.
	 *   nsPrefix - Namespace prefix assigned to the <KmlNodeGeoData>
	 *         namespace URI. 
	 * 
	 * Returns:
	 *   <KmlNodeGeoData>. Null if not found.
	 */
	KmlNodeGeoData.getChildElementById = function(element, id, nsPrefix) {
		XmlUtils.assertElement(element);
		if (id && id != null) {
			Assert.type(id, "string");
			if ($.trim(id).length > 0) {
				var children = $(element).find(KmlUtils.KML_FEATURE_ELEMENTS.join("[" + nsPrefix + "\\:id='" + id + "'],") 
						+ "[" + nsPrefix + "\\:id='" + id + "']");
				return children.length > 0 ? children[0] : null;
			}
		}
		return null;
	};

	$.extend(KmlNodeGeoData.prototype, GeoData.prototype, {

		/**
		 * Property: path
		 * 
		 * String. URL to this KML file.
		 */
		path: null,
		
		/**
		 * Function: getKmlFeatureType
		 * 
		 * See Also:
		 *   <GeoData.getKmlFeatureType>
		 */
		getKmlFeatureType: function() {
			var elName = this.node.tagName;
			return elName.substring(elName.indexOf(":") + 1);
		},
		
		/**
		 * Function: hasChildren
		 * 
		 * See Also:
		 *   <GeoData.hasChildren>
		 */
		hasChildren: function() {
			return ((this.linkData && this.linkData.hasChildren()) 
					|| KmlUtils.hasChildKmlElements(this.node)
					|| this.getKmlFeatureType() === "NetworkLink");
		},

		/**
		 * Function: getName
		 * 
		 * See Also:
		 *   <GeoData.getName>
		 */
		getName: function() {
			var nameNode = $(this.node).find("> name");
			if (nameNode.length > 0) {
				return nameNode.text();
			}
			return null;
		},

		/**
		 * Function: getParent
		 * 
		 * See Also:
		 *   <GeoData.getParent>
		 */
		getParent: function() {
			var parentNode = KmlUtils.findNextKmlElementParent(this.node);
			if (parentNode != null) {
				var parentId = KmlNodeGeoData.getIdFromElement(parentNode, this.nsPrefix);
				var parent = new KmlNodeGeoData(parentId, parentNode, this.nsPrefix, this.path);
				return parent;
			}
			else {
				// this is the root
				return null;
			}
		},

		/**
		 * Function: iterateChildren
		 * 
		 * See Also:
		 *   <GeoData.iterateChildren>
		 */
		iterateChildren: function(callback) {
			if (this.linkData) {
				this.linkData.iterateChildren(callback);
			}
			else {
				var nsPrefix = this.nsPrefix;
				KmlUtils.iterateChildKmlElements(this.node, $.proxy(function(child) {
					var id = KmlNodeGeoData.getIdFromElement(child, nsPrefix);
					var childFeature = new KmlNodeGeoData(id, child, nsPrefix, this.path);
					GeoDataStore.persist(childFeature);
					CallbackUtils.invokeCallback(callback, childFeature);
				}, this));
			}
		},
		
		/**
		 * Function: getChildById
		 * 
		 * See Also:
		 *   <GeoData.getChildById>
		 */
		getChildById: function(id) {
			if (this.linkData) {
				return this.linkData.getChildById(id);
			}
			else {
				var el = KmlNodeGeoData.getChildElementById(this.node, id, this.nsPrefix);
				if (el && el != null) {
					return new KmlNodeGeoData(id, el, this.nsPrefix, this.path);
				}
				return null;
			}
		},

		/**
		 * Function: getKmlString
		 * 
		 * See Also:
		 *   <GeoData.getKmlString>
		 */
		getKmlString: function() {
			return XmlUtils.getXmlString(this.node);
		},

		/**
		 * Function: findByKmlFeatureType
		 * 
		 * See Also:
		 *   <GeoData.findByKmlFeatureType>
		 */
		findByKmlFeatureType: function(kmlFeatureType, callback) {
			if (this.linkData) {
				return this.linkData.findByKmlFeatureType(kmlFeatureType, callback);
			}
			else {
				var tagName = tagNameForKmlFeature(kmlFeatureType);
				var nsPrefix = this.nsPrefix;
				$(this.node).find(tagName).each($.proxy(function(index, el) {
					var id = KmlNodeGeoData.getIdFromElement(el, nsPrefix);
					var childFeature = new KmlNodeGeoData(id, el, nsPrefix, this.path);
					GeoDataStore.persist(childFeature);
					CallbackUtils.invokeCallback(callback, childFeature);
				}, this));
			}
		},
		
		/**
		 * Function: postSave
		 * 
		 * Invoked by GeoDataStore after the ID is set.
		 * Sets the <KmlNodeGeoData> ID on the KML element.
		 * 
		 * See Also:
		 *   <GeoDataStore.persist>
		 */
		postSave: function() {
			KmlNodeGeoData.setIdOnElement(this.node, this.id, this.nsPrefix);
		}
	});
	ns.KmlNodeGeoData = KmlNodeGeoData;
})(jQuery, window.core.geo);