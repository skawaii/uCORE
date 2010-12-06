// Core Javascript: Crude for now.

core = {
		
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
			if (Ext.isArray(obj)) {
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
		}
		
};

/**
 * @param cfg configuration object with the following properties:
 * el: DOM element or element ID to contain the widget
 * primaryKmlTrees: array of kmltree configuration objects
 * secondaryKmlTrees: array of kmltree configuration objects
 */
core.GEarthWidget = function(cfg) {
	
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

