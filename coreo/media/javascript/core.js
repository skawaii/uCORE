// Core Javascript

(function(window) {
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
				} while (jQuery.contains(document.documentElement, $("#" + id)));
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
			describe: function(obj) {
				var str = "";
				for (var p in obj) {
					str += typeof obj[p] + " " + p + " = ";
					if (typeof obj[p] !== "function") {
						str += obj[p];
					}
					str += "\n";
				}
				return str;
			}
			
	};
	
	return (window.core = core);
})(window);


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
			rightColumn: null
		},
		
		_init: function() {
			var rightColumn = $(this.options.rightColumn);
			var lastWidth = this.element.width();
			var self = this;
			this.element.resizable({
				handles: "e",
				start: function(event, ui) {
					lastWidth = self.element.width();
				},
				resize: function(event, ui) {
					var currWidth = self.element.width();
					var widthDiff = lastWidth - currWidth;
					var newRightColWidth = rightColumn.width() + widthDiff;
					rightColumn.css({width: newRightColWidth + "px", left: currWidth + "px"});
					lastWidth = currWidth;
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
			var doResize = function() {
				var windowHeight = $(window).height();
				var windowWidth = $(window).width();
				var myHeight = windowHeight - heightOffset;
				var myWidth = windowWidth - widthOffset;
				self.element.width(myWidth);
				self.element.height(myHeight)
				self.element.trigger("resize");
			};
			$(window).resize(doResize);
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
					+ "<div id=\"" + searchFormElId + "\" class=\"kmlaccordion-searchform\">"
					+ "<input class=\"kmlaccordion-searchinput\" id=\"" + searchInputElId + "\" type=\"text\" />"
					+ "<button>Search</button>"
					+ "</div>"
					+ "<div class=\"ui-kmlaccordion-kmltreecontainer\" id=\"" + kmlDocsElId + "\"></div>"
					+ "</div>"
					+ "<h3><a href=\"#\">Google Earth Layers</a></h3>"
					+ "<div><div id=\"" + layersElId + "\"></div></div>"
					+ "<h3><a href=\"#\">Google Earth Options</a></h3>"
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
					primary: "kmlaccordion-searchbutton"
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
			
			this.element.resize(function() {
				self.element.accordion("resize");
				resizeSearchForm();
			});
			
			
			this.options.kmlDocsContainerElId = kmlDocsElId;
			
			// create kmltree object for the Google Earth Layers panel
			var layersKmlTree = kmltree({
				url: this.options.layersKml,
				element: $("#" + layersElId),
				gex: this.options.gex,
				mapElement: this.options.mapElement,
				supportItemIcon: true,
				restoreState: true
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
					restoreState: true
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
		
		_addKmlToEl: function(kmlUrl, kmlTreeEl, kmlLoadedCallback) {
			var newKmlTree = kmltree({
				url: kmlUrl,
				element: kmlTreeEl,
				gex: this.options.gex,
				mapElement: this.options.mapElement,
				supportItemIcon: true,
				restoreState: true
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
			containerEl.append("<div id=\"" + controlPanelElId + "\" class=\"gearthapp-controlpanel\"></div>");
			var earthPanelElId = core.generateId();
			containerEl.append("<div id=\"" + earthPanelElId + "\" class=\"gearthapp-earthpanel\"></div>");
			
			var self = this;
			
			$("#" + earthPanelElId).gearth({
				earthLoaded: function(event, data) {
					$("#" + controlPanelElId).kmlaccordion({
						gex: new GEarthExtensions(data.earth),
						mapElement: event.target,
						kmlDocs: self.options.kmlDocs,
						layersKml: self.options.layersKml,
						optionsKml: self.options.optionsKml
					});
					$("#" + controlPanelElId).resizableleftcolumn({
						rightColumn: event.target
					});
					self.element.resize(function(event) {
						$("#" + controlPanelElId).trigger("resize");
					});
				}
			});
		}
		
	};
	
	$.widget("ui.gearthapp", GEarthApp);
	
})(jQuery);