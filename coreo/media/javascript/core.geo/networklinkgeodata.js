/**
 * Class: NetworkLinkGeoData
 * 
 * GeoData implementation supporting NetworkLink attributes.
 * 
 * Namespace:
 *   core.geo
 * 
 * Dependencies:
 *   - jQuery
 *   - core.geo.GeoData
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	var GeoData = core.geo.GeoData;

	/**
	 * Constructor: NetworkLinkGeoData
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   id - String. Unique ID.
	 *   href - String. URL.
	 */
	var NetworkLinkGeoData = function(id, href) {
		GeoData.call(this, id);
		this.href = href;
	};
	$.extend(NetworkLinkGeoData.prototype, GeoData.prototype, {
		/**
		 * Property: href
		 * 
		 * String. URL to KML file.
		 */
		href: null,

		/**
		 * Property: refreshMode
		 * 
		 * String. "onChange", "onInterval", or "onExpire".
		 */
		refreshMode: "onChange",
		
		/**
		 * Property: refreshInterval
		 * 
		 * Number. If refreshMode is "onInterval", then this is the number of 
		 * seconds between refreshes.
		 */
		refreshInterval: 0,
		
		/**
		 * Property: viewRefreshMode
		 * 
		 * String. "never", "onStop", "onRequest", "onRegion".
		 */
		viewRefreshMode: "never",
		
		/**
		 * Property: viewRefreshTime
		 * 
		 * Number. If viewRefreshMode is "onStop", then this is the number 
		 * of seconds to wait after the camera stops before refreshing. 
		 */
		viewRefreshTime: 1,
		
		/**
		 * Property: viewBoundScale
		 * 
		 * Number. Scales the BBOX parameters before sending them to the 
		 * server. A value less than 1 specifies to use less than the 
		 * full view (screen). A value greater than 1 specifies to fetch 
		 * an area that extends beyond the edges of the current view.
		 */
		viewBoundScale: 1,
		
		/**
		 * Property: viewFormat
		 * 
		 * String. Specifies the format of the query string that is appended 
		 * to the href before the file is fetched.
		 */
		viewFormat: null,
		
		/**
		 * Property: httpQuery
		 * 
		 * String. Appends information to the query string, based on the 
		 * parameters specified.
		 */
		httpQuery: null,
		
		/**
		 * Property: linkData
		 * 
		 * <GeoData>. Root node of the data retrieved from the link.
		 */
		linkData: null
	});
	ns.NetworkLinkGeoData = NetworkLinkGeoData;
	
})(jQuery, window.core.geo);