// Core Javascript

(function(window, $) {
	var idSeed = 0;

	var core = {

			/**
			 * Creates a new unique DOM element ID
			 */
			generateId: function() {
				var prefix = "core-";
				var id = null;
				do {
					id = prefix + ++idSeed;
				} while ($("#" + id).length > 0);
				return id;
			},

			/**
			 * Creates an array from the parameter
			 */
			asArray: function(obj) {
				var arr = [];
				if (jQuery.isArray(obj)) {
					for (var i = 0; i < obj.length; i++) {
						if (obj[i]) {
							arr.push(obj[i]);
						}
					}
				}
				else if (obj) {
					arr.push(obj);
				}
				return arr;
			},

			/**
			 * Generates a string describing the properties of an object
			 */
			describe: function(obj, includeFunctions) {
				var str = "";
				for (var p in obj) {
					var t = typeof obj[p];
					if (t !== "function" || includeFunctions === true) {
						str += t + " " + p;
						if (t !== "function") {
							str += " = " + obj[p];
						}
						str += "\n";
					}
				}
				return str;
			},
			
			isOrContains: function(container, contained) {
				return jQuery.contains(container, contained.get(0))
					|| (container && contained && $(container).get(0) == $(contained).get(0));
			}

	};

	return (window.core = core);
})(window, jQuery);


/**
 * emptytext jQuery plugin.
 * 
 * Sets the contents of a text input to a special value when it is empty.
 * 
 * Options:
 * 
 *     text: Required. Special value with which to fill the text input.
 *     
 *     cssClass: CSS class added to input element when it contains the 
 *         special value
 *         
 * Methods:
 * 
 *     getValue: Returns the value of the input. If the value of the 
 *         input is the special/default value, empty string is returned.
 *         
 *     clear: Resets the value of the input to the special value.
 */
(function($) {

	var EmptyText = {

		options: {
			text: "Enter a value",
			cssClass: "ui-emptytext"
		},

		_init: function() {
			var self = this;
			this.element.focusin(function(event) {
				self.element.removeClass(self.options.cssClass);
				if (self.element.val() === self.options.text) {
					self.element.val("");
				}
			});
			var focusout = function() {
				var val = self.element.val().trim();
				if (val === "" || val === self.options.text) {
					self.clear();
				}
			};
			this.element.focusout(focusout);
			this.clear();
		},

		getValue: function() {
			var val = this.element.val();
			if (val.trim() === this.options.text) {
				val = "";
			}
			return val;
		},

		clear: function() {
			this.element.val(this.options.text);
			this.element.addClass(this.options.cssClass);
			this.element.blur();
		}

	};

	$.widget("ui.emptytext", EmptyText);

})(jQuery);


/**
 * ResizableLeftColumn jQuery plugin
 * 
 * Makes an element resizable, while synchronizing the resize of an element 
 * to the right so that it grows by the same amount this element shrinks. 
 * Assumes absolute positioning of right column element.
 * 
 * Options:
 *
 *     rightColumn: the element that is the column to the right of the 
 *         resizable element
 */
(function($) {

	var ResizableLeftColumn = {

		options: {
			rightColumn: null,
			minWidth: 10
		},

		_init: function() {
			var rightColumn = $(this.options.rightColumn);
			var self = this;
			var resizeRightColumn = function() {
				var leftColWidth = self.element.outerWidth(true);
				var totalWidth = self.element.parent().innerWidth();
				var borderWidth = self.element.outerWidth(true) - self.element.outerWidth(false);
				var newRightColWidth = totalWidth - leftColWidth - borderWidth;
				rightColumn.css({width: newRightColWidth + "px"});
				return true;
			};
			this.element.resizable({
				handles: "e",
				minWidth: this.options.minWidth,
				resize: function() {
					resizeRightColumn();
				}
			});
		}

	};

	$.widget("ui.resizableleftcolumn", ResizableLeftColumn);

})(jQuery);


/**
 * FitWindow jQuery plugin
 * 
 * Makes an element resize to fit the width and height of the browser window.
 * 
 * Options:
 * 
 *     heightOffset: number of pixels subtracted from the window height to 
 *         calculate the height of the element
 *     
 *     widthOffset: number of pixels subtracted from the window width to 
 *         calculate the width of the element
 */
