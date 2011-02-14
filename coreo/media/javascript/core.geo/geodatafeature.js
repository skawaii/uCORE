if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	/**
	 * GeoDataFeature
	 * 
	 * Represents geospatial data that can be displayed on a map (i.e. KML 
	 * placemark). Instances are created with GeoDataFactory.
	 * 
	 * Properties:
	 * 
	 *      owner:
	 *          GeoDataContainer. Root ancestor that contains this feature.
	 *      id:
	 *          String. An ID unique to all GeoDataFeature instances.
	 *         
	 *  Methods:
	 *  
	 *      walkChildren( callback ):
	 *          Invokes a callback for each GeoDataFeature that is a direct 
	 *          descendent of this object.
	 *          
	 *          Parameters:
	 *              callback:
	 *                  Function. Invoked for each child GeoDataFeature. 
	 *                  Accepts one parameter of type GeoDataFeature. 
	 *          Return:
	 *              void
	 *              
	 *     getKmlString():
	 *         Generates KML text for this object.
	 *         
	 *         Parameters:
	 *             None
	 *         Return:
	 *             String. The KML fragment describing this object.
	 *     
	 *     getKmlDomNode():
	 *         Generates an XML DOM node that is the KML representation of this object.
	 *         
	 *         Parameters:
	 *             None
	 *         Return:
	 *             XML DOM node.
	 */
	var GeoDataFeature = function(owner, id) {
		this.owner = owner;
		this.id = id;
	};
	GeoDataFeature.prototype = {
		getParent: function() {},
		walkChildren: function(callback) {},
		getKmlString: function() {},
		getKmlDomNode: function() {},
	};
	ns.GeoDataFeature = GeoDataFeature;
})(jQuery, window.core.geo);