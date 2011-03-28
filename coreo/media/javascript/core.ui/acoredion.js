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
 */
if (!window.core)
	window.core = {};
if (!window.core.ui)
	window.core.ui = {};

(function($, ns) {
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
	var Acoredion = function(el, searchStrategy, eventChannel) {
		this.el = el;
		this.searchStrategy = searchStrategy;
		this.eventChannel = eventChannel;
		this._init();
	};
	Acoredion.EVENT_PUBLISHER_NAME = "Acoredion";
	Acoredion.prototype = {
		el: null,

		searchStrategy: null,

		treeContainer: null,
		
		searchInput: null,
		
		eventChannel: null,
		
		addGeoData: function(geodata, publishEvent) {
			var treeEl = $("<div>").addClass("acoredion-tree").appendTo($(this.treeContainer));
			var tree = new GeoDataTree(geodata, treeEl);
			
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
			if (publishEvent === true) {
				this.eventChannel.publish(
						new GeoDataLoadedEvent(Acoredion.EVENT_PUBLISHER_NAME, geodata));
			}
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

		_init: function() {
			// add markup for the skeleton of the accordion panels

			// create KML Documents panel containing the search form and 
			// a place for KML trees
			var content = this._addPanel("KML Documents");
			// create search form
			var searchForm = $("<div>").addClass("acoredion-search").appendTo(content);
			var _this = this;
			var doSearch = function() {
				var searchText = _this.searchInput.val();
				_this.searchStrategy.search(searchText, {
					result: function(geodata) {
						_this.addGeoData(geodata, true);
					},
					complete: function() {
						console.log("Finished processing results.");
					},
					error: function() {
						console.log("Search error.");
					}
				});
			};
			this.searchInput = $("<input type='text'>").appendTo($("<span>")
					.addClass("acoredion-search-input").appendTo(searchForm));
			this.searchInput.keypress($.proxy(function(event) {
						// perform search when return key is pressed
						if (event.keyCode == "13") {
							event.preventDefault();
							doSearch();
						}
					}, this));
			var searchButton = $("<button>").text("Search")
				.appendTo($("<span>").addClass("acoredion-search-button")
				.appendTo(searchForm))
				.button({
					icons: {
						primary: "ui-icon-search"
					},
					text: false
				}).click($.proxy(doSearch, this));
			
			// create container for GeoData trees
			this.treeContainer = $("<div>").addClass("acoredion-tree-container").appendTo(content);
			
			
			$(this.el).accordion({
				fillSpace: true
			});
			
			this.eventChannel.subscribe(GeoDataUpdateBeginEvent.type, $.proxy(function(geoDataUpdateBeginEvent) {
				// TODO
				console.log("Tree icon should be updated to spinning for " + geoDataUpdateBeginEvent.geoData.id);
			}, this));
			this.eventChannel.subscribe(GeoDataUpdateEndEvent.type, $.proxy(function(geoDataUpdateEndEvent) {
				// TODO
				console.log("Tree node children need to be updated for " + geoDataUpdateEndEvent.geoData.id);
			}, this));
			
			/*
			this.el.append("<h3><a href=\"#\">KML Documents</a></h3>"
					+ "<div>"
					+ "<div id=\"" + searchFormElId + "\" class=\"" + SEARCH_FORM_CLASS + "\">"
					+ "<table><tr>"
					+ "<td><input class=\"" + SEARCH_INPUT_CLASS + "\" id=\"" + searchInputElId + "\" type=\"text\" /></td>"
					+ "<td class=\"buttonContainer\"><button>Search</button></td>"
					+ "</tr></table>"
					+ "</div>"
					+ "<div class=\"" + KMLTREE_CONTAINER_CLASS + "\" id=\"" + kmlDocsElId + "\"></div>"
					+ "</div>"
					+ "<h3><a href=\"#\">Google Earth Layers</a></h3>"
					+ "<div><div id=\"" + layersElId + "\"></div></div>"
					+ "<h3><a href=\"#\">Google Maps Options</a></h3>"
					+ "<div><div id=\"" + optionsElId + "\"></div></div>");
			*/
		}
	};
	ns.Acoredion = Acoredion;
})(jQuery, window.core.ui);