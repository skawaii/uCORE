/**
 * Class: Feature
 * 
 * A KML feature element.
 * 
 * Namespace:
 *   core.kml
 *   
 * Dependencies:
 *   - jQuery
 */
if (!window.core)
	window.core = {};
if (!window.core.kml)
	window.core.kml = {};

(function($, ns) {
	var Feature = function()
})(jQuery, window.core.kml);

id
<name>...</name>                      <!-- string -->
<visibility>1</visibility>            <!-- boolean -->
<open>0</open>                        <!-- boolean -->
<atom:author>...<atom:author>         <!-- xmlns:atom -->
<atom:link href=" "/>            <!-- xmlns:atom -->
<address>...</address>                <!-- string -->
<xal:AddressDetails>...</xal:AddressDetails>  <!-- xmlns:xal -->
<phoneNumber>...</phoneNumber>        <!-- string -->
<Snippet maxLines="2">...</Snippet>   <!-- string -->
<description>...</description>        <!-- string -->
<AbstractView>...</AbstractView>      <!-- Camera or LookAt -->
<TimePrimitive>...</TimePrimitive>    <!-- TimeStamp or TimeSpan -->
<styleUrl>...</styleUrl>              <!-- anyURI -->
<StyleSelector>...</StyleSelector>
<Region>...</Region>
<Metadata>...</Metadata>              <!-- deprecated in KML 2.2 -->
<ExtendedData>...</ExtendedData>


tree node functions:

getKmlFeatureType: function() {
	return string;
},

getParent: function(callback) {
	
},

// callback accepts a feature
iterateChildren: function(callback) {
	
},

