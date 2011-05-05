/**
 * Class: Acoredion
 * 
 * Namespace:
 *   core.ui
 * 
 * Dependencies:
 *   - jQuery
 *   - core.ui.GeoDataTree
 *   - core.events.ShowFeatureEvent
 *   - core.events.HideFeatureEvent
 *   - core.events.FeatureInfoEvent
 *   - core.util.IdSequence
 *   - core.geo.GeoDataStore 
 *   - core.util.GeoDataVisitor
 *   - core.events.GeoDataUnloadedEvent
 */
if (!window.core)
	window.core = {};
if (!window.core.ui)
	window.core.ui = {};

(function($, ns) {
	var IdSequence = core.util.IdSequence;
	if (!IdSequence)
		throw "Dependency not found: core.util.IdSequence";
	var GeoDataTree = core.ui.GeoDataTree;
	if (!GeoDataTree)
		throw "Dependency not found: core.ui.GeoDataTree";
	var ShowFeatureEvent = core.events.ShowFeatureEvent;
	if (!ShowFeatureEvent)
		throw "Dependency not found: core.events.ShowFeatureEvent";
	var HideFeatureEvent = core.events.HideFeatureEvent;
	if (!HideFeatureEvent)
		throw "Dependency not found: core.events.HideFeatureEvent";
	var FeatureInfoEvent = core.events.FeatureInfoEvent;
	if (!FeatureInfoEvent)
		throw "Dependency not found: core.events.FeatureInfoEvent";
	var GeoDataLoadedEvent = core.events.GeoDataLoadedEvent;
	if (!GeoDataLoadedEvent)
		throw "Dependency not found: core.events.GeoDataLoadedEvent";
	var GeoDataUpdateBeginEvent = core.events.GeoDataUpdateBeginEvent;
	var GeoDataUpdateEndEvent = core.events.GeoDataUpdateEndEvent;
	var GeoDataStore = core.geo.GeoDataStore;
	var GeoDataVisitor = core.util.GeoDataVisitor;
	if (!GeoDataVisitor)
		throw "Dependency not found: core.util.GeoDataVisitor";
	var GeoDataUnloadedEvent = core.events.GeoDataUnloadedEvent;
	if (!GeoDataUnloadedEvent)
		throw "Dependency not found: core.events.GeoDataUnloadedEvent";
	
	var findFirstNamedChild = function(geodata) {
		var name = geodata.getName();
		if (!name) {
			var firstChild = null;
			var multipleChildren = false;
			geodata.iterateChildren($.proxy(function(child) {
				if (firstChild) {
					multipleChildren = true;
					return false;
				}
				firstChild = child;
			}, this));
			if (!multipleChildren && firstChild) {
				return findFirstNamedChild(firstChild);
			}
		}
		return geodata;
	};

	/**
	 * Constructor: Acoredion
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   el - HTML DOM Element. Required. Element where accordion will be 
	 *         rendered.
	 *   searchStrategy - <SearchStrategy>. Invoked by the search form.
	 *   eventChannel - <EventChannel>.
	 */
	var Acoredion = function(el, searchStrategy, eventChannel, networkLinkQueue, 
			createLibraryCb, userService, linkService, libraryService) {
		this.el = el;
		this.searchStrategy = searchStrategy;
		this.eventChannel = eventChannel;
		this.networkLinkQueue = networkLinkQueue;
		this.createLibraryCb = createLibraryCb;
		this.userService = userService;
		this.linkService = linkService;
		this.libraryService = libraryService;
		this._init();
	};
	Acoredion.EVENT_PUBLISHER_NAME = "Acoredion";
	Acoredion.prototype = {
		el: null,

		searchStrategy: null,

		treeContainer: null,
		
		treeActionsEl: null,

		searchInput: null,
		
		eventChannel: null,
		
		networkLinkQueue: null,
		
		createLibraryCb: null,

		userService: null,
		
		linkService: null,
		
		libraryService: null,
		
		/**
		 * Property: createLibraryCb
		 * 
		 * Function. Returns a jQuery Deferred object.
		 */
		createLibraryCb: null,
		
		trees: [],

		_getGeoDataCreatorId: function(geodata) {
			var parent, linkLibrary, link;
			if (geodata) {
				if (typeof geodata.getLinkLibrary === "function") {
					linkLibrary = geodata.getLinkLibrary();
					if (linkLibrary && linkLibrary.fields
							&& !!linkLibrary.fields.creator) {
						if (typeof linkLibrary.fields.creator === "object") {
							return linkLibrary.fields.creator.pk;
						}
						else if (typeof linkLibrary.fields.creator === "number"){
							return linkLibrary.fields.creator;
						}
					}
				}
				else if (typeof geodata.getCoreLink === "function") {
					link = geodata.getCoreLink();
					if (link) {
						return link.fields.creator.pk;
					}
				}
				else {
					parent = geodata.getParent();
					if (parent) {
						return this._getGeoDataCreator(parent);
					}
				}
			}
			return null;
		},

		addGeoData: function(geoData) {
			var id = geoData.id + "";
			var name = geoData.getName();
			var geoDataCreatorId = this._getGeoDataCreatorId(geoData);
			var addTree = function(where) {
				var treeEl = $("<div>").addClass("acoredion-tree acoredion-tree-loading ui-state-highlight")
					.attr({ "resultid": id, "resultname": name })
					.prependTo(where);
				where.add(where.prev()).removeClass("ui-helper-hidden");
				treeEl.append($("<span>").html("Loading " + name));
				this._treeLoaded(id, geoData);			
			};
			if (geoDataCreatorId) {
				this.userService.getCurrentUser().then(
						$.proxy(function(currentUser) {
							var treeContainer = this._getTempPlaces();
							if (currentUser && !!currentUser.pk 
									&& currentUser.pk === geoDataCreatorId) {
								treeContainer = this._getMyPlaces();
							}
							addTree.call(this, treeContainer);
						}, this),
						function(error) {
							console.log("Error retrieving current user: " + error);
						}
				);
			}
			else {
				// add to temporary places
				addTree.call(this, this._getTempPlaces());
			}
		},
		
		_geoDataLoadedEventListener: function(event) {
			if (event.publisher !== Acoredion.EVENT_PUBLISHER_NAME) {
				this.addGeoData(event.geoData);
			}
		},

		_getMyPlaces: function() {
			return $(this.el).find("> .ui-widget-content > .acoredion-tree-container:eq(0)");
		},
		
		_getTempPlaces: function() {
			return $(this.el).find("> .ui-widget-content > .acoredion-tree-container:eq(1)");
		},
		
		_beginTree: function(id, name, creatorId) {
			this.userService.getCurrentUser().then(
					$.proxy(function(currentUser) {
						var treeContainer = this._getTempPlaces();
						if (currentUser && !!currentUser.pk 
								&& currentUser.pk === creatorId) {
							treeContainer = this._getMyPlaces();
						}
						treeContainer.add(treeContainer.prev()).removeClass("ui-helper-hidden");
						var treeEl = $("<div>").addClass("acoredion-tree acoredion-tree-loading ui-state-highlight")
							.attr({ "resultid": id, "resultname": name })
							.prependTo(treeContainer);
						treeEl.append($("<span>").html("Loading " + name));						
					}, this),
					function(error) {
						console.log("Error retrieving current user: " + error);
					}
			);
		},

		_treeLoaded: function(id, geodata) {
			geodata = findFirstNamedChild(geodata);
			var treeEl = $(this.el).find("> .ui-widget-content > "
					+ ".acoredion-tree-container "
					+ "div.acoredion-tree-loading[resultid=\"" + id + "\"]");
			var buildTree = $.proxy(function(name) {
				treeEl.removeClass("acoredion-tree-loading ui-state-highlight");
				treeEl.empty();
				var treeContainerName = $.trim(treeEl.closest(".acoredion-tree-container")
						.prev().text());
				var isInMyPlaces = treeContainerName === "My Places";
				var tree = new GeoDataTree(name, geodata, treeEl, this.networkLinkQueue, 
						isInMyPlaces);
				
				tree.onCheck = $.proxy(function(geodata) {
					this.eventChannel.publish(new ShowFeatureEvent(
							Acoredion.EVENT_PUBLISHER_NAME, geodata));
				}, this);
				tree.onUncheck = $.proxy(function(geodata) {
					this.eventChannel.publish(
							new HideFeatureEvent(Acoredion.EVENT_PUBLISHER_NAME, geodata));
				}, this);
				tree.onSelect = $.proxy(function(geodata) {
					var i;
					for (i = 0; this.trees && i < this.trees.length; i++) {
						if (this.trees[i] !== tree) {
							this.trees[i].deselectAll();
						}
					}
					this.eventChannel.publish(
							new FeatureInfoEvent(Acoredion.EVENT_PUBLISHER_NAME, geodata));
				}, this);
				tree.onRemove = $.proxy(function(geodata) {
					var treeEl, _this;
					_this = this;
					// TODO: Only do this if this geodata is owned by the current user
					new GeoDataVisitor({
							link: function(linkGeoData) {
								//  remove link from the library
								new GeoDataVisitor({
									linkLibrary: function(linkLibraryGeoData) {
										this.libraryService.removeLink(
												linkLibraryGeoData.getLinkLibrary().pk,
												linkGeoData.getCoreLink().pk);
									}
								}).visit(linkGeoData.getParent());
							},
							linkLibrary: function(linkLibraryGeoData) {
								_this.libraryService.deleteLibrary(linkLibraryGeoData.getLinkLibrary().pk)
									.then(function() {
											console.log("Library deleted");
										},
										function(error) {
											console.log("Error deleting library: " + error);
										});
							}
						}).visit(geodata);
					if (tree.isEmpty()) {
						treeEl = $(tree.el);
						if (treeEl.siblings().size() === 0) {
							treeEl.parent().add(treeEl.parent().prev()).addClass("ui-helper-hidden");
						}
						treeEl.remove();
					}
					this.eventChannel.publish(new GeoDataUnloadedEvent(Acoredion.EVENT_PUBLISHER_NAME, geodata));
				}, this);
				tree.onEdit = $.proxy(function(geodata) {
					alert("Not implemented: onEdit(" + geodata + ")");
				}, this);
				this.eventChannel.publish(
						new GeoDataLoadedEvent(Acoredion.EVENT_PUBLISHER_NAME, geodata));
				this.trees.push(tree);
			}, this);
			var name = geodata.getName();
			if (!name) {
				geodata.getEnclosingKmlUrl($.proxy(function(url) {
					var slash = url.lastIndexOf('/');
					var end = url.indexOf('.', slash + 1);
					if (end == -1)
						end = url.length();
					name = url.substring(slash + 1, end);
					buildTree(name);
				}, this));
			}
			else {
				buildTree(name);
			}
		},
		
		_treeLoadFailed: function(id, error) {
			var treeEl = $(this.el).find("> .ui-widget-content > "
					+ ".acoredion-tree-container "
					+ "div.acoredion-tree-loading[resultid=\"" + id + "\"]");
			treeEl.empty();
			treeEl.removeClass("acoredion-tree-loading");
			treeEl.removeClass("ui-state-highlight");
			treeEl.addClass("ui-state-error");
			treeEl.append($("<a>").attr("href", "#").css({ "float": "right"})
					.append($("<span>").addClass("ui-icon ui-icon-circle-close"))
					.bind("click", function() {
						treeEl.remove();
					}));
			treeEl.append($("<p>").html("Error loading " + treeEl.attr("resultname") + ": " + error)
					.prepend($("<span>").addClass("ui-icon ui-icon-alert").css({ "float": "left", "margin-right": ".3em" })));
		},

		_addPanel: function(title) {
			var a = $("<a>");
			a.text(title);
			a.attr("href", "#");

			var heading = $("<h3>");
			heading.append(a);
			
			var el = $(this.el);
			el.append(heading);
			
			var content = $("<div>");
			el.append(content);
			
			return content;
		},

		_resultIdSequence: new IdSequence("result-"),
		
		_init: function() {
			$(this.el).addClass("core-acoredion");
			
			// add markup for the skeleton of the accordion panels

			// create KML Documents panel containing the search form and 
			// a place for KML trees
			var content = this._addPanel("Places");
			// create search form
			var searchForm = $("<div>").addClass("acoredion-search").appendTo(content);
			var _this = this;
			var doSearch = function() {
				var searchText = $(_this.searchInput).emptytext("getValue");
				if (!searchText || searchText.length <= 0)
					return;
				var idMap = {};
				_this.searchStrategy.search.call(_this.searchStrategy, 
					searchText, {
					resultBegin: function(id, name, creatorId) {
						var myId = _this._resultIdSequence.nextId();
						idMap["" + id] = myId;
						_this._beginTree.call(_this, myId, name, creatorId);
					},
					resultSuccess: function(id, geodata) {
						var myId = idMap["" + id];
						_this._treeLoaded.call(_this, myId, geodata);
					},
					resultError: function(id, errorThrown) {
						var myId = idMap["" + id];
						_this._treeLoadFailed.call(_this, myId, errorThrown);
					},
					complete: function() {
						console.log("Finished processing results.");
					},
					error: function(errorThrown) {
						console.log("Search error: " + errorThrown);
					}
				});
				$(_this.searchInput).emptytext("clear");
			};
			this.searchInput = $("<input type='text'>").appendTo(searchForm)
					.emptytext({ text: "search" });
			this.searchInput.keypress($.proxy(function(event) {
						// perform search when return key is pressed
						if (event.keyCode == "13") {
							event.preventDefault();
							doSearch();
						}
						// handle tab key when autocomplete is active
						if ( event.keyCode === $.ui.keyCode.TAB &&
								$( event.target ).data( "autocomplete" ).menu.active ) {
							event.preventDefault();
						}
					}, this));
			// configure autocomplete for search text field
			// TODO: add URL to Acoredion constructor
			this.searchInput.autocomplete({
				html: true,
				source: function(request, response) {
					_this.searchStrategy.searchService.getKeywordsLike(request.term)
						.then(function(keywords) {
								var i, value, values = [];
								for (i = 0; i < keywords.length; i++) {
									value = {
										"value": keywords[i].value,
										label: "<span class=\"term-type\">" + keywords[i].type + "</span>"
											+ "<span class=\"term-value\">" + keywords[i].value + "</span>"
									};
									values.push(value);
								}
								response.call(response, values);
							},
							function(error) {
								console.log("Error gettings keywords from server: " + error);
								response.call([]);
							});
				}
			});

	        
			var searchButton = $("<button>").text("Search")
				.appendTo(searchForm)
				.button({
					icons: {
						primary: "ui-icon-search"
					},
					text: false
				}).click($.proxy(doSearch, this));

			// create container for GeoData trees
			content.append($("<h3>", { "class": "ui-helper-hidden", text: "My Places"}))
				.append($("<div>", { "class": "ui-helper-hidden acoredion-tree-container" }))
				.append($("<h3>", { "class": "ui-helper-hidden", text: "Temporary Places" }))
				.append($("<div>", { "class": "ui-helper-hidden acoredion-tree-container" }));

			$("<div>")
				.append($("<button>").text("Create Link Library").button({ icons: { primary: "ui-icon-plusthick" }}))
					.click($.proxy(function() {
						this.createLibraryCb.call(this.createLibraryCb)
							.then($.proxy(function(linkLibraryGeoData) {
								linkLibraryGeoData = GeoDataStore.persist(linkLibraryGeoData);
								this.addGeoData(linkLibraryGeoData);
								this.eventChannel.publish(
										new GeoDataLoadedEvent(Acoredion.EVENT_PUBLISHER_NAME, linkLibraryGeoData));
							}, this));
					}, this))
				.appendTo(content);
			
			$(this.el).accordion({
				fillSpace: true
			});
			
			this.eventChannel.subscribe(GeoDataUpdateBeginEvent.type, $.proxy(function(event) {
				for (var i = 0; i < this.trees.length; i++) {
					var tree = this.trees[i];
					if (tree.containsGeoData(event.geoData.id)) {
						tree.setLoadingStatus(event.geoData.id, true);
					}
				}
			}, this));
			this.eventChannel.subscribe(GeoDataUpdateEndEvent.type, $.proxy(function(event) {
				for (var i = 0; i < this.trees.length; i++) {
					var tree = this.trees[i];
					if (tree.containsGeoData(event.geoData.id)) {
						tree.refresh(event.geoData.id);
						tree.setLoadingStatus(event.geoData.id, false);
						if (event.errorThrown) {
							tree.setErrorStatus(event.geoData.id, true, event.errorThrown);
							// TODO
							// console.log("Error updating network link: " + event.errorThrown);
						}
						else {
							tree.setErrorStatus(event.geoData.id, false);
						}
					}
				}
			}, this));
			this.eventChannel.subscribe(GeoDataLoadedEvent.type, 
					$.proxy(this._geoDataLoadedEventListener, this));
		}
	};
	ns.Acoredion = Acoredion;
})(jQuery, window.core.ui);