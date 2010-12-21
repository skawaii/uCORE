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
			 * Calculates the inner width and height of the browser window
			 * @return {Object} object with properties 'width' and 'height'
			 */
			getViewportSize: function() {
				var size = {
						width: -1,
						height: -1
				};

				if (typeof window.innerWidth != 'undefined') {
					size.width = window.innerWidth;
					size.height = window.innerHeight;
				}
				else if (typeof document.documentElement != 'undefined'
						&& typeof document.documentElement.clientWidth != 'undefined'
						&& typeof document.documentElement.clientWidth != 0) {
					size.width = document.documentElement.clientWidth;
					size.height = document.documentElement.clientHeight;
				}
				else {
					size.width = document.getElementsByTagName('body')[0].clientWidth;
					size.height = document.getElementsByTagName('body')[0].clientHeight;
				}
				
				return size;
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
 * Utilities for subclassing jQuery widgets.
 * 
 * Copied from http://bililite.com/blog/2008/08/13/extending-jquery-ui-widgets-revisited.
 */
(function($) {
	
	function object(o){
		function F(){};
		F.prototype = o;
		return new F;
	}

	$.widget.subclass = function (name, superclass){
		$.widget(name); // Slightly inefficient to create a widget only to discard its prototype, but it's not too bad
		name = name.split('.');
		var widget = $[name[0]][name[1]]; // $.widget should return the object itself!
		
		widget.prototype = object(superclass.prototype);
		var args = Array.prototype.slice.call(arguments,1); // get all the add-in methods
		args[0] = widget.prototype;
		$.extend.apply(null, args); // and add them to the prototype
		widget.defaults = object(superclass.defaults);
		
		// Subtle point: we want to call superclass init and destroy if they exist
		// (otherwise the user of this function would have to keep track of all that)
		/*
		if (widget.prototype.hasOwnProperty('init')){;
		  var init = widget.prototype.init;
			widget.prototype.init = function(){
				superclass.prototype.init.apply(this);
				init.apply(this);
			}
		};
		*/
		if (widget.prototype.hasOwnProperty('destroy')){
			var destroy = widget.prototype.destroy;
			widget.prototype.destroy = function(){
				destroy.apply(this);
				superclass.prototype.destroy.apply(this);
			}
		}
		return widget; // address my complaint above
	};

	// allow for subclasses to call superclass methods
	$.widget.prototype.callSuper = function(superclass, method){
		superclass = superclass.split('.'); // separate namespace and name
		return $[superclass[0]][superclass[1]].prototype[method].apply(this, Array.prototype.slice.call(arguments, 2)); // corrected from (arguments, 3)
	};
	
})(jQuery);


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
					var kmlDocs = core.asArray(this.options.kmlDocs);
					for (var i = 0; i < kmlDocs.length; i++) {
						addKml(kmlDocs[i]);
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


/**
 * KML Search Box jQuery plugin.
 * 
 */
(function($) {
	
	var KmlSearchResult = {
		
		title: "A result",
		
		description: ""

	};
	
	var KmlSearchDataSource = {
		
		title: "Some Datasource",

		description: "This is an example datasource.",
		
		shortcutRegex: ["http://", "https://"],
		
		autoSelectResults: true,
		
		canSearch: function(text) {
			return false;
		},
		
		/**
		 * Invokes resultCallback for each result found
		 */
		search: function(text, resultCallback) {
			throw "Not implemented";
		},
		
		writeKml: function(kmlSearchResult, kmlTreeElId, gex) {
			
		}
	
	};
	
	var KmlSearchBox = {
		
		options: {
			defaultText: "search",
			
		},
		
		_init: function() {
			var inputId = core.generateId();
			this.element.append("<input id=\"" + inputId + "\" type=\"text\"/>"
								+ "<input type=\"button\" value");
			
		}
		
	};
	
	$.widget("ui.kmlsearchbox", KmlSearchBox);
	
})(jQuery);


/**
 * @param cfg configuration object with the following properties:
 * el: DOM element to contain the widget
 * primaryKmlTrees: array of kmltree configuration objects
 * secondaryKmlTrees: array of kmltree configuration objects
 */
/*
core.GEarthWidget2 = function(cfg) {
	
	  var createKmlSearchInput = function(geWidget) {
		    var kmlUrlField = new Ext.form.TriggerField({
		      fieldLabel: 'Search',
		      triggerClass: 'x-form-search-trigger',
		      anchor: '100%',
		      name: 'url',
		      value: '',
		      width: 280,
		      style: "line-height: 12pt; font-size: 12pt; height: 22px",
		      selectOnFocus: true,
		      emptyText: "search",
		      scope: geWidget,
		      onTriggerClick: function() {
		        var value = this.getValue();
		        
		        if (value.match('^http')) {
		        	geWidget.addKml(value);
		        } else if (value.match('^show')) {
		            Ext.Ajax.request({
		                url: '../search-mongo/',
		                params: 'q=' + value,
		                method: 'GET',
		                scope: this,
		                //disableCaching: false,
		                success: function(response) {
		                    // XXX Nehal's response will be a url to a KMZ. call google.earth.fetchKml()
		                    //alert('success: ' + response.responseText);
		                    //this.scope.addKml.createDelegate(this.scope, [this.scope.earth.parseKml(response.responseText)]);
		                	geWidget.addKml(response.responseText);
		                },
		                failure: function(response) {
		                    alert('failure: ' + response.status + ' ' + response.statusText);
		                }
		            });
		        } else {
		            Ext.Ajax.request({
		                url: '../search-links/',
		                params: 'q=' + value,
		                method: 'GET',
		                //disableCaching: false,
		                success: function(response) {
		                    // XXX here, the response is a HTML doc. how do we display that?
		                    alert('success: ' + response.responseText);
		                },
		                failure: function(response) {
		                    alert('failure: ' + response.status + ' ' + response.statusText);
		                }
		            });
		        }

		        this.reset();
		      },
		      listeners: {specialkey: {fn: function(f, e) {
		        if (e.getKey() == e.ENTER) {
		          this.onTriggerClick();
		        }
		      }}}
		    });

		    return kmlUrlField;
		  };
		  
	return {
		fluidHeightOffset: -1,
		
		containerEl: null,
		
		containerPanel: null,
		
		controlPanel: null,
		
		earthPanel: null,
		
		earth: null,
		
		gex: null,
		
		kmlTreeEl: null,
		
		defaultKmlTreeCfg: {
			  supportItemIcon: true,
			  setExtent: true,
			  restoreState: true
		},
		
		computeHeight: function() {
			if (Ext.isNumber(this.fluidHeightOffset) && this.fluidHeightOffset >= 0) {
				return core.getViewportSize().height - this.fluidHeightOffset;
			}
			return this.containerEl.getComputedHeight();
		},
		
		addKml: function(kmlUrl) {
			alert("Adding KML " + kmlUrl);
	        var newKmlTreeDivId = Ext.id();
	        var newKmlTreeDiv = Ext.get(this.kmlTreeEl).createChild({tag: "div", id: newKmlTreeDivId});
        	var kmlTreeCfg = Ext.apply({url: kmlUrl, element: newKmlTreeDiv}, this.defaultKmlTreeCfg);
        	var newKmlTree = new kmltree(kmlTreeCfg);
        	newKmlTree.load();
        	alert("Finished");
        	return newKmlTree;
		},
		
		init: function() {
			this.fluidHeightOffset = Ext.isNumber(cfg.fluidHeightOffset) ? parseInt(cfg.fluidHeightOffset) : -1;

			this.containerEl = Ext.get(cfg.el);

			var primaryKmlTreeCfgs = core.asArray(cfg.primaryKmlTree);

			// create the control panel that appears on the left side of 
			// the widget. if more secondary kml trees are specified, this will 
			// have an accordion layout.
			var controlPanelConfig = {
					title: "Control Panel",
					  region: "west",
					  width: 280,
		        	  split: true,
		        	  resizable: true,
					  border: true,
					  collapsible: true,
					  margins: '5 5 5 5',
					  autoScroll: true
				};
			// kmlTreePanels holds configuration objects and element references 
			// for all kmltree's to be created
			var kmlTreePanels = [];
			if (cfg.layersKmlTree || cfg.optionsKmlTree) {
				// controlPanel will have an accordion layout
				Ext.apply(controlPanelConfig, {
					  layout: "accordion",
					  layoutConfig: {
						  hideCollapseTool: true,
						  animate: true
					  }
				});
				// itemsArr holds all of the panels of the accordion
				var itemsArr = [];
				// primary KML panel (KML Documents)
				var kmlSearchInput = createKmlSearchInput(this);
				var primaryDivId = Ext.id();
				var kmlDocsPanel = new Ext.FormPanel({
					title: "KML Documents",
					padding: "15px 5px 5px 15px",
					layout: "anchor",
					items: [
					        kmlSearchInput,
					],
					html: {tag: "div", id: primaryDivId, style: "margin-top: 20px;"}
				});
				this.kmlTreeEl = primaryDivId;
				itemsArr.push(kmlDocsPanel);
				kmlTreePanels.push({
					layersOrOptions: false,
					el: primaryDivId,
					kmlTreeCfg: primaryKmlTreeCfgs
				});
				// layers panel
				if (cfg.layersKmlTree) {
					var divId = Ext.id();
					itemsArr.push({title: "Google Earth Layers", padding: "5px 5px 5px 15px", html: {tag: "div", id: divId}});
					kmlTreePanels.push({
						layersOrOptions: true,
						el: divId,
						kmlTreeCfg: cfg.layersKmlTree
					});
				}
				// options panel
				if (cfg.optionsKmlTree) {
					var divId = Ext.id();
					itemsArr.push({title: "Display Options", padding: "5px 5px 5px 15px", html: {tag: "div", id: divId}});
					kmlTreePanels.push({
						layersOrOptions: true,
						el: divId,
						kmlTreeCfg: cfg.optionsKmlTree
					});
				}
				// add kml panels to control panel
				Ext.apply(controlPanelConfig, {
					  items: itemsArr
				});
				this.controlPanel = new Ext.Panel(controlPanelConfig);
			}
			else {
				// no options or layers panels to display, don't need an 
				// accordion layout
				var divId = Ext.id();
				Ext.apply(controlPanelConfig, {
					  padding: "5px 5px 5px 15px",
					  html: {tag: "div", id: divId}
				});
				kmlTreePanels.push({
					layersOrOptions: false,
					el: divId,
					kmlTreeCfg: primaryKmlTreeCfgs
				});
				this.controlPanel = new Ext.Panel(controlPanelConfig);
			}
			    
		      var me = this;

			  var renderEarth = function(containerPanel) {
				  var initEarthSuccess = function(geInstance) {
					  me.earth = geInstance;
					  me.earth.getWindow().setVisibility(true);
					  me.gex = new GEarthExtensions(me.earth);
					  
					  Ext.apply(me.defaultKmlTreeCfg, {
						  gex: me.gex,
						  mapElement: me.earthPanel.body.dom,
					  });
					  
					  // render kml trees
					  for (var i = 0; i < kmlTreePanels.length; i++) {
						  var kmlEl = kmlTreePanels[i].el;
						  var kmlTreeCfgs = core.asArray(kmlTreePanels[i].kmlTreeCfg);
						  var isLayerOrOption = kmlTreePanels[i].layersOrOptions;
						  for (var j = 0; j < kmlTreeCfgs.length; j++) {
							  var kmlCfg = kmlTreeCfgs[j];
							  if (Ext.isString(kmlCfg)) {
								  kmlCfg = { url: kmlCfg };
							  }
							  var kmlTreeDiv = Ext.get(kmlEl).createChild({tag: "div", id: Ext.id()});
							  var defaultKmlCfg = {
									  gex: me.gex,
									  mapElement: me.earthPanel.body.dom,
									  element: kmlTreeDiv.dom,
									  supportItemIcon: true,
									  setExtent: true,
									  restoreState: true
							  };
							  var nextKmlTree = kmltree(Ext.apply(defaultKmlCfg, kmlCfg));
							  nextKmlTree.load();
							  if (isLayerOrOption) {
								  enableGoogleLayersControl(nextKmlTree, me.earth);
							  }
						  }
					  }
					  
				  };
				  var initEarthFailure = function(errorCode) {
					alert("Google Earth initialization failed. Error Code: " + errorCode);  
				  };
				  google.earth.createInstance(me.earthPanel.body.dom, initEarthSuccess, initEarthFailure);
				  
				  return true;
			  };
			  
			  this.earthPanel = new Ext.Panel({
				  region: "center",
				  monitorResize: true,
				  defaults: {
					  bodyStyle: 'padding: 10px'
				  },
	        	  border: false,
	        	  layout: "fit"
			  });

			  this.containerPanel = new Ext.Panel({
				  renderTo: this.containerEl,
				  monitorResize: true,
				  layout: 'border',
				  height: this.computeHeight(),
				  items: [
				          this.controlPanel,
				          this.earthPanel
				  ],
	        	  listeners: {
	        		  afterrender: renderEarth
	        	  }
			  });
			  
			  if (this.fluidHeightOffset >= 0) {
				  var handleResize = function(w, h) {
					  this.containerPanel.setHeight(this.computeHeight());
				  };
				  Ext.EventManager.onWindowResize(handleResize, this);
			  }
			  
			  this.containerPanel.render();
		}
		
	}
	

	
};
*/

var initcore_kmltree = function(username) {
	  var welcomeString = "<a href='/ucore/userprofile/'><span id='signuptext'>" + username + "</span></a> | <a href='FutureFeature'>Settings</a> | <a href='FutureFeature'>Help</a> | <a href='/ucore/logout/'>Sign Out</a>";
	  
	  google.load("earth", "1");
	  
	  var earth;
	  // GEarthExtensions object
	  var gex;
	  // kmltree object
	  var kmlTree;
	  
	  Ext.onReady(function() {
	      // Create top panel with user info / logo
	        var northPanel = new Ext.Panel({
	          region: 'north',
	          autoHeight: false,
	          height: 30,
	          html: "<div id='geheader'><img id='core-logo' height='28px' width='100px' align='bottom' src='/site_media/images/corelogobluecog2-100x28.png'' alt='C()RE' /><div id='user-info'>" + welcomeString + "</div></div>",
	          border: false,
	          margins: '0 0 0 0' 
	        });
	        

	      // Create the viewport for the page
	      new Ext.Viewport({
	        layout: 'border',
	        items: [
	          northPanel,
	          controlPanel,  
	          earthPanel
	        ]
	  });

	       /* // Add panels to browser viewport
	        var viewport = new Ext.Viewport({
	          layout: 'border',
	          items: [controlPanel, earthPanel]
	          //items: [controlPanel, earthPanel, optionsPanel]
	        });
	      */

	      // Build control panel
	      earthPanel.on('earthLoaded', function(){
	        // Display KMLs
	        //earthPanel.fetchKml('http://earthatlas.info/kml/statistics/infant_mortality_rate_2005_prism.kmz');
	        // earthPanel.fetchKml('http://basementmonkeys.com/kml/core.kmz');
	        //earthPanel.fetchKml('/site_media/kml/top_eleven.kmz');
	        //earthPanel.fetchKml('http://localhost:8080/site_media/kml/top_eleven.kmz');

	        // Add panels
	        //controlPanel.add(earthPanel.getLocationPanel()); // doesn't work currently
	        controlPanel.add(earthPanel.getKmlPanel());
	        controlPanel.add(earthPanel.getLayersPanel());
	        controlPanel.add(earthPanel.getOptionsPanel());
	        controlPanel.doLayout();

	        // expand the KML panel
	        // hard-coded crappiness
	        controlPanel.get(0).expand(false);

	        /*
	        optionsPanel.add(earthPanel.getOptionsPanel());
	        optionsPanel.doLayout();
	        */
	      });
	    });
};

var initcore = function(username){

  // Save the username for later.
/*  var welcomeString = "<span id='signuptext'>" + username + " | <a href="">Settings</a> | <a href="">Help</a> | <a href="/logout/">Sign Out</a>";
*/


  var welcomeString = "<a href='/userprofile/'><span id='signuptext'>" + username + "</span></a> | <a href='FutureFeature'>Settings</a> | <a href='FutureFeature'>Help</a> | <a href='/logout/'>Sign Out</a>";
  
  google.load("earth", "1");
    //google.load("maps", "2.xx");

    Ext.onReady(function() {
      // Create Google Earth panel
      var earthPanel = new Ext.ux.GEarthPanel({
        region: 'center',
        contentEl: 'centerPanel',
        margins: '5 5 5 0',
        earthLayers: {
          LAYER_BORDERS: true,
          LAYER_ROADS: false,
          LAYER_BUILDINGS: false,
          LAYER_TERRAIN: true
        },
        earthOptions: {
          setStatusBarVisibility: true,
          setGridVisibility: false,
          setOverviewMapVisibility: false,
          setScaleLegendVisibility: false,
          setAtmosphereVisibility: true,
          setMouseNavigationEnabled: true
        }
      });

      // Create control panel
      var controlPanel = new Ext.Panel({
        region: 'west',
        contentEl: 'westPanel',
        title: 'Control Panel',
        width: 280,
        border: true,
        collapsible: true,
        margins: '5 5 5 5',
        layout: 'accordion',
        layoutConfig: {
          animate: true
        },
        defaultType: 'panel',
        defaults: {
          bodyStyle: 'padding: 10px'
        }
      });

 
    // Create top panel with user info / logo
      var northPanel = new Ext.Panel({
        region: 'north',
        autoHeight: false,
        height: 30,
        html: "<div id='geheader'><img id='core-logo' height='28px' width='100px' align='bottom' src='/site_media/images/corelogobluecog2-100x28.png'' alt='C()RE' /><div id='user-info'>" + welcomeString + "</div></div>",
        border: false,
        margins: '0 0 0 0' 
      });


      /*
      var optionsPanel = new Ext.Panel({
        region: 'east',
        contentEl: 'eastPanel',
        //title: 'Google Earth Options',
        //width: 200,
        border: true,
        collapsible: true,
        collapsed: true,
        margins: '5 5 5 5',
        //layout: 'vbox',
        defaultType: 'panel',
        defaults: {
          bodyStyle: 'padding: 10px'
        }
      });
      */

    // Create the viewport for the page
    new Ext.Viewport({
      layout: 'border',
      items: [
        northPanel,
        controlPanel,  
        earthPanel
      ]
});

     /* // Add panels to browser viewport
      var viewport = new Ext.Viewport({
        layout: 'border',
        items: [controlPanel, earthPanel]
        //items: [controlPanel, earthPanel, optionsPanel]
      });
    */

    // Build control panel
    earthPanel.on('earthLoaded', function(){
      // Display KMLs
      //earthPanel.fetchKml('http://earthatlas.info/kml/statistics/infant_mortality_rate_2005_prism.kmz');
      // earthPanel.fetchKml('http://basementmonkeys.com/kml/core.kmz');
      //earthPanel.fetchKml('/site_media/kml/top_eleven.kmz');
      //earthPanel.fetchKml('http://localhost:8080/site_media/kml/top_eleven.kmz');

      // Add panels
      //controlPanel.add(earthPanel.getLocationPanel()); // doesn't work currently
      controlPanel.add(earthPanel.getKmlPanel());
      controlPanel.add(earthPanel.getLayersPanel());
      controlPanel.add(earthPanel.getOptionsPanel());
      controlPanel.doLayout();

      // expand the KML panel
      // hard-coded crappiness
      controlPanel.get(0).expand(false);

      /*
      optionsPanel.add(earthPanel.getOptionsPanel());
      optionsPanel.doLayout();
      */
    });
  });
}

