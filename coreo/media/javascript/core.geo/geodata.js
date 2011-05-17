/**
 * Class: GeoData
 * 
 * Geospatially-referenced data (i.e. a Placemark element in a KML document).
 * Represents a node in a tree structure. This node can have many children, 
 * but only one parent.
 * 
 * Properties:
 *   id - String. A unique ID assigned by <GeoDataStore>.
 * 
 * Namespace:
 *  core.geo
 * 
 * Dependencies:
 *  - jQuery
 *  
 * See Also:
 *   <GeoDataStore>, <KmlNodeGeoData>
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {

	/**
	 * Constructor: GeoData
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   id - String. Unique ID.
	 */
	var GeoData = function(id) {
		this.id = id;
	};
	GeoData.prototype = {
		/**
		 * Function: findByKmlFeatureType
		 * 
		 * Finds all descendants that represent a certain KML feature (i.e. 
		 * Placemark, NeworkLink). Callback is invoked once per descendant.
		 * 
		 * Parameters:
		 *   kmlFeatureType - String. Required. KML feature type. See 
		 *         <KmlFeatureType>.
		 *   callback - Function. Invoked for each matching descendant. 
		 *         Invoked with one parameter of type <GeoData>, which is 
		 *         the descendant.
		 *         
		 */
		findByKmlFeatureType: function(kmlFeatureType, callback) {},

		/**
		 * Function: getKmlFeatureType
		 * 
		 * Determines the name of the type of KML feature 
		 * represented by this object (i.e. Placemark). 
		 * This name must be one of the valid element 
		 * names that extend the KML Feature element.
		 * 
		 * Returns:
		 *   String. KML feature type name.
		 */
		getKmlFeatureType: function() {},

		/**
		 * Function: getName
		 * 
		 * Retrieves this feature's name.
		 * 
		 * Returns:
		 *   String. Feature's name (title).
		 */
		getName: function() {},

		/**
		 * Function: hasChildren
		 * 
		 * Returns true if this node contains children.
		 * 
		 * Returns:
		 *   Boolean. True if this feature contains children.
		 */
		hasChildren: function() {},

		/**
		 * Function: getParent
		 * 
		 * Retrieves the parent <GeoData> instance.
		 * 
		 * Returns:
		 *  <GeoData>. Parent node.
		 */
		getParent: function() {},

		/**
		 * Function: iterateChildren
		 * 
		 * Iterates over the child <GeoData> nodes of this <GeoData> node.
		 * 
		 * Parameters:
		 *   onChild(geodata) - Function. Function invoked for each child <GeoData> 
		 *         node. A single parameter is passed to the function - a 
		 *         <GeoData> instance that is the current child node.
		 *   onComplete() - Function. Function invoked after all children 
		 *         have been processed.
		 */
		iterateChildren: function(onChild, onComplete, onError) {},
		
		/**
		 * Function: getKmlString
		 * 
		 * Generates a textual KML representation of this object.
		 * 
		 * Parameters:
		 *   onComplete(kmlString): Function.
		 *   onError(errorString): function.
		 */
		getKmlString: function(onComplete, onError) {},
		
		/**
		 * Function: getKmlJson
		 * 
		 * Generates a Javascript object to represent the KML for this 
		 * feature. This is the same javascript object that would be 
		 * returned from the CORE KML Proxy service.
		 * 
		 * KML JSON looks like this:
		 * 
		 * (start code)
		 * {
		 *   "name": "1 0", 
		 *   "type": "Document", 
		 *   "region": {
		 *     "lod": {
		 *       "maxLodPixels": -1.0, 
		 *       "type": "Lod", 
		 *       "id": "", 
		 *       "minLodPixels": 4000.0
		 *     }, 
		 *     "type": "Region", 
		 *     "id": "", 
		 *     "latLonAltBox": {
		 *       "altitudeMode": null, 
		 *       "north": 180.0, 
		 *       "west": -180.0, 
		 *       "east": 180.0, 
		 *       "type": "LatLonAltBox", 
		 *       "id": "", 
		 *       "south": -180.0
		 *     }
		 *   }, 
		 *   "visibility": false, 
		 *   "children": [
		 *     {
		 *       "name": "00", 
		 *       "type": "NetworkLink", 
		 *       "region": {
		 *         "lod": {
		 *           "maxLodPixels": -1.0, 
		 *           "type": "Lod", 
		 *           "id": "", 
		 *           "minLodPixels": 4000.0
		 *         }, 
		 *         "type": "Region", 
		 *         "id": "", 
		 *         "latLonAltBox": {
		 *           "altitudeMode": null, 
		 *           "north": 180.0, 
		 *           "west": -180.0, 
		 *           "east": 0.0, 
		 *           "type": "LatLonAltBox", 
		 *           "id": "", 
		 *           "south": 0.0
		 *         }
		 *       }, 
		 *       "flyToView": false, 
		 *       "visibility": false, 
		 *       "snippet": null, 
		 *       "phoneNumber": null, 
		 *       "address": null, 
		 *       "link": {
		 *         "refreshMode": null, 
		 *         "viewFormat": "", 
		 *         "href": "2.kml", 
		 *         "httpQuery": null, 
		 *         "type": "Link", 
		 *         "id": "", 
		 *         "viewRefreshMode": "onRegion"
		 *       }, 
		 *       "refreshVisibility": false, 
		 *       "open": false, 
		 *       "id": "", 
		 *       "description": null
		 *     }, 
		 *     {
		 *       "name": "THREE GORGES", 
		 *       "geometry": {
		 *         "extrude": false, 
		 *         "altitudeMode": null, 
		 *         "type": "Point", 
		 *         "id": "", 
		 *         "coordinates": "111.017200,30.810000"
		 *       }, 
		 *       "type": "Placemark", 
		 *       "timePrimitive": {
		 *         "end": "2009-12", 
		 *         "begin": "2001-01", 
		 *         "type": "TimeSpan", 
		 *         "id": ""
		 *       }, 
		 *       "visibility": false, 
		 *       "snippet": null, 
		 *       "styleUrl": "../s/2007_raw_abs_energy.txt#v_00ff00_1.5\n", 
		 *       "phoneNumber": null, 
		 *       "address": null, 
		 *       "open": false, 
		 *       "id": "pm30295", 
		 *       "description": "<table border=0 cellpadding=\"0\" cellspacing=\"0\" padding=\"0\" width=\"300\">  <tr>    <td colspan=2 align=center>      <font size=\"+1\">Source: <a href=\"http://www.thedaysarenumbered.com\">The Days Are Numbered</a>&amp;nbsp;&amp;nbsp;&amp;#124;&amp;nbsp;&amp;nbsp;Data: <a href=\"http://www.carma.org\">CARMA.org</a></font>    </td>  </tr>  <tr>    <td colspan=2 align=center>      <hr />    </td>  </tr>  <tr>    <td colspan=2 align=center>      <font size=\"+3\">2007</font>    </td>  </tr>  <tr>  <tr>    <td colspan=2 align=center>      <hr />    </td>  </tr>  <tr>    <td colspan=2 align=center>      <font size=\"+3\">THREE GORGES, Sandoupin, Hubei, China</font> <a href=http://carma.org/plant/detail/45316>More</a>    </td>  </tr>  <tr>    <td colspan=2 align=center>      <hr />    </td>  </tr>  <tr>    <td colspan=2 align=center>      <table border=0 cellpadding=\"0\" cellspacing=\"0\" padding=\"0\" width=\"250\" bgcolor=\"#F3F3F3\">        <tr>          <td align=\"left\">            <font size=\"+1\">CO2 emissions:</font>          </td>          <td align=\"left\">            <font size=\"+2\"><b>0</b> short tons</font>          </td>        </tr>        <tr>          <td align=\"left\">            <font size=\"+1\">Energy output:</font>          </td>          <td align=\"left\">            <font size=\"+2\"><b>63,300,000</b> MWh</font>          </td>        </tr>        <tr>          <td align=\"left\">            <font size=\"+1\">CO2 intensity:</font>          </td>          <td align=\"left\">            <font size=\"+2\"><b>0</b> lb/MWh</font>          </td>        </tr>                <tr>          <td align=\"left\">            <font size=\"+1\">Owner:</font>          </td>          <td align=\"left\">            <font size=\"+2\"><b>CHINA THREE GORGES PROJ CORP</b></font>           </td>        </tr>     </table>      </table>    </td>  </tr>  <tr>    <td colspan=2 align=center>      <hr />    </td>  </tr>  <tr>    <td colspan=2 align=center>      <table border=0 cellpadding=\"0\" cellspacing=\"0\" padding=\"0\" width=\"250\">        <tr>          <td align=\"left\">            <font size=\"+1\">ID:</font>          </td>          <td align=\"left\">            <font size=\"+1\">45316</font>          </td>        </tr>      </table>    </td>  </tr>  <tr>    <td colspan=2 align=center>      Explanation of <a href=\"http://carma.org/blog/about/plantinfo/\">fuel types</a> and <a href=\"http://carma.org/blog/glossary/abouticons/\">icons</a>.    </td>  </tr></table>"
		 *     }
		 *   ]
		 * }
		 * (end code)
		 * 
		 *  Parameters:
		 *    callback - Function. Invoked upon successful javascript 
		 *          object creation. Invoked with one parameter - the 
		 *          javascript object.
		 */
		getKmlJson: function(onComplete, onError) {},

		removeAllChildren: function(onComplete, onError) {},

		addChild: function(geodata, onComplete, onError) {},
		
		/**
		 * Function: getEnclosingKmlUrl
		 * 
		 * Gets the URL of the enclosing KML
		 * 
		 * Parameters:
		 *   callback - Function. Invoked with the URL.
		 */
		getEnclosingKmlUrl: function(callback) {},
		
		toString: function() {
			return "[GeoData ID=" + this.id + "]";
		}
	};
	ns.GeoData = GeoData;

})(jQuery, window.core.geo);