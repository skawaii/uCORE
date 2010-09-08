/**
 * @author Shea Frederick
 */

Ext.onReady(function() {
  var panwin = new Ext.Window({
    layout: 'fit',
    closeAction: 'hide',
    title: 'GPanorama Window',
    width:400,
    height:300,
    x: 480,
    y: 60,
    items: {
      xtype: 'gmappanel',
      gmapType: 'panorama',
      setCenter: {
        lat: 42.345573,
        'long': -71.098326
      }   
    }
  });

  var mapwin = new Ext.Window({
    layout: 'fit',
    title: 'GMap Window',
    closeAction: 'hide',
    width:400,
    height:400,
    x: 40,
    y: 60,
    items: {
      xtype: 'gmappanel',
      region: 'center',
      zoomLevel: 14,
      gmapType: 'map',
      addControl: new GSmallMapControl(),
      setCenter: {
        geoCodeAddr: '4 Yawkey Way, Boston, MA, 02215-3409, USA',
        marker: {title: 'Fenway Park'}
      },
      markers: [{
          lat: 42.339641,
          'long': -71.094224,
          marker: {title: 'Boston Museum of Fine Arts'}
        },{
          lat: 42.339419,
          'long': -71.09077,
          marker: {title: 'Northeastern University'}
      }]
    }
  });

  new Ext.Viewport({
    title: 'GMap Panel',
    layout: 'border',
    items: {
      xtype: 'gmappanel',
      region: 'center',
      zoomLevel: 14,
      gmapType: 'map',
      addControl: new GSmallMapControl(),
      setCenter: {
        geoCodeAddr: '4 Yawkey Way, Boston, MA, 02215-3409, USA',
        marker: {title: 'Fenway Park'}
      },
      markers: [{
          lat: 42.339641,
          'long': -71.094224,
          marker: {title: 'Boston Museum of Fine Arts'}
        },{
          lat: 42.339419,
          'long': -71.09077,
          marker: {title: 'Northeastern University'}
      }],
      tbar: [{
          text: 'Fenway Park StreetView',
          handler: function() {
            panwin.show();
          }
        },{
          text: 'Fenway Park Map Window',
          handler: function() {
            mapwin.show();
          }
        }]
    }
  });
});

