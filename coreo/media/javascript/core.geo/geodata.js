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
		getKmlString: function() {}
	};
	ns.GeoData = GeoData;

})(jQuery, window.core.geo);