(function($) {

	var FitWindow = {

		options: {
			heightOffset: 0,
			widthOffset: 0
		},

		_init: function() {
			var heightOffset = typeof this.options.heightOffset == "number" 
								? this.options.heightOffset : 0;
			heightOffset += (this.element.outerHeight(true) - this.element.outerHeight(false));
			var widthOffset = typeof this.options.widthOffset == "number"
								? this.options.widthOffset : 0;
			widthOffset += (this.element.outerWidth(true) - this.element.outerWidth(false));
			var self = this;
			self.element.css({ "width": "100%" });
			var doResize = function() {
				var windowHeight = $(window).height();
				var myHeight = windowHeight - heightOffset;
				self.element.height(myHeight);
				self.element.resize();
			};
			$(window).resize(function(event) {
				doResize();
			});
			doResize();
		}

	};

	$.widget("ui.fitwindow", FitWindow);

})(jQuery);


/**
 * GEarth jQuery widget
 * 
 * Renders a Google Earth plugin instance. 
 * 
 * Options:
 * 
 *     earth: GE plugin instance
 *     
 * Callbacks:
 * 
 *     earthLoaded: invoked after GE plugin instance is created
 * 
 * Typical usage:
 *     
 *     <div id="ge"></div>
 *     ...
 *     // Create a new Google Earth widget
 *     $("#ge").gearth({
 *         earthLoaded: function(event, data) {
 *             // data.earth = GE plugin instance
 *         }
 *     });
 *     ...
 *     // Retrieve the GE plugin instance from the widget
 *     $("#ge").gearth("earth");
 */
(function($) {

	var GEarth = {

		EARTH_LOADED: "earthLoaded",

		// default options
		options: {
			earth: null
		},

		_init: function() {
			var self = this;
			// create Google Earth instance
			var initEarthSuccess = function(geInstance) {
				self.options.earth = geInstance;
				self.options.earth.getWindow().setVisibility(true);
				self._trigger(GEarth.EARTH_LOADED, 0, {earth: self.options.earth});
			};
			var initEarthFailure = function(errorCode) {
				alert("Google Earth initialization failed. Error Code: " + errorCode);  
			};
			google.earth.createInstance(self.element[0], initEarthSuccess, initEarthFailure);
		},

	};

	$.widget("ui.gearth", GEarth);

})(jQuery);

/**
 * GMaps jQuery widget
 * 
 * Renders a Google Maps plugin instance. 
 * 
 * Options:
 * 
 *     maps: GMaps plugin instance
 *     
 * Callbacks:
 * 
 *     mapsLoaded: invoked after GMaps plugin instance is created
 * 
 * Typical usage:
 *     
 *     <div id="gm"></div>
 *     ...
 *     // Create a new Google Maps widget
 *     $("#gm").gmaps({
 *         mapsLoaded: function(event, data) {
 *             // data.earth = Maps plugin instance
 *         }
 *     });
 *     ...
 *     // Retrieve the GMaps plugin instance from the widget
 *     $("#gm").gmaps("maps");
 */
(function($) {

	var GMaps = {

		MAPS_LOADED: "mapsLoaded",

		// default options
		options: {
			maps: null,
			mapsContainerElId : null
			
		},

		_init: function() {
			var self = this;
	
		
			var mapsContainerElId = self.options.mapsContainerElId;
			var map = new GMap2(document.getElementById(mapsContainerElId), { size: new GSize(800,800) } );

			GEvent.addListener(map, "load", function() {
 				alert("maps loaded");

				self._trigger(GMaps.MAPS_LOADED, 0, {maps: self.options.maps});

			});
			self.options.maps = map;
	 		map.setCenter(new GLatLng(37.4419, -122.1419), 13);
			var customUI = map.getDefaultUI();
       			// Remove MapType.G_HYBRID_MAP
       			customUI.maptypes.hybrid = false;
      			map.setUI(customUI);


					
			
		
		},

	};

	$.widget("ui.gmaps", GMaps);

})(jQuery);



