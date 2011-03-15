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
 *   - core.geo.GeoDataStore
 *   - core.util.Assert
 */

if (!window.core)
	window.core = {};
if (!window.core.ui)
	window.core.ui = {};

(function($, ns) {
	var GeoDataStore = core.geo.GeoDataStore;
	var Assert = core.util.Assert;

	var GeoDataTree = function(geodata, el) {
		Assert.notNull(geodata, "geodata cannot be null");
		Assert.type(geodata, "object", "geodata must be of type core.geo.GeoData");
		Assert.notNull(el, "el cannot be null");
		this.el = el;
		this.geodata = geodata;
		this.init();
	};
	GeoDataTree.GEODATA_ATTR = "core-geodata-id";
	GeoDataTree.prototype = {
		el: null,

		geodata: null,

		onCheck: function(geodata) {},
		
		onUncheck: function(geodata) {},
		
		onSelect: function(geodata) {},

		createTreeNode: function(geodata) {
			Assert.hasFunction(geodata, "getName", 
					"geodata doesn't contain function getName");
			Assert.hasFunction(geodata, "getKmlFeatureType", 
					"geodata doesn't contain function getKmlFeatureType");
			Assert.hasFunction(geodata, "hasChildren", 
					"geodata doesn't contain function hasChildren");
			geodata = GeoDataStore.persist(geodata);
			var treeNode = {};
			var name = geodata.getName();
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

		getGeoDataId: function(treeNode) {
			return $(treeNode).attr(GeoDataTree.GEODATA_ATTR);
		},

		init: function() {
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
					data: this.createTreeNode(this.geodata),
					loadChildren: function(parent, dataFn, completeFn, errorFn) {
						var parentGeoDataId = _this.getGeoDataId(parent);
						var parentGeoData = GeoDataStore.getById(parentGeoDataId);
						Assert.hasFunction(parentGeoData, "iterateChildren", 
								"GeoData with ID " + parentGeoDataId 
								+ " returned from GeoDataStore doesn't "
								+ "contain function iterateChildren");
						parentGeoData.iterateChildren(function(childGeoData) {
							var childNode = _this.createTreeNode(childGeoData);
							dataFn(childNode);
						});
						completeFn();
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
		}

	};
	ns.GeoDataTree = GeoDataTree;
})(jQuery, window.core.ui);