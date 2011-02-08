// Core Javascript: Crude for now.

var initcore = function(username){

  // Setup the welcome string.
  //var welcomeString = "<a href='/gm/'><span id='gmapscore'>GMaps Version</span></a> | <a href='/userprofile/'><span id='signuptext'>" + username + "</span></a> |  <a href='FutureFeature'>Settings</a> | <a href='FutureFeature'>Help</a> | <a href='/logout/'>Sign Out</a>";
  
  //  
 // google.load("maps", "2.x");

 // if (GBrowserIsCompatible()) {
	// test
        var map = new GMap2(document.getElementById("map_canvas"));
        map.setCenter(new GLatLng(37.4419, -122.1419), 13);
        map.setUIToDefault();

      $( "#datepicker" ).datepicker();

   //   }


 
}



