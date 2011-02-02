/**
 * Namespace: core.geo
 * 
 * Contains classes related to the CORE geospatial object model.
 * 
 * Dependences:
 * 
 *     - jQuery
 *     - core.util
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	var idCounter = 0;
	
	/**
	 * Class: GeoData
	 * 
	 * Represents geospatial data that can be displayed on a map. Instances are 
	 * created with GeoDataFactory.
	 * 
	 * Properties:
	 * 
	 *     id - String. An ID unique to every GeoData instance.
	 *         
	 * Methods:
	 * 
	 *     getKmlString - Returns a textual KML representation of the data.
	 *     getKmlDom - Returns an XML DOM object that is the KML representation of the data.
	 */

	/**
	 * Constructor: GeoData
	 * Initializes the object 
	 */
	var GeoData = function() {
		this.id = "" + idCounter++;
	};

	GeoData.prototype = {
		/**
		 * Function: getKmlString
		 * Returns:
		 * 	The KML in string form.
		 * See Also: <getKmlDom>
		 */			
		getKmlString: function() {
		},
		
		/**
		 * Function: getKmlDom
		 * 
		 * Returns: 
		 * 	The KML as a hierarchical DOM object.
		 * See Also: <getKmlString>
		 */
		getKmlDom: function() {
		}
		
	};

	// Add GeoData class to namespace.
	ns.GeoData = GeoData;
	
	/**
	 * Class: KmlStringGeoData
	 * 
	 * 	Description goes here.
	 *
	 * SuperClass: 
	 * <GeoData>
	 *
	 * Properties:
	 * 
	 *     	          
	 * Methods:
	 * 
	 *     getKmlString - Returns a textual KML representation of the data.
	 *     getKmlDom - Returns an XML DOM object that is the KML representation of the data.
	 */

	/**
	 * Constructor: KmlStringGeoData
	 * Initializes the object 
	 *
	 * Parameters:
	 * 	kmlString - (String) A KML string to construct this geodata from.
	 */
	var KmlStringGeoData = function(kmlString) {
		GeoData.call(this);
		this._kmlString = kmlString;
		this._kmlDom = null;
	};
	$.extend(KmlStringGeoData.prototype, GeoData.prototype, {

		/**
		 * Function: getKmlString
		 * Returns:
		 * 	This geodata object as a KML string.
		 * See Also: <getKmlDom>
		 */		
		getKmlString: function() {
			return this._kmlString;
		},

		/**
		 * Function: getKmlDom
		 * Returns:
		 * 	This geodata object as a KML hierarchical DOM.
		 * See Also: <getKmlDom>
		 */		
		getKmlDom: function() {
			if (!this._kmlDom) {
				this._kmlDom = core.util.createXmlDoc(this._kmlString);
			}
			return this._kmlDom;
		}
	});
	
	/**
	 * Class: KmlDomGeoData
	 * 
	 * 	Description goes here.
	 *
	 * SuperClass: 
	 * <GeoData>
	 *
	 * Properties:
	 * 
	 *     	          
	 * Methods:
	 * 
	 *     getKmlString - Returns a textual KML representation of the data.
	 *     getKmlDom - Returns an XML DOM object that is the KML representation of the data.
	 */

	/**
	 * Constructor: KmlDomGeoData
	 * Initializes the object 
	 *
	 * Parameters:
	 * 	kmlString - (String) A KML DOM object to construct this geodata from.
	 */
	var KmlDomGeoData = function(kmlDom) {
		GeoData.call(this);
		this._kmlDom = kmlDom;
		this._kmlString = null;
	}
	$.extend(KmlDomGeoData.prototype, GeoData.prototype, {
	
		/**
		 * Function: getKmlString
		 * Returns:
		 * 	This geodata object as a KML string.
		 * See Also: <getKmlDom>
		 */	
		getKmlString: function() {
			if (!this._kmlString) {
				this._kmlString = core.util.getXmlString(this._kmlDom);
			}
			return this._kmlString;
		},
		/**
		 * Function: getKmlString
		 * Returns:
		 * 	This geodata object as a KML DOM objet.
		 * See Also: <getKmlDom>
		 */	
		getKmlDom: function() {
			return this._kmlDom;
		}
	});
	
	/**
	 * Class: GeoDataFactory
	 * 
	 * Factory for creating instances of GeoData. Use this factory rather than creating 
	 * instances directory.
	 * 
	 * Methods:
	 * 
	 *     fromKmlString - Returns a GeoData instance created from KML text.
	 *     fromKmlDom - Returns a GeoData instance created from an XML DOM object 
	 *         representing KML.
	 */
	var GeoDataFactory = {
		/**
		 * Function: fromKmlString
		 * Returns:
		 * 	This geodata object as a KML DOM objet.
		 * See Also: <getKmlDom>
		 */	
		fromKmlString: function(kmlString) {
			return new KmlStringGeoData(kmlString);
		},
		/**
		 * Function: fromKmlDom
		 * Returns:
		 * 	This geodata object as a KML DOM objet.
		 * See Also: <getKmlDom>
		 */	
		fromKmlDom: function(kmlDom) {
			return new KmlDomGeoData(kmlDom);
		}
	
	};
	ns.GeoDataFactory = GeoDataFactory;
	
})(jQuery, window.core.geo);
