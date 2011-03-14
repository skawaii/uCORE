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
			var _this = this;
			var jqueryEl = $(this.el);
			Assert.hasFunction(jqueryEl, "jstree", 
					"jQuery jstree plugin not found");
			jqueryEl.jstree({
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
				plugins: ["ui", "themes", "lazyload", "checkbox"]
			});
		}

	};
	ns.GeoDataTree = GeoDataTree;
})(jQuery, window.core.ui);