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
	var Acoredion = function(el, searchStrategy, eventChannel, networkLinkQueue, createLibraryCb) {
		this.el = el;
		this.searchStrategy = searchStrategy;
		this.eventChannel = eventChannel;
		this.networkLinkQueue = networkLinkQueue;
		this.createLibraryCb = createLibraryCb;
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
		
		/**
		 * Property: createLibraryCb
		 * 
		 * Function. Returns a jQuery Deferred object.
		 */
		createLibraryCb: null,
		
		trees: [],

		_geoDataLoadedEventListener: function(event) {
			if (event.publisher !== Acoredion.EVENT_PUBLISHER_NAME) {
				var id = event.geoData.id + "";
				var name = "";
				var treeEl = $("<div>").addClass("acoredion-tree acoredion-tree-loading ui-state-highlight")
					.attr({ "resultid": id, "resultname": name })
					.prependTo($(this.treeContainer));
				treeEl.append($("<span>").html("Loading " + name));
				this._treeLoaded(id, event.geoData);
			}
		},

		_beginTree: function(id, name) {
			var treeEl = $("<div>").addClass("acoredion-tree acoredion-tree-loading ui-state-highlight")
				.attr({ "resultid": id, "resultname": name })
				.prependTo($(this.treeContainer));
			treeEl.append($("<span>").html("Loading " + name));
		},

		_treeLoaded: function(id, geodata) {
			geodata = findFirstNamedChild(geodata);
			var treeEl = $(this.treeContainer).find("div.acoredion-tree-loading[resultid=\"" + id + "\"]");
			var buildTree = $.proxy(function(name) {
				treeEl.removeClass("acoredion-tree-loading ui-state-highlight");
				treeEl.empty();
				var tree = new GeoDataTree(name, geodata, treeEl, this.networkLinkQueue);
				
				tree.onCheck = $.proxy(function(geodata) {
					this.eventChannel.publish(new ShowFeatureEvent(
							Acoredion.EVENT_PUBLISHER_NAME, geodata));
				}, this);
				tree.onUncheck = $.proxy(function(geodata) {
					this.eventChannel.publish(
							new HideFeatureEvent(Acoredion.EVENT_PUBLISHER_NAME, geodata));
				}, this);
				tree.onSelect = $.proxy(function(geodata) {
					this.eventChannel.publish(
							new FeatureInfoEvent(Acoredion.EVENT_PUBLISHER_NAME, geodata));
				}, this);
				tree.onRemove = $.proxy(function(geodata) {
					// TODO
					console.log("removed " + geodata.id);
					if (tree.isEmpty()) {
						console.log("tree is now empty");
					}
				});
				tree.onRename = $.proxy(function(geodata, newName) {
					// TODO
					console.log("renamed " + geodata.id + " to " + newName);
				});
				/*
				tree.onHover = $.proxy(function(geodata, node) {
					// TODO
					var nodeOffset = node.offset();
					this.treeActionsEl.css({
						"top": nodeOffset.top,
						"left": nodeOffset.left + node.width() - this.treeActionsEl.width()
					});
					this.treeActionsEl.show();
				}, this);
				tree.onDehover = $.proxy(function(geodata, node) {
					this.treeActionsEl.hide();
				}, this);
				*/
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
			var treeEl = $(this.treeContainer).find("div.acoredion-tree-loading[resultid=\"" + id + "\"]");
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
					resultBegin: function(id, name) {
						var myId = _this._resultIdSequence.nextId();
						idMap["" + id] = myId;
						_this._beginTree(myId, name);
					},
					resultSuccess: function(id, geodata) {
						var myId = idMap["" + id];
						_this._treeLoaded(myId, geodata);
					},
					resultError: function(id, errorThrown) {
						var myId = idMap["" + id];
						_this._treeLoadFailed(myId, errorThrown);
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
					}, this));
			var searchButton = $("<button>").text("Search")
				.appendTo(searchForm)
				.button({
					icons: {
						primary: "ui-icon-search"
					},
					text: false
				}).click($.proxy(doSearch, this));
			
			// create container for GeoData trees
			this.treeContainer = $("<div>").addClass("acoredion-tree-container").appendTo(content);

			var afterCreateLibrary = function(library) {
				// TODO
				alert("Library created");
			};

			$("<div>")
				.append($("<button>").text("Create Link Library").button({ icons: { primary: "ui-icon-plusthick" }}))
					.click($.proxy(function() {
						this.createLibraryCb.call(this.createLibraryCb)
							.then(function(library) {
								// TODO
								alert("Library created: " + library);
							});
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