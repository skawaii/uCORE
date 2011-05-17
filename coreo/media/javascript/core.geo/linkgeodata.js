/**
 * Class: LinkGeoData
 * 
 * SuperClass: <GeoData>
 * 
 * GeoData implementation for CORE Link objects.
 * 
 * Namespace:
 *   core.geo
 *   
 * Dependencies:
 *   - jQuery
 *   - core.geo.GeoData
 *   - core.geo.KmlFeatureType
 *   - core.util.KmlUtils
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	/**
	 * Constructor: LinkGeoData
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   geoDataId - String. Unique ID for this GeoData.
	 *   link - CORE Link object.
	 *   parent - <GeoData>.
	 *   linkContent - <GeoData>. Content from the link's URL.
	 */
	var LinkGeoData = function(geoDataId, link, parent, geoDataRetriever) {
		var _super, lazyLoadLinkContent, linkContent;
		_super = new core.geo.GeoData(geoDataId);
		lazyLoadLinkContent = function() {
			var deferred = $.Deferred();
			if (linkContent) {
				// link content has already been loaded
				deferred.resolve(linkContent);
			}
			else {
				// link content needs to be loaded
				if (link && link.fields && link.fields.url) {
					geoDataRetriever.fetch(link.fields.url)
						.then(function(geodata) {
								linkContent = geodata;
								deferred.resolve(linkContent);
							},
							function(error) {
								deferred.reject(error);
							});
				}
				else {
					deferred.reject("Link doesn't contain a URL");
				}
			}
			return deferred.promise();
		};
		return $.extend(_super, {

			/**
			 * Function: getCoreLink
			 * 
			 * Returns:
			 *   Object. JSON object representing a CORE Link object.
			 */
			getCoreLink: function() {
				return link;
			},
			
			/**
			 * Function: findByKmlFeatureType
			 * 
			 * See Also:
			 *   <GeoData.findByKmlFeatureType>
			 */
			findByKmlFeatureType: function(kmlFeatureType, callback) {
				lazyLoadLinkContent().then(
					function(linkContent) {
						linkContent.findByKmlFeatureType(kmlFeatureType, callback);
					},
					function(error) {
						CallbackUtils.invokeOptionalCallback(callback, "error", error);
					});
			},

			/**
			 * Function: getKmlFeatureType
			 * 
			 * See Also:
			 *   <GeoData.getKmlFeatureType>
			 */
			getKmlFeatureType: function() {
				return core.geo.KmlFeatureType.DOCUMENT;
			},

			/**
			 * Function: getName
			 * 
			 * See Also:
			 *   <GeoData.getName>
			 */
			getName: function() {
				return link && link.fields && link.fields.name ? link.fields.name : null;
			},

			/**
			 * Function: hasChildren
			 * 
			 * See Also:
			 *   <GeoData.hasChildren>
			 */
			hasChildren: function() {
				return true;
			},

			/**
			 * Function: getParent
			 * 
			 * See Also:
			 *   <GeoData.getParent>
			 */
			getParent: function() {
				return parent;
			},

			/**
			 * Function: iterateChildren
			 * 
			 * See Also:
			 *   <GeoData.iterateChildren>
			 */
			iterateChildren: function(onChild, onComplete, onError) {
				lazyLoadLinkContent().then(
						function(linkContent) {
							linkContent.iterateChildren(onChild, onComplete);
						},
						function(error) {
							if (onError)
								onError.call(onError, error);
						});
			},
			
			/**
			 * Function: getKmlString
			 * 
			 * See Also:
			 *   <GeoData.getKmlString>
			 */
			getKmlString: function(onComplete, onError) {
				var name = this.getName();
				lazyLoadLinkContent().then(
						function(linkContent) {
							linkContent.getKmlString(
								function(kmlString) {
									var kml = "<Document xmlns=\"" + core.util.KmlUtils.KML_NS[0] + "\">"
										+ "<name>" + name + "</name>";
										+ kmlString
										+ "</Document>";
									if (onComplete)
										onComplete.call(onComplete, kml);
								},
								onError
							);
						},
						function(error) {
							if (onError)
								onError.call(onError, error);
						});
			},
			
			/**
			 * Function: getKmlJson
			 * 
			 * See Also:
			 *   <GeoData.getKmlJson>
			 */
			getKmlJson: function(onComplete, onError) {
				lazyLoadLinkContent().then(
						function(linkContent) {
							linkContent.getKmlJson(onComplete, onError);
						},
						function(error) {
							if (onError)
								onError.call(onError, error);
						});
			},

			/**
			 * Function: getEnclosingKmlUrl
			 * 
			 * See Also:
			 *   <GeoData.getEnclosingKmlUrl>
			 */
			getEnclosingKmlUrl: function(callback) {
				var url;
				if (callback) {
					url = link && link.fields && link.fields.url ? link.fields.url : null;
					callback.call(callback, url);
				}
			},

			/**
			 * Function: removeAllChildren
			 * 
			 * See Also:
			 *   <GeoData.removeAllChildren>
			 */
			removeAllChildren: function(onComplete, onError) {
				throw "Not implemented";
			},

			/**
			 * Function: addChild
			 * 
			 * See Also:
			 *   <GeoData.addChild>
			 */
			addChild: function(geodata, onComplete, onError) {
				throw "Not implemented";
			},
		});
	};
	ns.LinkGeoData = LinkGeoData;
})(jQuery, window.core.geo);