/**
 * KmlAccordion jQuery plugin.
 * 
 * Renders an accordion panel with sections for KML Documents, Google Earth
 * Layers, and Google Earth Options.
 * 
 * Options:
 * 
 *     gex: Required. GEarthExtensions object.
 *     
 *     mapElement: Required. The element containing the GE plugin instance.
 *     
 *     kmlDocs: Optional. Array of URLs to KML files to initially display 
 *         in the KML Documents pane.
 *     
 *     layersKml: Required. URL to KML file containing GE layers.
 *     
 *     optionsKml: Required. URL to KML file containing GE display options.
 *     
 * Methods:
 * 
 *     addKml(kmlUrl, kmlLoadedCallback): Load a KML URL.
 *         Parameters:
 *             kmlUrl: Required. URL to the KML file to load.
 *             KmlLoadedCallback: Optional. Function invoked after KML file 
 *                 finishes loading.
 *             
 */
(function($) {

	var SEARCH_FORM_CLASS = "kmlaccordion-searchform";

	var SEARCH_INPUT_CLASS = "kmlaccordion-searchinput";

	var KMLTREE_CONTAINER_CLASS = "ui-kmlaccordion-kmltreecontainer";

	var KmlAccordion = {

		options: {
			gex: null,
			mapElement: null,
			kmlDocs: [],
			layersKml: null,
			optionsKml: null,
			kmlDocsContainerElId: null
		},

		_init: function() {
			this.element.addClass("ui-widget");
			this.element.addClass("ui-kmlaccordion");

			// kmlDocsElId is the ID of the element that contains the search
			// form and the kml trees
			var kmlDocsElId = core.generateId();
			// searchFormElId is the ID of the element containing the search
			// form
			var searchFormElId = core.generateId();
			// searchInputElId is the ID of the search textfield element
			var searchInputElId = core.generateId();
			// layersElId is the ID of the kmltree element with GE layers
			var layersElId = core.generateId();
			// optionsElId is the ID of the kmltree element with GE options
			var optionsElId = core.generateId();

			// add markup for the skeleton of the accordion panels
			this.element.append("<h3><a href=\"#\">KML Documents</a></h3>"
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

			this.element.accordion({
				fillSpace: true
			});

			var self = this;

			// create search box

			$("#" + searchInputElId).emptytext({
				text: "search"
			});
			var doSearch = function() {
				if ($("#" + searchInputElId).emptytext("getValue").trim().length == 0) {
					// do nothing - no search text entered
					return;
				}

				var searchTxt = $("#" + searchInputElId).val();

		        var showLoading = function(msg, el){
		            var h = $('<div class="kmltree-loading" style=\"position:relative;\"><span style=\"white-space: nowrap; overflow: hidden\">' + 
		                msg + '</span></div>');
		            el.append(h).effect("slide", { }, 200, null);
		        };

				var showPrefixRegex = /^show[\s:-=]+/i;
		        if (searchTxt.match('^http')) {
		        	self.addKml(searchTxt);
		        } else if (searchTxt.match(showPrefixRegex)) {
		        	searchTxt = searchTxt.replace(showPrefixRegex, "");
		        	var kmlTreeEl = self._createNewKmlTreeEl();
		        	kmlTreeEl.height(95);
		        	showLoading("Searching for " + searchTxt, kmlTreeEl);
		        	$.ajax({
		        		type: "GET",
		        		url: "../search-mongo/",
		        		data: { q: searchTxt },
		        		success: function(response) {
		        			// response will be a URL to a KMZ
		        			kmlTreeEl.empty();
		        			kmlTreeEl.css({ height: "auto" });
		        			self._addKmlToEl(response.responseText, kmlTreeEl);
		        		},
		        		error: function(req, status, err) {
		        			kmlTreeEl.html("<span>Error searching for " + searchTxt + "</span>");
		        			kmlTreeEl.css({ height: "auto" });
		        		}
		        	});
		        } else {
		        	var kmlTreeEl = self._createNewKmlTreeEl();
		        	kmlTreeEl.height(95);
		        	showLoading("Searching for " + searchTxt, kmlTreeEl);
		        	$.ajax({
		        		type: "GET",
		        		url: "../search-links/",
		        		data: { q: searchTxt },
		        		success: function(response) {
		        			// here, the response is an HTML doc. how do we display that?
		        			kmlTreeEl.css({ height: "auto" });
		        			kmlTreeEl.html(response);
		        		},
		        		error: function(req, status, err) {
		        			kmlTreeEl.html("<span>Error searching for " + searchTxt + "</span>");
		        			kmlTreeEl.css({ height: "auto" });
		        		}
		        	});
		        }

		        $("#" + searchInputElId).emptytext("clear");
			};
			$("#" + searchInputElId).keypress(function(event) {
				// perform search when return key is pressed
				if (event.keyCode == "13") {
					event.preventDefault();
					doSearch();
				}
			});

			var searchButtonEl = $("#" + searchFormElId + " button");
			searchButtonEl.button({
				icons: {
					primary: "ui-icon-search"
				},
				text: false
			});
			searchButtonEl.click(doSearch);

			var resizeSearchForm = function() {
				var searchFormWidth = $("#" + searchFormElId).innerWidth();
				var searchButtonWidth = searchButtonEl.outerWidth(true);
				var searchTxtWidth = searchFormWidth - searchButtonWidth - ($("#" + searchInputElId).outerWidth(true) - $("#" + searchInputElId).outerWidth(false));
				$("#" + searchInputElId).width(searchTxtWidth + "px");
			};
			resizeSearchForm();

			this.element.resize(function(event) {
				self.element.accordion("resize");
				resizeSearchForm();
			});


			//this._resizeSearchForm();
			
			this.options.kmlDocsContainerElId = kmlDocsElId;

			// create kmltree object for the Google Earth Layers panel
			var layersKmlTree = kmltree({
				url: this.options.layersKml,
				element: $("#" + layersElId),
				gex: this.options.gex,
				mapElement: this.options.mapElement,
				supportItemIcon: true,
				restoreState: true,
				showTitle: false
			});
			$(layersKmlTree).bind("kmlLoaded", function(event, kmlObject) {
				$(layersKmlTree).unbind("kmlLoaded");
				enableGoogleLayersControl(layersKmlTree, self.options.gex.pluginInstance);
				// create kmltree object for the Google Earth Options panel
				var optionsKmlTree = kmltree({
					url: self.options.optionsKml,
					element: $("#" + optionsElId),
					gex: self.options.gex,
					mapElement: self.options.mapElement,
					supportItemIcon: true,
					restoreState: true,
					showTitle: false
				});
				$(optionsKmlTree).bind("kmlLoaded", function(event, kmlObject) {
					$(optionsKmlTree).unbind("kmlLoaded");
					enableGoogleLayersControl(optionsKmlTree, self.options.gex.pluginInstance);
					// create kmltree objects for the KML Documents panel
					var kmlDocs = core.asArray(self.options.kmlDocs);
					for (var i = 0; i < kmlDocs.length; i++) {
						self.addKml(kmlDocs[i]);
					}
				});
				optionsKmlTree.load();

			});
			layersKmlTree.load();
		},

		
		resize: function() {
			this.element.accordion("resize");
		},
		
		_addKmlToEl: function(kmlUrl, kmlTreeEl, kmlLoadedCallback) {
			var visitedRoot = false;
			var newKmlTree = kmltree({
				url: kmlUrl,
				element: kmlTreeEl,
				gex: this.options.gex,
				mapElement: this.options.mapElement,
				supportItemIcon: true,
				displayDocumentRoot: true,
				showTitle: false,
				visitFunction: function(kmlObject, config) {
					config.customClass = "root-heading";
					// config.open = false;
					if (visitedRoot && config.type === "KmlNetworkLink") {
						config.listItemType = "checkHideChildren";
					}
					visitedRoot = true;
					return config;
				}
			});
			if (typeof kmlLoadedCallback == "function") {
				var self = this;
				var unbindAfterInvoke = function(event, kmlObject) {
					$(newKmlTree).unbind("kmlLoaded");
					kmlLoadedCallback.apply(self, [event, kmlObject]);
				};
				$(newKmlTree).bind("kmlLoaded", unbindAfterInvoke);
			}
			newKmlTree.load();
		},

		_createNewKmlTreeEl: function() {
			var el = $("#" + this.options.kmlDocsContainerElId);
			var kmlTreeElId = core.generateId();
			el.prepend("<div id=\"" + kmlTreeElId + "\"></div>");
			return $("#" + kmlTreeElId);
		},

		addKml: function(kmlUrl, kmlLoadedCallback) {
			var kmlTreeEl = this._createNewKmlTreeEl();
			this._addKmlToEl(kmlUrl, kmlTreeEl, kmlLoadedCallback);
			kmlTreeEl.effect("slide", {}, 200, null);
		}

	};

	$.widget("ui.kmlaccordion", KmlAccordion);

})(jQuery);


/**
 * GEarthApp jQuery plugin.
 * 
 * A widget containing a large right panel with a Google Earth plugin instance
 * and a left accordion panel with KML documents, layers, and options to 
 * control the Google Earth instance.
 * 
 * Options:
 *     
 *     kmlDocs: Optional. Array of URLs to KML files that should be displayed 
 *         in the KML Documents pane at startup.
 *         
 *     layersKml: Required. URL to a KML file containing GE layers.
 *     
 *     optionsKml: Required. URL to a KML file containg GE options.
 */
(function($) {

	var GEarthApp = {

		options: {
			kmlDocs: [],
			layersKml: null,
			optionsKml: null
		},

		_init: function() {
			// write markup - left panel for KML trees and right panel for Google 
			// Earth instance
			var containerEl = this.element;
			containerEl.addClass("gearthapp");
			var controlPanelElId = core.generateId();
			var collapserElId = core.generateId();
			var kmlAccordionElId = core.generateId();
			var earthPanelElId = core.generateId();

			// iframe exists to implement the "iframe shim" strategy for 
			// overlaying elements on the GE plugin instance
			containerEl.append("<iframe src=\"javascript:false\" frameborder=\"0\" class=\"core-controlpanel\">" +
								"</iframe>" +
								"<div class=\"ui-widget ui-widget-header core-controlpanel-collapsed\">" +
									"<span class=\"ui-icon ui-icon-circle-triangle-e\"></span>" +
								"</div>" +
								"<div id=\"" + controlPanelElId + "\" class=\"gearthapp-controlpanel\">" +
									"<div>" +
										"<div class=\"ui-widget ui-widget-header collapser\">" +
											"<span class=\"ui-icon ui-icon-circle-triangle-w\"></span>" +
										"</div>" +
										"<div>" +
											"<div id=\"" + kmlAccordionElId + "\"></div>" +
										"</div>" +
									"</div>" +
								"</div>" +
								"<div id=\"" + earthPanelElId + "\" class=\"gearthapp-earthpanel\"></div>");
			var controlPanel = $("#" + controlPanelElId);
			var contentToCollapse = $("#" + controlPanelElId).find("div:first-child");
			var iframeShim = containerEl.find("iframe");
			iframeShim.width(0);
			var collapseControl = contentToCollapse.find("> div:first-child");
			var expandControl = containerEl.find("> div.core-controlpanel-collapsed");
			expandControl.mouseenter(function() { $(this).addClass("ui-state-hover"); });
			expandControl.mouseleave(function() { $(this).removeClass("ui-state-hover"); });
			expandControl.hide();
			var accordionContainer = collapseControl.next();
			collapseControl.mouseenter(function() { $(this).addClass("ui-state-hover"); });
			collapseControl.mouseleave(function() { $(this).removeClass("ui-state-hover"); });
			// resize KML accordion to fill height
			var resizeKmlAccordion = function() {
				var controlPanelHeight = $("#" + controlPanelElId).innerHeight();
				var collapserHeight = collapseControl.outerHeight(true);
				var borderWidth = accordionContainer.outerHeight(true) - accordionContainer.outerHeight(false);
				var kmlAccordionHeight = controlPanelHeight - collapserHeight - borderWidth;
				accordionContainer.height(kmlAccordionHeight);
				$("#" + kmlAccordionElId).kmlaccordion("resize");
			};
			var collapseControlPanel = function() {
				// width must be in pixels so that hide animation works correctly
				// (hide effect creates a wrapper element - % width results in % 
				// of wrapper element)
				controlPanel.width(controlPanel.width());
				// resize earth (set position: absolute so that delayed 
				// collapsing animation of control panel doesn't interfere with GE position.
				// begin this first because it takes longer.
				$("#" + earthPanelElId).css({ width: "100%", position: "absolute", top: 0, left: 0 });
				// resize iframe shim to fit expanded control panel
				iframeShim.css({ width: controlPanel.outerWidth(true) });
				// animate collapsing of control panel. when collapsing 
				// finishes, resize iframe shim to fit collapsed control panel
				controlPanel.css({position: "absolute", top: 0, left: 0});
				controlPanel.hide("slide", {direction: "left", easing: "jswing"}, 400, function() {
					iframeShim.css({ width: expandControl.outerWidth(true) });
					expandControl.show();
					// revert earth panel positioning
					$("#" + earthPanelElId).css({ width: "100%", position: "relative", top: null, left: null });
					controlPanel.css({position: "relative", top: 0, left: 0});
				});
			};
			var expandControlPanel = function() {
				$("#" + earthPanelElId).css({ width: "100%", position: "absolute", top: 0, left: 0 });
				// hide expansion control
				expandControl.hide();
				// expand iframe shim to fit final width of control panel
				iframeShim.css({ width: controlPanel.outerWidth(true) });
				// animate expansion of control panel, remove iframe when finished
				controlPanel.show("slide", { direction: "left", easing: "jswing" }, 400, function() {
					iframeShim.width(0);
					// resize earth - not animated because resize is choppy
					$("#" + earthPanelElId).css({ position: "relative", top: null, left: null, width: (containerEl.innerWidth() - controlPanel.outerWidth(true)) + "px" });
					resizeKmlAccordion();
				});
			};
			collapseControl.click(collapseControlPanel);
			expandControl.click(expandControlPanel);
			
			var self = this;

			$("#" + earthPanelElId).gearth({
				earthLoaded: function(event, data) {
					resizeKmlAccordion();
					$("#" + kmlAccordionElId).kmlaccordion({
						gex: new GEarthExtensions(data.earth),
						mapElement: event.target,
						kmlDocs: self.options.kmlDocs,
						layersKml: self.options.layersKml,
						optionsKml: self.options.optionsKml
					});
					$("#" + controlPanelElId).resizableleftcolumn({
						rightColumn: event.target,
						minWidth: 180
					});
					var calculatePanelAspectRatio = function() {
						return ($("#" + controlPanelElId).width() * 1.0) / self.element.width();
					};
					var panelAspectRatio = calculatePanelAspectRatio();
					$("#" + controlPanelElId).resize(function(event) {
						if (core.isOrContains(event.target, $("#" + controlPanelElId))) {
							panelAspectRatio = calculatePanelAspectRatio();
							resizeKmlAccordion();
							return true;
						}
						else {
							return false;
						}
					});
					self.element.resize(function(event) {
						if (core.isOrContains(event.target, self.element)) {
							$("#" + controlPanelElId).height("100%");
							$("#" + earthPanelElId).height("100%");
							// only resize control panel and earth panel if control panel is expanded
							if (!expandControl.is(":visible")) {
								// maintain aspect ratio
								var newControlPanelWidth = Math.round(self.element.width() * panelAspectRatio);
								$("#" + controlPanelElId).width(newControlPanelWidth);
								var newEarthWidth = Math.floor(self.element.width() - $("#" + controlPanelElId).outerWidth(true));
								$("#" + earthPanelElId).width(newEarthWidth);
								resizeKmlAccordion();								
							}
							return true;
						}
						else {
							return false;
						}
					});
					resizeKmlAccordion();
				}
			});
		}

	};

	$.widget("ui.gearthapp", GEarthApp);

})(jQuery);



