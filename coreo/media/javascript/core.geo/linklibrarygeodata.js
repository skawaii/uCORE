/**
 * Class: LinkLibraryGeoData
 * 
 * GeoData implementation for CORE LinkLibrary objects.
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
	 * Constructor: LinkLibraryGeoData
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   geoDataId - String. Unique ID for this GeoData.
	 *   linkLibrary - Object. CORE LinkLibrary.
	 */
	var LinkLibraryGeoData = function(geoDataId, linkLibrary, linkService, geoDataRetriever) {
		var _super, _this, linkGeoDatas, lazyLoadLinks, linkIds;
		_super = new core.geo.GeoData(geoDataId);
		linkIds = [];
		if (linkLibrary && linkLibrary.links) {
			$.each(linkLibrary.links, function(index, value) {
				linkIds.push(value[0]);
			});
		}
		lazyLoadLinks = function(onLink, onError, onComplete) {
			var i, linksRemaining;
			if (linkGeoDatas) {
				// links have already been loaded
				for (i = 0; i < linkGeoDatas.length; i++) {
					onLink.call(onLink, linkGeoDatas[i]);
				}
				if (onComplete)
					onComplete.call(onComplete);
			}
			else {
				// need to load links
				linkGeoDatas = [];
				linksRemaining = linkIds ? linkIds.length : 0;
				lastCbReturn = true;
				for (i = 0; lastCbReturn !== false && linkIds && i < linkIds.length; i++) {
					linkService.getById(linkIds[i]).then(
							function(link) {
								if (lastCbReturn === false)
									return;
								var linkGeoData;
								linksRemaining--;
								linkGeoData = new core.geo.LinkGeoData(null, link, _this, geoDataRetriever);
								linkGeoDatas.push(linkGeoData);
								if (onLink)
									lastCbReturn = onLink.call(linkGeoData);
								if ((linksRemaining == 0 || lastCbReturn === false) && onComplete)
									onComplete.call(onComplete);
							},
							function(error) {
								if (lastCbReturn === false)
									return;
								linksRemaining--;
								if (onError) {
									lastCbReturn = onError.call(onError);
									if ((linksRemaining == 0 || lastCbReturn === false) && onComplete)
										onComplete.call(onComplete);
								}
							}
						);
				}
			}
		};
		_this = $.extend(_super, {

			/**
			 * Function: getLinkLibrary
			 * 
			 * Returns:
			 *   Object. JSON representation of CORE LinkLibrary.
			 */
			getLinkLibrary: function() {
				return linkLibrary;
			},

			/**
			 * Function: findByKmlFeatureType
			 * 
			 * See Also:
			 *   <GeoData.findByKmlFeatureType>
			 */
			findByKmlFeatureType: function(kmlFeatureType, callback) {
				lazyLoadLinks(
					function(linkGeoData) {
						linkGeoData.findByKmlFeatureType(kmlFeatureType, callback);
						return true;
					},
					function(error) {
						console.log("Error in findByKmlFeatureType(): " + error);
					},
					function() {
						// do nothing
					});
			},

			/**
			 * Function: getKmlFeatureType
			 * 
			 * See Also:
			 *   <GeoData.getKmlFeatureType>
			 */
			getKmlFeatureType: function() {
				return core.geo.KmlFeatureType.FOLDER;
			},

			/**
			 * Function: getName
			 * 
			 * See Also:
			 *   <GeoData.getName>
			 */
			getName: function() {
				return linkLibrary && linkLibrary.fields 
					&& linkLibrary.fields.name ? linkLibrary.fields.name : null;
			},

			/**
			 * Function: hasChildren
			 * 
			 * See Also:
			 *   <GeoData.hasChildren>
			 */
			hasChildren: function() {
				return linkIds && linkIds.length > 0;
			},

			/**
			 * Function: getParent
			 * 
			 * See Also:
			 *   <GeoData.getParent>
			 */
			getParent: function() {
				return null;
			},

			/**
			 * Function: iterateChildren
			 * 
			 * See Also:
			 *   <GeoData.iterateChildren>
			 */
			iterateChildren: function(onChild, onComplete, onError) {
				lazyLoadLinks(onChild, onError, onComplete);
			},
			
			/**
			 * Function: getKmlString
			 * 
			 * See Also:
			 *   <GeoData.getKmlString>
			 */
			getKmlString: function(onComplete, onError) {
				var kml, name;
				kml = "";
				name = this.getName();
				lazyLoadLinks(
						function(linkGeoData) {
							linkGeoData.getKmlString(
									function(linkKmlString) {
										kml += linkKmlString;
									},
									onError);
						},
						onError,
						function() {
							kml = "<Folder xmlns=\"" + core.util.KmlUtils.KML_NS[0] + "\">"
								+ "<name>" + name + "</name>"
								+ kml
								+ "</Folder>";
							if (onComplete)
								onComplete.call(onComplete, kml);
						});
			},
			
			/**
			 * Function: getKmlJson
			 * 
			 * See Also:
			 *   <GeoData.getKmlJson>
			 */
			getKmlJson: function(onComplete, onError) {
				var kmlJson;
				kmlJson = {
					type: "Folder",
					name: this.getName(),
					visibility: false,
					open: true,
					children: []
				};
				lazyLoadLinks(
						function(linkGeoData) {
							linkGeoData.getKmlJson(
								function(linkKmlJson) {
									kmlJson.children.push(linkKmlJson);
								},
								function(error) {
									if (onError)
										onError.call(onError, error);
								}
							);
						},
						onError,
						function() {
							if (onComplete)
								onComplete.call(onComplete, kmlJson);
						});
			},

			/**
			 * Function: getEnclosingKmlUrl
			 * 
			 * See Also:
			 *   <GeoData.getEnclosingKmlUrl>
			 */
			getEnclosingKmlUrl: function(callback) {
				return null;
			},

			/**
			 * Function: removeAllChildren
			 * 
			 * See Also:
			 *   <GeoData.removeAllChildren>
			 */
			removeAllChildren: function(onComplete, onError) {
				// TODO
				throw "Not implemented";
			},

			/**
			 * Function: addChild
			 * 
			 * See Also:
			 *   <GeoData.addChild>
			 */
			addChild: function(geodata, onComplete, onError) {
				// TODO
				throw "Not implemented";
			},
		});
		return _this;
	};
	ns.LinkLibraryGeoData = LinkLibraryGeoData;
})(jQuery, window.core.geo);