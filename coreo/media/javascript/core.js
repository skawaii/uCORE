// Core Javascript: Crude for now.

var initcore = function(username){

	// Save the username for later.
/*	var welcomeString = "<span id='signuptext'>" + username + " | <a href="">Settings</a> | <a href="">Help</a> | <a href="/ucore/logout-user/">Sign Out</a>";
*/


	var welcomeString = "<a href='/ucore/userprofile/'><span id='signuptext'>" + username + "</span></a> | <a href='FutureFeature'>Settings</a> | <a href='FutureFeature'>Help</a> | <a href='/ucore/logout-user'>Sign Out</a>";
	
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
      var northPanel = new Ext.Panel(
		{
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
    earthPanel]
		    
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
		earthPanel.fetchKml('http://localhost:8080/site_media/kml/top_eleven.kmz');

        // Add panels
        controlPanel.add(earthPanel.getLocationPanel());
        controlPanel.add(earthPanel.getKmlPanel());
        controlPanel.add(earthPanel.getLayersPanel());
        controlPanel.add(earthPanel.getOptionsPanel());
        controlPanel.doLayout();

        // expand the KML panel
        // hard-coded crappiness
        controlPanel.get(1).expand(false);

        /*
        optionsPanel.add(earthPanel.getOptionsPanel());
        optionsPanel.doLayout();
        */
      });
    });
}

