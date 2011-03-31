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
		 *   callback - Function. Function invoked for each child <GeoData> 
		 *         node. A single parameter is passed to the function - a 
		 *         <GeoData> instance that is the current child node.
		 */
		iterateChildren: function(callback) {},
		
		/**
		 * Function: getChildById
		 * 
		 * Retrieves a child <GeoData> node by its ID.
		 * 
		 * Parameters:
		 *   id - String. ID of the child node.
		 *   
		 * Returns:
		 *   <GeoData>. The child node, or null if it doesn't exist.
		 */
		getChildById: function(id) {},
		
		/**
		 * Function: getKmlString
		 * 
		 * Generates a textual KML representation of this object.
		 * 
		 * Returns:
		 *   String. KML text.
		 */
		getKmlString: function() {},
		
		/**
		 * Function: getKmlJson
		 * 
		 * Generates a Javascript object to represent the KML for this 
		 * feature. This is the same javascript object that would be 
		 * returned from the CORE KML Proxy service.
		 * 
		 *  Parameters:
		 *    callback - Function. Invoked upon successful javascript 
		 *          object creation. Invoked with one parameter - the 
		 *          javascript object.
		 */
		getKmlJson: function(callback) {},

		removeAllChildren: function() {},

		addChild: function(geodata) {},
		
		/**
		 * Function: getEnclosingKmlUrl
		 * 
		 * Gets the URL of the enclosing KML
		 */
		getEnclosingKmlUrl: function() {}
	};
	ns.GeoData = GeoData;

})(jQuery, window.core.geo);