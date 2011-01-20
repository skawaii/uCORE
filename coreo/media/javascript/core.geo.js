/**
 * The core.geo namespace
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
	 * GeoData
	 * 
	 * Represents geospatial data that can be displayed on a map. Instances are 
	 * created with GeoDataFactory.
	 * 
	 * Properties:
	 * 
	 *     id:
	 *         String. An ID unique to every GeoData instance.
	 *         
	 * Methods:
	 * 
	 *     getKmlString:
	 *         Returns a textual KML representation of the data.
	 *     getKmlDom:
	 *         Returns an XML DOM object that is the KML representation of the data.
	 */
	var GeoData = function() {
		this.id = "" + idCounter++;
	};
	GeoData.prototype = {
			
		getKmlString: function() {
		},
		
		getKmlDom: function() {
		}
		
	};
	ns.GeoData = GeoData;
	
	var KmlStringGeoData = function(kmlString) {
		GeoData.call(this);
		this._kmlString = kmlString;
		this._kmlDom = null;
	};
	$.extend(KmlStringGeoData.prototype, GeoData.prototype, {
		getKmlString: function() {
			return this._kmlString;
		},
		getKmlDom: function() {
			if (!this._kmlDom) {
				this._kmlDom = core.util.createXmlDoc(this._kmlString);
			}
			return this._kmlDom;
		}
	});
	
	var KmlDomGeoData = function(kmlDom) {
		GeoData.call(this);
		this._kmlDom = kmlDom;
		this._kmlString = null;
	}
	$.extend(KmlDomGeoData.prototype, GeoData.prototype, {
		getKmlString: function() {
			if (!this._kmlString) {
				this._kmlString = core.util.getXmlString(this._kmlDom);
			}
			return this._kmlString;
		},
		getKmlDom: function() {
			return this._kmlDom;
		}
	});
	
	/**
	 * GeoDataFactory
	 * 
	 * Factory for creating instances of GeoData.
	 * 
	 * Methods:
	 * 
	 *     fromKmlString:
	 *         Returns a GeoData instance created from KML text.
	 *     fromKmlDom:
	 *         Returns a GeoData instance created from an XML DOM object 
	 *         representing KML.
	 */
	var GeoDataFactory = {
		
		fromKmlString: function(kmlString) {
			return new KmlStringGeoData(kmlString);
		},
		
		fromKmlDom: function(kmlDom) {
			return new KmlDomGeoData(kmlDom);
		}
	
	};
	ns.GeoDataFactory = GeoDataFactory;
	
})(jQuery, window.core.geo);