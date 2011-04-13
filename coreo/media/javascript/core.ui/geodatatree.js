/**
 * Class: GeoDataTree
 * 
 * Tree representation of GeoData.
 * 
 * Namespace:
 *   core.ui
 * 
 * Dependencies:
 *   - jQuery
 *   - jsTree
 *   - jsTree lazyload plugin
 *   - jsTree bettercheckbox plugin
 *   - core.geo.GeoDataStore
 *   - core.util.Assert
 *   - core.geo.KmlFeatureType
 */

if (!window.core)
	window.core = {};
if (!window.core.ui)
	window.core.ui = {};

(function($, ns) {
	var GeoDataStore = core.geo.GeoDataStore;
	var Assert = core.util.Assert;
	var KmlFeatureType = core.geo.KmlFeatureType;
	if (!KmlFeatureType)
		throw ("Dependency not found: core.geo.KmlFeatureType");
	
	/**
	 * Constructor: GeoDataTree
	 * 
	 * Initializes the object. Renders a tree within the provided DOM element.
	 * 
	 * Parameters:
	 *   geodata - <GeoData>. Required. Root tree node.
	 *   el - HTML DOM Element. Element to contain the tree.
	 */
	var GeoDataTree = function(name, geodata, el, networkLinkQueue) {
		Assert.notNull(geodata, "geodata cannot be null");
		Assert.type(geodata, "object", "geodata must be of type core.geo.GeoData");
		Assert.notNull(el, "el cannot be null");
		this.el = el;
		this.geodata = geodata;
		this.networkLinkQueue = networkLinkQueue;
		this._init(name);
	};
	/**
	 * Constant: GEODATA_ATTR
	 * 
	 * String. Name of the attribute on a tree node containing the GeoData ID.
	 */
	GeoDataTree.GEODATA_ATTR = "core-geodata-id";
	GeoDataTree.prototype = {
		/**
		 * Property: networkLinkQueue
		 * 
		 * <NetworkLinkQueue>.
		 */
		networkLinkQueue: null,

		/**
		 * Property: el
		 * 
		 * HTML DOM element. Element containing the tree.
		 */
		el: null,

		/**
		 * Property: geodata
		 * 
		 * <GeoData>. Root tree node.
		 */
		geodata: null,

		/**
		 * Property: onCheck
		 * 
		 * Function. Invoked when a tree node is checked. Function is invoked 
		 * with one parameter - the <GeoData> that was checked.
		 */
		onCheck: function(geodata) {},

		/**
		 * Property: onUncheck
		 * 
		 * Function. Invoked when a tree node is unchecked. Function is 
		 * invoked with one parameter - the <GeoData> that was unchecked.
		 */
		onUncheck: function(geodata) {},
		
		/**
		 * Function: onSelect
		 * 
		 * Function. Invoked when a tree node is selected. Function is 
		 * invoked with one parameter - the <GeoData> that was selected.
		 * There is no deselect event. A select event indicates that 
		 * all previously selected nodes were deselected. Only one 
		 * node may be selected at a time.
		 */
		onSelect: function(geodata) {},

		/**
		 * Function: _createTreeNode
		 * 
		 * Generates a tree node object for jsTree from a <GeoData> instance.
		 * 
		 * Parameters:
		 *   geodata - <GeoData>. Required.
		 *   
		 * Returns:
		 *   Object.
		 */
		_createTreeNode: function(geodata, name) {
			Assert.hasFunction(geodata, "getName", 
					"geodata doesn't contain function getName");
			Assert.hasFunction(geodata, "getKmlFeatureType", 
					"geodata doesn't contain function getKmlFeatureType");
			Assert.hasFunction(geodata, "hasChildren", 
					"geodata doesn't contain function hasChildren");
			geodata = GeoDataStore.persist(geodata);
			var treeNode = {};
			if (!name) {
				name = geodata.getKmlFeatureType();
			}
			treeNode.title = "<ins class=\"" + geodata.getKmlFeatureType() + "\">&#160;</ins>" + name;
			treeNode.attr = {};
			treeNode.attr[GeoDataTree.GEODATA_ATTR] = geodata.id;
			if (geodata.hasChildren()) {
				treeNode.state = "closed";
			}
			else {
				treeNode.state = "leaf";
			}
			// treeNode.icon = geodata.getKmlFeatureType();
			return treeNode;
		},

		/**
		 * Function: _getGeoDataId
		 * 
		 * Retrieves the ID of the <GeoData> represented in a tree node.
		 * 
		 * Parameters:
		 *   treeNode - HTML DOM element. Tree node.
		 *   
		 * Returns:
		 *   String. GeoData ID.
		 */
		_getGeoDataId: function(treeNode) {
			return $(treeNode).attr(GeoDataTree.GEODATA_ATTR);
		},

		/**
		 * Function: _init
		 * 
		 * Invoked by the constructor. Renders a jsTree.
		 */
		_init: function(name) {
			var getGeoDataFromTreeNode = function(node) {
				var geodataId = node.attr(GeoDataTree.GEODATA_ATTR);
				var geodata = GeoDataStore.getById(geodataId);
				return geodata;
			};
			var _this = this;
			var jqueryEl = $(this.el);
			Assert.hasFunction(jqueryEl, "jstree", 
					"jQuery jstree plugin not found");
			jqueryEl.bind("change_state.jstree", function(e, data) {
				var geodata = getGeoDataFromTreeNode(data.rslt);
				if (jqueryEl.jstree("is_checked", data.rslt)) {
					if (_this.onCheck) {
						_this.onCheck(geodata);
					}					
				}
				else {
					if (_this.onUncheck) {
						_this.onUncheck(geodata);
					}
				}
			})
			.bind("select_node.jstree", function(e, data) {
				var selected = data.rslt.obj;
				var geodata = getGeoDataFromTreeNode(selected);
				if (_this.onSelect) {
					_this.onSelect(geodata);
				}
			})
			.jstree({
				core: {
					html_titles: true,
					animation: 70
				},
				lazyload: {
					data: this._createTreeNode(this.geodata, name),
					loadChildren: function(parent, dataFn, completeFn, errorFn) {
						var parentGeoDataId = _this._getGeoDataId(parent);
						var parentGeoData = GeoDataStore.getById(parentGeoDataId);
						Assert.hasFunction(parentGeoData, "iterateChildren", 
								"GeoData with ID " + parentGeoDataId 
								+ " returned from GeoDataStore doesn't "
								+ "contain function iterateChildren");
						var iterate = $.proxy(function() {
							console.log("iterate");
							parentGeoData.iterateChildren(function(childGeoData) {
								var name = childGeoData.getName();
								if (!name) {
									name = childGeoData.getKmlFeatureType();
								}
								var childNode = _this._createTreeNode(childGeoData, name);
								dataFn.call(dataFn, childNode);
							});
							completeFn.call(completeFn);
						}, this);
						if (parentGeoData.getKmlFeatureType() === KmlFeatureType.NETWORK_LINK) {
							_this.networkLinkQueue.forceUpdate(parentGeoDataId, iterate);
						}
						else {
							iterate();
						}
					}
				},
				themes: {
					theme: "kml"
				},
				ui: {
					select_limit: 1,
					selected_parent_close: false
				},
				plugins: ["ui", "themes", "lazyload", "bettercheckbox"]
			});
		},
		
		containsGeoData: function(geoDataId) {
			var node = this.el.find("li[" + GeoDataTree.GEODATA_ATTR + "='" + geoDataId + "'");
			return node.length > 0;
		},
		
		setLoadingStatus: function(geoDataId, loading) {
			console.log("Set loading = " + loading + " for geodata " + geoDataId);
			var node = this.el.find("li[" + GeoDataTree.GEODATA_ATTR + "='" + geoDataId + "'");
			var fn = loading ? "addClass" : "removeClass";
			node[fn]("jstree-loading");
		},

		refresh: function(geoDataId) {
			console.log("refresh " + geoDataId);
			var newGeoData = GeoDataStore.getById(geoDataId);
			var nodeToRefresh = this.el.find("li[" + GeoDataTree.GEODATA_ATTR + "='" + geoDataId + "'");
			this.el.jstree("refresh", nodeToRefresh);
		}

	};
	ns.GeoDataTree = GeoDataTree;
})(jQuery, window.core.ui);