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
 *   - core.util.GeoDataVisitor
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
		throw "Dependency not found: core.geo.KmlFeatureType";
	var GeoDataVisitor = core.util.GeoDataVisitor;
	if (!GeoDataVisitor)
		throw "Dependency not found: core.util.GeoDataVisitor";

	/**
	 * Constructor: GeoDataTree
	 * 
	 * Initializes the object. Renders a tree within the provided DOM element.
	 * 
	 * Parameters:
	 *   geodata - <GeoData>. Required. Root tree node.
	 *   el - HTML DOM Element. Element to contain the tree.
	 */
	var GeoDataTree = function(name, geodata, el, networkLinkQueue, showEditButton) {
		Assert.notNull(geodata, "geodata cannot be null");
		Assert.type(geodata, "object", "geodata must be of type core.geo.GeoData");
		Assert.notNull(el, "el cannot be null");
		this.el = el;
		this.geodata = geodata;
		this.networkLinkQueue = networkLinkQueue;
		this.showEditButton = showEditButton;
		this._init(name);
	};
	/**
	 * Constant: GEODATA_ATTR
	 * 
	 * String. Name of the attribute on a tree node containing the GeoData ID.
	 */
	GeoDataTree.GEODATA_ATTR = "core-geodata-id";
	GeoDataTree.KML_TYPE_ATTR = "core-kml-type";
	GeoDataTree.CORE_NODE_TYPE_ATTR = "core-node-type";
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
		 * Property: onSelect
		 * 
		 * Function. Invoked when a tree node is selected. Function is 
		 * invoked with one parameter - the <GeoData> that was selected.
		 * There is no deselect event. A select event indicates that 
		 * all previously selected nodes were deselected. Only one 
		 * node may be selected at a time.
		 */
		onSelect: function(geodata) {},

		/**
		 * Property: onHover
		 * 
		 * Function. Invoked when a node is hovered.
		 */
		onHover: function(geodata, node) {},
		
		/**
		 * Property: onDehover
		 * 
		 * Function. Invoked after a user stops hovering on a node.
		 */
		onDehover: function(geodata, node) {},
		
		/**
		 * Property: onRemove
		 * 
		 * Function. Invoked after a geodata is removed.
		 */
		onRemove: function(geodata) {},

		/**
		 * Property: onEdit
		 * 
		 * Function. Invoked when an edit button is clicked.
		 */
		onEdit: function(geodata) {},

		deselectAll: function() {
			$(this.el).jstree("deselect_all");
		},

		isCoreLink: function(geodata) {
			return geodata && typeof geodata.getCoreLink === "function";
		},
		
		isCoreLinkLibrary: function(geodata) {
			return geodata && typeof geodata.getLinkLibrary === "function";
		},
		
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
			
			var nodeType = this.isCoreLink(geodata) ? "core-link"
					: this.isCoreLinkLibrary(geodata) ? "core-link-library"
							: geodata.getKmlFeatureType();
				
			var title = $("<span>")
						.append($("<ins>").addClass(nodeType).html("&#160;"))
						.append($("<span>").html(name));
			if (this.appendHoverActions && typeof this.appendHoverActions === "function") {
				var hoverActions = $("<div>").addClass("geodatatree-hoveractions");
				this.appendHoverActions.call(this.appendHoverActions, hoverActions, geodata);
				title.append(hoverActions);
			}
			treeNode.title = title;
			treeNode.attr = {};
			treeNode.attr[GeoDataTree.GEODATA_ATTR] = geodata.id;
			treeNode.attr[GeoDataTree.KML_TYPE_ATTR] = geodata.getKmlFeatureType();
			new GeoDataVisitor({
				link: function() {
					treeNode["class"] = "jstree-draggable";
					treeNode.attr[GeoDataTree.CORE_NODE_TYPE_ATTR] = "Link";
				},
				linkLibrary: function() {
					treeNode["class"] = "jstree-drop";
					treeNode.attr[GeoDataTree.CORE_NODE_TYPE_ATTR] = "LinkLibrary";					
				}
			}).visit(geodata);
			
			if (geodata.hasChildren()) {
				treeNode.state = "closed";
			}
			else {
				treeNode.state = "leaf";
			}
			// treeNode.icon = geodata.getKmlFeatureType();
			return treeNode;
		},

		rename: function(geoDataId, newName) {
			var treeNode = this._findNodeByGeoDataId(geoDataId);
			treeNode.find("> a:eq(1) > span > span")
				.html(newName);
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
			.bind("select_node.jstree", $.proxy(function(e, data) {
				$(this.el).find("li.ui-state-active")
					.removeClass("ui-state-active");
				var selected = data.rslt.obj;
				selected.addClass("ui-state-active");
				var geodata = getGeoDataFromTreeNode(selected);
				if (_this.onSelect) {
					_this.onSelect(geodata);
				}
			}, this))
			.bind("deselect_node.jstree", function(e, data) {
				var deselected = data.rslt.obj;
				deselected.removeClass("ui-state-active");
			})
			.bind("deselect_all.jstree", $.proxy(function(e, data) {
				$(this.el).find("li.ui-state-active").removeClass("ui-state-active");
			}, this))
			.bind("hover_node.jstree", function(e, data) {
				var hovered = data.rslt.obj;
				var geodata = getGeoDataFromTreeNode(hovered);
				if (_this.onHover) {
					_this.onHover(geodata, hovered);
				}
			})
			.bind("dehover_node.jstree", function(e, data) {
				var dehovered = data.rslt.obj;
				var geodata = getGeoDataFromTreeNode(dehovered);
				if (_this.onDehover) {
					_this.onDehover(geodata, dehovered);
				}
			})
			.bind("remove.jstree", function(e, data) {
				var removed = data && data.rslt && data.rslt.obj ? data.rslt.obj : undefined;
				if (removed) {
					var geodata = getGeoDataFromTreeNode(removed);
					if (_this.onRemove) {
						_this.onRemove(geodata);
					}
				}
			})
			.bind("rename.jstree", function(e, data) {
				var node = data.rslt.obj;
				var geodata = getGeoDataFromTreeNode(node);
				var newName = data.rslt.new_name;
				if (_this.onRename) {
					_this.onRename(geodata, newName);
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
							parentGeoData.iterateChildren(function(childGeoData) {
								var name = childGeoData.getName();
								if (!name) {
									name = childGeoData.getKmlFeatureType();
								}
								var childNode = _this._createTreeNode(childGeoData, name);
								dataFn.call(dataFn, childNode);
							},
							function() {
								completeFn.call(completeFn);
							});
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
				hoverbuttons: {
					getHoverButtons: function(node) {
						var kmlType = node.attr(GeoDataTree.KML_TYPE_ATTR);
						var buttons = [];
						if (_this.showEditButton) {
							buttons.push({ 
					        	icon: "ui-icon-pencil", 
					        	tooltip: "Edit", 
					        	action: function(node) {
					        		if (_this.onEdit) {
					        			var geodata = getGeoDataFromTreeNode(node);
					        			_this.onEdit.call(_this.onEdit, geodata);
					        		}
					        	} 
					        });
						}
						buttons.push({ 
				        	icon: "ui-icon-trash", 
				        	tooltip: "Remove", 
				        	action: function(node) {
				        		$(_this.el).jstree("remove", node);
				        	}
				        });
						return buttons;
					}
				},
				dnd: {
					drop_target: false,
					drag_target: false
				},
				crrm: {
					move: {
						always_copy: "multitree",
						check_move: function(m) {
							var hovered, dragged, valid;
							hovered = m.r.closest("li");
							dragged = m.o.closest("li");
							valid = (dragged.is("[" + GeoDataTree.CORE_NODE_TYPE_ATTR + "='Link']")
									&& ((hovered.is("[" + GeoDataTree.CORE_NODE_TYPE_ATTR + "='LinkLibrary']")
											&& (m.p === "inside" || m.p === "first" || m.p === "last"))
										|| (hovered.is("[" + GeoDataTree.CORE_NODE_TYPE_ATTR + "='Link']")
											&& (m.p == "before" || m.p === "after"))));
							return valid;
						}
					}
				},
				plugins: ["ui", "themes", "lazyload", "bettercheckbox", "crrm", "dnd", "hoverbuttons"]
			})
			.bind("before.jstree", function (e, data) { 
				var nms = [], res = true, p, t;
				if(data.func == "move_node") {
					// check uniqueness
					var check_unique = function (nms, p) {
						var cnms = [];
						p.find("> a > span > span").each(function () { cnms.push($(this).text().replace(/^\s+/g,"")); });
						if(!cnms.length || !nms.length) { return true; }
						cnms = cnms.sort().join(",,").replace(/(,|^)([^,]+)(,,\2)+(,|$)/g,"$1$2$4").replace(/,,+/g,",").replace(/,$/,"").split(",");
						if((cnms.length + nms.length) != cnms.concat(nms).sort().join(",,").replace(/(,|^)([^,]+)(,,\2)+(,|$)/g,"$1$2$4").replace(/,,+/g,",").replace(/,$/,"").split(",").length) {
							return false;
						}
						return true;
					};
					if(data.args[4] === true) {
						if(data.args[0].o && data.args[0].o.length) {
							var nms = [], res;
							data.args[0].o.find("> a > span > span").each(
									function () {
										nms.push($(this).text().replace(/^\s+/g,""));
									}
								);
							if (!check_unique(nms, data.args[0].np.find("> ul > li").not(data.args[0].o))) {
								e.stopPropagation();
								return false;
							}
						}
					}
				}
			})
			.bind("move_node.jstree", function(e, data) {
				var linkLibraryGeoData, linkGeoData;
				linkLibraryGeoData = getGeoDataFromTreeNode(data.args[0].r.closest("li"));
				linkGeoData = getGeoDataFromTreeNode(data.args[0].o.closest("li"));
				if (_this.onAppend) {
					_this.onAppend.call(_this.onAppend, linkLibraryGeoData, 
							linkGeoData, data.args[0].cp);
				}				
			});
		},
		
		isEmpty: function() {
			return $(this.el).find("li").size() == 0;
		},

		_findNodeByGeoDataId: function(geoDataId) {
			return $(this.el).find("li[" + GeoDataTree.GEODATA_ATTR + "='" + geoDataId + "']");
		},
		
		containsGeoData: function(geoDataId) {
			var node = this._findNodeByGeoDataId(geoDataId);
			return node.size() > 0;
		},

		setLoadingStatus: function(geoDataId, loading) {
			var node = this._findNodeByGeoDataId(geoDataId);
			var fn = loading ? "addClass" : "removeClass";
			node[fn]("jstree-loading");
		},

		setErrorStatus: function(geoDataId, errorStatus, errorMsg) {
			var node = this._findNodeByGeoDataId(geoDataId);
			var fn = errorStatus ? "addClass" : "removeClass";
			node[fn]("jstree-error");
			if (errorStatus && errorMsg) {
				/*
				
				node.after($("<div>").addClass("ui-state-error ui-corner-all").css({ "display": "none" })
						.append(
							$("<p>").append(
								$("<span>").addClass("ui-icon ui-icon-alert")
									.css({ "float": "left", "margin-right": ".3em"}))
								.text(errorMsg)));
				node.tooltip();
				*/
				this.setTooltip(geoDataId, errorMsg, "ui-state-error");
			}
		},

		setTooltip: function(geoDataId, msg, tipClass) {
			var node = this._findNodeByGeoDataId(geoDataId);
			var nodeLink = node.find("> a[href='#']");
			nodeLink.attr("title", msg);
			nodeLink.tooltip({
				position: "top right",
				"tipClass": tipClass
			});
		},

		refresh: function(geoDataId) {
			var newGeoData = GeoDataStore.getById(geoDataId);
			var nodeToRefresh = this._findNodeByGeoDataId(geoDataId);
			this.el.jstree("refresh", nodeToRefresh);
			console.log(nodeToRefresh);
			console.log("Refreshed " + nodeToRefresh);
		}

	};
	ns.GeoDataTree = GeoDataTree;
})(jQuery, window.core.ui);
