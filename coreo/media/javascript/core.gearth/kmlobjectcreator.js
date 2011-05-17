/**
 * Class: KmlObjectCreator
 * 
 * Dependencies:
 *   - jQuery
 *   - core.util.URI
 *   - core.util.Iterate
 */

if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function($, ns) {
	var URI = core.util.URI;
	if (!URI)
		throw "Dependency not found: core.util.URI";
	var Iterate = core.util.Iterate;
	if (!Iterate)
		throw "Dependency not found: core.util.Iterate";

	/**
	 * Constructor: KmlObjectCreator
	 * 
	 * Parameters:
	 *   ge - Google Earth plugin instance.
	 *   gex - GEarthExtensions.
	 *   kmlJsonProxyService - <KmlJsonProxyService>.
	 */
	var KmlObjectCreator = function(ge, gex, kmlJsonProxyService) {
		this.ge = ge;
		this.gex = gex;
		this.kmlJsonProxyService = kmlJsonProxyService;
	};
	KmlObjectCreator.GEODATA_ID_KEY = "core-geodata-id";
	KmlObjectCreator.prototype = {
		
		/**
		 * Property: kmlJsonProxyService
		 * 
		 * <KmlJsonProxyService>
		 */
		kmlJsonProxyService: null,
		
		/**
		 * Property: ge
		 * 
		 * Google Earth plugin instance.
		 */
		ge: null,
		
		/**
		 * Property: gex
		 * 
		 * GEarthExtensions.
		 */
		gex: null,
		
		setGeoDataId: function(kmlObject, geoDataId) {
			this.gex.util.setJsDataValue(kmlObject, KmlObjectCreator.GEODATA_ID_KEY, geoDataId);
		},
		
		getGeoDataId: function(kmlObject) {
			return this.gex.util.getJsDataValue(kmlObject, KmlObjectCreator.GEODATA_ID_KEY);
		},
		
		getKmlAltitudeModeEnum: function(str) {
			var altitudeMode = this.ge.ALTITUDE_CLAMP_TO_GROUND;
			if (str && typeof str === "string") {
				str = $.trim(str);
				switch (str) {
				case "clampToGround":
					break;
				case "relativeToGround":
					altitudeMode = this.ge.ALTITUDE_RELATIVE_TO_GROUND;
					break;
				case "absolute":
					altitudeMode = this.ge.ALTITUDE_ABSOLUTE;
					break;
				default:
					console.log("WARNING: Unknown altitude mode - " + str);
					// throw "Unknown altitude mode: " + str;
				}
			}
			return altitudeMode;
		},
		
		_appendKmlAltitudeGeometry: function(kmlAltitudeGeometry, kmlJson) {
			if (kmlAltitudeGeometry && kmlJson) {
				if ("altitudeMode" in kmlJson) {
					var altitudeMode = this.getKmlAltitudeModeEnum(kmlJson.altitudeMode);
					kmlAltitudeGeometry.setAltitudeMode(altitudeMode);
				}
			}
			return kmlAltitudeGeometry;
		},
		
		_appendKmlExtrudableGeometry: function(kmlExtrudableGeometry, kmlJson) {
			if (kmlJson && kmlExtrudableGeometry) {
				if ("extrude" in kmlJson && kmlJson.extrude === true) {
					kmlExtrudableGeometry.setExtrude(true);
				}
				else {
					kmlExtrudableGeometry.setExtrude(false);
				}
				if ("tessellate" in kmlJson && kmlJson.tessellate === true) {
					kmlExtrudableGeometry.setTessellate(true);
				}
				else {
					kmlExtrudableGeometry.setTessellate(false);
				}		
				kmlExtrudableGeometry = this._appendKmlAltitudeGeometry(kmlExtrudableGeometry, kmlJson);
			}
			return kmlExtrudableGeometry;
		},
		
		createKmlPoint: function(kmlJson, geoDataId) {
			var kmlPoint = null;
			if (kmlJson) {
				var id = "id" in kmlJson ? kmlJson.id : "";
				kmlPoint = this.ge.createPoint(id);
				if (kmlJson.coordinates 
						&& typeof kmlJson.coordinates === "string") {
					var values = kmlJson.coordinates.split(",");
					var valueOrder = ["setLongitude", "setLatitude", "setAltitude"];
					for (var i = 0; i < values.length; i++) {
						var val = $.trim(values[i]);
						if (val.length > 0) {
							var num = parseFloat(val);
							if (!isNaN(num)) {
								kmlPoint[valueOrder[i]](num);
							}
						}
					}
				}
				kmlPoint = this._appendKmlExtrudableGeometry(kmlPoint, kmlJson);
			}
			return kmlPoint;
		},

		createKmlGeometry: function(kmlJson) {
			var kmlGeometry = null;
			if (kmlJson) {
				switch (kmlJson.type) {
				case "Point":
					kmlGeometry = this.createKmlPoint(kmlJson);
					break;
				default:
					console.log("Unhandled KML geometry type: " + kmlJson.type);
				}
			}
			return kmlGeometry;
		},
		
		_appendKmlAbstractView: function(kmlAbstractView, kmlJson) {
			if (kmlAbstractView && kmlJson) {
				if (kmlJson.timePrimitive) {
					var kmlTimePrimitive = this.createKmlTimePrimitive(kmlJson.timePrimitive);
					kmlAbstractView.setTimePrimitive(kmlTimePrimitive);
				}
				// KmlAbstractView also supports "ViewerOptions"
			}
			return kmlAbstractView;
		},
		
		createKmlCamera: function(kmlJson) {
			var kmlCamera = null;
			if (kmlJson) {
				var id = kmlJson.id ? kmlJson.id : "";
				kmlCamera = this.ge.createCamera(id);
				if (kmlJson.latitude) {
					var lat = parseFloat(kmlJson.latitude);
					if (!isNaN(lat))
						kmlCamera.setLatitude(lat);
				}
				if (kmlJson.longitude) {
					var lon = parseFloat(kmlJson.longitude);
					if (!isNaN(lon))
						kmlCamera.setLongitude(lon);
				}
				if (kmlJson.altitude) {
					var alt = parseFloat(kmlJson.altitude);
					if (!isNaN(alt))
						kmlCamera.setAltitude(alt);
				}
				if (kmlJson.heading) {
					var heading = parseFloat(kmlJson.heading);
					if (!isNaN(heading))
						kmlCamera.setHeading(heading);
				}
				if (kmlJson.tilt) {
					var tilt = parseFloat(kmlJson.tilt);
					if (!isNaN(tilt))
						kmlCamera.setTilt(tilt);
				}
				if (kmlJson.roll) {
					var roll = parseFloat(kmlJson.roll);
					if (!isNaN(roll))
						kmlCamera.setRoll(roll);
				}
				var altitudeMode = getKmlAltitudeModeEnum(kmlJson.altitudeMode);
				kmlCamera.setAltitudeMode(altitudeMode);
				this._appendKmlAbstractView(kmlCamera, kmlJson);
			}
			return kmlCamera;
		},
		
		createKmlLookAt: function(kmlJson) {
			var kmlLookAt = null;
			if (kmlJson) {
				var id = kmlJson.id ? kmlJson.id : "";
				kmlLookAt = this.ge.createLookAt(id);
				if (kmlJson.latitude) {
					var lat = parseFloat(kmlJson.latitude);
					if (!isNaN(lat))
						kmlLookAt.setLatitude(lat);
				}
				if (kmlJson.longitude) {
					var lon = parseFloat(kmlJson.longitude);
					if (!isNaN(lon))
						kmlLookAt.setLongitude(lon);
				}
				if (kmlJson.range) {
					var range = parseFloat(kmlJson.range);
					if (!isNaN(range))
						kmlLookAt.setRange(range);
				}
				if (kmlJson.tilt) {
					var tilt = parseFloat(kmlJson.tilt);
					if (!isNaN(tilt))
						kmlLookAt.setTilt(tilt);
				}
				if (kmlJson.heading) {
					var heading = parseFloat(kmlJson.heading);
					if (!isNaN(heading))
						kmlLookAt.setHeading(heading);
				}
				if (kmlJson.altitude) {
					var alt = parseFloat(kmlJson.altitude);
					if (!isNaN(alt))
						kmlLookAt.setAltitude(alt);
				}
				var altitudeMode = this.getKmlAltitudeModeEnum(kmlJson.altitudeMode);
				kmlLookAt.setAltitudeMode(altitudeMode);
				this._appendKmlAbstractView(kmlLookAt, kmlJson);
			}
			return kmlLookAt;
		},

		createKmlAbstractView: function(kmlJson) {
			var kmlAbstractView = null;
			if (kmlJson && kmlJson.type) {
				switch (kmlJson.type) {
				case "Camera":
					kmlAbstractView = this.createKmlCamera(kmlJson);
					break;
				case "LookAt":
					kmlAbstractView = this.createKmlLookAt(kmlJson);
					break;
				default:
					console.log("Unhandled KML AbstractView: " + kmlJson.type);
				}
			}
			return kmlAbstractView;
		},

		getKmlColorModeEnum: function(str) {
			var colorMode = this.ge.COLOR_INHERIT;
			if (str === 'normal') {
				colorMode = this.ge.COLOR_NORMAL;
			}
			else if (str === 'random') {
				colorMode = this.ge.COLOR_RANDOM;
			}
			return colorMode;
		},

		_appendKmlColorStyle: function(kmlColorStyle, kmlJson) {
			var color = kmlJson.color;
			if (color)
				kmlColorStyle.getColor().set(color);
			var colorModeStr = kmlJson.colorMode;
			if (colorModeStr) {
				var colorMode = this.getKmlColorModeEnum(colorModeStr);
				kmlColorStyle.setColorMode(colorMode);
			}
			return kmlColorStyle;
		},
		
		createKmlStyle: function(kmlJson) {
			var kmlStyle = null;
			if (kmlJson) {
				var id = kmlJson.id ? kmlJson.id : "";
				kmlStyle = this.ge.createStyle(id);
				if (kmlJson.IconStyle) {
					var kmlIconStyle = kmlStyle.getIconStyle();
					this._appendKmlColorStyle(kmlIconStyle, kmlJson.IconStyle);
				}
				if (kmlJson.LabelStyle) {
					var kmlLabelStyle = kmlStyle.getLabelStyle();
					this._appendKmlColorStyle(kmlLabelStyle, kmlJson.LabelStyle);
				}
				if (kmlJson.LineStyle) {
					var kmlLineStyle = kmlStyle.getLineStyle();
					this._appendKmlColorStyle(kmlLineStyle, kmlJson.LineStyle);
				}
				if (kmlJson.PolyStyle) {
					var kmlPolyStyle = kmlStyle.getPolyStyle();
					this._appendKmlColorStyle(kmlPolyStyle, kmlJson.PolyStyle);
				}
				if (kmlJson.BalloonStyle) {
					var kmlBalloonStyle = kmlStyle.getBalloonStyle();
					// TODO
				}
				if (kmlJson.ListStyle) {
					var kmlListStyle = kmlStyle.getListStyle();
					// TODO
				}
			}
			return kmlStyle;
		},
		
		createKmlStyleMap: function(kmlJson) {
			console.log("WARNING: Not implemented - createKmlStyleMap()");
			// TODO
		},
		
		createKmlStyleSelector: function(kmlJson) {
			var kmlStyleSelector = null;
			if (kmlJson && kmlJson.type) {
				switch (kmlJson.type) {
				case "Style":
					kmlStyleSelector = this.createKmlStyle(kmlJson);
					break;
				case "StyleMap":
					kmlStyleSelector = this.createKmlStyleMap(kmlJson);
					break;
				default:
					console.log("Unsupported KML StyleSelector: " + kmlJson.type);
				}
			}
			return kmlStyleSelector;
		},
		
		// TODO
		createKmlRegion: function(kmlJson) {
			console.log("WARNING: Not implemented - createKmlRegion()");
			var kmlRegion = null;
			return kmlRegion;
		},
		
		createKmlTimePrimitive: function(kmlJson) {
			console.log("WARNING: Not implemented - createKmlTimePrimitive()");
			var kmlTimePrimitive = null;
			return kmlTimePrimitive;
		},
		
		_appendKmlFeature: function(kmlFeature, kmlJson) {
			if (kmlFeature && kmlJson) {
				if (kmlJson.name)
					kmlFeature.setName(kmlJson.name);
				
				kmlFeature.setVisibility(false);
				if ("visibility" in kmlJson && kmlJson.visibility === true)
					kmlFeature.setVisibility(true);
				
				kmlFeature.setOpen(false);
				if ("open" in kmlJson && kmlJson.open === true)
					kmlFeature.setOpen(true);
				
				if (kmlJson.address)
					kmlFeature.setAddress(kmlJson.address);
				
				if (kmlJson.snippet)
					kmlFeature.setSnippet(kmlJson.snippet);
				
				if (kmlJson.description)
					kmlFeature.setDescription(kmlJson.description);
				
				if (kmlJson.abstractView) {
					var kmlAbstractView = this.createKmlAbstractView(kmlJson.abstractView);
					kmlFeature.setAbstractView(kmlAbstractView);
				}

				/*
				if (kmlJson.styleUrl) {
					kmlFeature.setStyleUrl(kmlJson.styleUrl);
					// TODO: why does kmlFeature.getStyleUrl() return ""?
					console.log("styleUrl: " + kmlFeature.getStyleUrl() + ", " + kmlJson.styleUrl);
				}
				
				if (kmlJson.styleSelector) {
					var kmlStyleSelector = this.createKmlStyleSelector(kmlJson.styleSelector);
					kmlFeature.setStyleSelector(kmlStyleSelector);
					console.log("kmlStyleSelector: " + kmlStyleSelector.getKml());
				}
				*/
				
				if (kmlJson.region) {
					var kmlRegion = this.createKmlRegion(kmlJson.region);
					kmlFeature.setRegion(kmlRegion);					
				}
				
				if (kmlJson.timePrimitive) {
					var kmlTimePrimitive = this.createKmlTimePrimitive(kmlJson.timePrimitive);
					kmlFeature.setTimePrimitive(kmlTimePrimitive);
				}
				
				if (kmlJson.opacity) {
					var str = $.trim(kmlJson.opacity + "");
					var opacity = parseFloat(str);
					if (!isNaN(opacity))
						kmlFeature.setOpacity(opacity);					
				}
			}
			return kmlFeature;
		},

		_appendKmlOverlay: function(kmlOverlay, kmlJson) {
			if (kmlOverlay) {
				if ("drawOrder" in kmlJson) {
					var drawOrder = window.parseInt(kmlJson.drawOrder);
					kmlOverlay.setDrawOrder(drawOrder);					
				}
				if (kmlJson.color) {
					kmlOverlay.getColor().set(kmlJson.color);
				}
				if (kmlJson.icon) {
					// TODO
					//kmlOverlay.setIcon(icon);					
				}
				this._appendKmlFeature(kmlOverlay, kmlJson);
			}
			return kmlOverlay;
		},

		createKmlPlacemark: function(kmlJson, geoDataId) {
			var kmlPlacemark = null;
			if (kmlJson) {
				var id = kmlJson.id ? kmlJson.id + "" : "";
				var kmlPlacemark = this.ge.createPlacemark(id);
				this.setGeoDataId(kmlPlacemark, geoDataId);
				if (kmlJson.geometry) {
					var kmlGeometry = this.createKmlGeometry(kmlJson.geometry);
					if (kmlGeometry)
						kmlPlacemark.setGeometry(kmlGeometry);
				}
				this._appendKmlFeature(kmlPlacemark, kmlJson);
			}
			return kmlPlacemark;
		},

		createKmlScreenOverlay: function(kmlJson, geoDataId) {
			var kmlScreenOverlay = null;
			if (kmlJson) {
				var id = kmlJson.id ? kmlJson.id + "" : "";
				var kmlScreenOverlay = this.ge.createScreenOverlay(id);
				if ("rotation" in kmlJson) {
					var rotation = window.parseFloat(kmlJson.rotation);
					kmlScreenOverlay.setRotation(rotation);
				}
				
				// TODO
				if (kmlJson.screenXY) {
					
				}
				if (kmlJson.overlayXY) {
					
				}
				if (kmlJson.rotationXY) {
					
				}
				if (kmlJson.size) {
					
				}

				this._appendKmlOverlay(kmlScreenOverlay, kmlJson);
			}
			return kmlScreenOverlay;
		},

		createKmlDocument: function(kmlJson, geoDataId) {
			var kmlDocument = null;
			if (kmlJson) {
				var id = kmlJson.id ? kmlJson.id : "";
				kmlDocument = this.ge.createDocument(id);
				this.setGeoDataId(kmlDocument, geoDataId);
				this._appendKmlFeature(kmlDocument, kmlJson);
			}
			return kmlDocument;
		},

		createKmlFolder: function(kmlJson, geoDataId) {
			var kmlFolder = null;
			if (kmlJson) {
				var id = kmlJson.id ? kmlJson.id : "";
				kmlFolder = this.ge.createFolder(id);
				this.setGeoDataId(kmlFolder, geoDataId);
				this._appendKmlFeature(kmlFolder, kmlJson);
			}
			return kmlFolder;
		},
		
		_createChildren: function(geodata, kmlContainer, callback) {
			var styleUrl, localStyleUrl, absoluteUrl, timer;
			var cb = callback;
			var waiting = 0;
			
			// TODO: Work children off of a queue, instead of in "parallel"
			/*
			var queue = [];
			var queueTimer = null;
			var executeQueue = function() {
				
			};
			var queueChild = function(child) {
				
			};
			*/

			var appendChild = function(childKmlObject) {
				waiting--;
				if (childKmlObject) {
					kmlContainer.getFeatures().appendChild(childKmlObject);
				}
			};

			var childKmlObjectCreated = function(childKmlObject) {
				if (childKmlObject) {
					// check the styleUrl
					styleUrl = childKmlObject.getStyleUrl();
					if (styleUrl && styleUrl.charAt(0) !== '#') {
						// styleUrl refers to an external document, which isn't supported 
						// in the GE API except for within NetworkLinks
						// Fix the styleUrl so it refers to a style in this document
						localStyleUrl = "#" + styleUrl.replace(/\W/g, "_");
						if (!kmlContainer.getElementByUrl(localStyleUrl)) {
							console.log("Loading remote document with style...");
							// load the style document
							childGeoData.getEnclosingKmlUrl($.proxy(function(url) {
								absoluteUrl = new URI(url).resolve(new URI(childKmlObject.styleUrl)).toString();
								this.kmlJsonProxyService.getKmlJson(absoluteUrl, $.proxy(function(kmlJson) {
									this.createFromKmlJson(kmlJson, $.proxy(function(kmlObject) {
										if (kmlObject && kmlObject.getElementsByType) {
											var styleObjects = kmlObject.getElementsByType("KmlStyle");
											for (var i = 0; i < styleObjects.getLength(); i++) {
												var originalStyle = styleObjects.item(i);
												var styleWithId = this.ge.createStyle(localStyleUrl);
												var substyle = originalStyle.getIconStyle();
												if (substyle)
													styleWithId.setIconStyle(substyle);
												substyle = originalStyle.getLabelStyle();
												if (substyle)
													styleWithId.setLabelStyle(substyle);
												substyle = originalStyle.getLineStyle();
												if (substyle)
													styleWithId.setLineStyle(substyle);
												substyle = originalStyle.getListStyle();
												if (substyle)
													styleWithId.setListStyle(substyle);
												substyle = originalStyle.getPolyStyle();
												if (substyle)
													styleWithId.setPolyStyle(substyle);
												substyle = originalStyle.getBalloonStyle();
												if (substyle)
													styleWithId.setBalloonStyle(substyle);
												kmlContainer.getFeatures().appendChild(styleWithId);
											}
										}
										childKmlObject.setStyleUrl(localStyleUrl);
										appendChild(childKmlObject);
									}, this));
								}, this));
							}, this));
						}
						else {
							// style has already been loaded
							console.log("style already loaded: " + styleUrl);
							appendChild(childKmlObject);
						}
					}
					else {
						// this is a local style URL (ID)
						appendChild(childKmlObject);
					}
				}
				else {
					// kmlObject wasn't created
					appendChild(childKmlObject);
				}
			};
			var handleGeoDataChild = $.proxy(function(childGeoData) {
				waiting++;
				this.createFromGeoData(childGeoData, childKmlObjectCreated);
			}, this);
			var checkFinished = function() {
				if (waiting === 0) {
					cb.call(cb, kmlContainer);
					window.clearInterval(timer);
				}
			};
			var waitForKmlObjects = $.proxy(function() {
				// All children have been iterated. Wait for all to be 
				// converted to KmlObjects.
				if (timer) {
					throw "TIMER SHOULD BE UNDEFINED";
				}
				timer = window.setInterval(checkFinished, 200);
			}, this);
			geodata.iterateChildren(handleGeoDataChild, waitForKmlObjects);
			/*
	
			var cb = callback;
			var totalToAppend = childGeoDatas.length;
			var appended = 0;
			var handleGeoData = $.proxy(function(childGeoData, index) {
				this.createFromGeoData(childGeoData, function(childKmlObject) {
					var appendChild = $.proxy(function() {
						if (childKmlObject) {
							kmlContainer.getFeatures().appendChild(childKmlObject);
						}
						appended++;
						if (totalToAppend == appended) {
							console.log("finished");
							cb.call(cb, kmlContainer);
						}
					});
					if (childKmlObject) {
						// check the styleUrl
						var styleUrl = childKmlObject.getStyleUrl();
						if (styleUrl && styleUrl.charAt(0) !== '#') {
							// styleUrl refers to an external document, which isn't supported 
							// in the GE API except for within NetworkLinks
							// Fix the styleUrl so it refers to a style in this document
							var localStyleUrl = "#" + styleUrl.replace(/\W/g, "_");
							if (!kmlContainer.getElementByUrl(localStyleUrl)) {
								console.log("Loading remote document with style...");
								// load the style document
								childGeoData.getEnclosingKmlUrl($.proxy(function(url) {
									var absoluteUrl = new URI(url).resolve(new URI(childKmlObject.styleUrl)).toString();
									this.kmlJsonProxyService.getKmlJson(absoluteUrl, $.proxy(function(kmlJson) {
										this.createFromKmlJson(kmlJson, $.proxy(function(kmlObject) {
											if (kmlObject && kmlObject.getElementsByType) {
												var styleObjects = kmlObject.getElementsByType("KmlStyle");
												for (var i = 0; i < styleObjects.getLength(); i++) {
													var originalStyle = styleObjects.item(i);
													var styleWithId = this.ge.createStyle(localStyleUrl);
													var substyle = originalStyle.getIconStyle();
													if (substyle)
														styleWithId.setIconStyle(substyle);
													substyle = originalStyle.getLabelStyle();
													if (substyle)
														styleWithId.setLabelStyle(substyle);
													substyle = originalStyle.getLineStyle();
													if (substyle)
														styleWithId.setLineStyle(substyle);
													substyle = originalStyle.getListStyle();
													if (substyle)
														styleWithId.setListStyle(substyle);
													substyle = originalStyle.getPolyStyle();
													if (substyle)
														styleWithId.setPolyStyle(substyle);
													substyle = originalStyle.getBalloonStyle();
													if (substyle)
														styleWithId.setBalloonStyle(substyle);
													kmlContainer.getFeatures().appendChild(styleWithId);
												}
											}
											childKmlObject.setStyleUrl(localStyleUrl);
											appendChild();
										}, this));
									}, this));
								}, this));
							}
							else {
								// style has already been loaded
								console.log("style already loaded: " + styleUrl);
								appendChild();
							}
						}
						else {
							// this is a local style URL (ID)
							appendChild();
						}
					}
					else {
						// kmlObject wasn't created
						appendChild();
					}
				});
			}, this);
			
			Iterate.iterate(childGeoDatas, {
				onItem: handleGeoData
			});
			*/
		},
		
		_createChildrenFromKmlJson: function(kmlContainer, callback) {
			var cb = callback;
			if (kmlContainer && kmlContainer.children) {
				var totalToAppend = kmlContainer.children.length;
				var appended = 0;
				for (var i = 0; kmlContainer.children && i < kmlContainer.children.length; i++) {
					var childKmlJson = kmlContainer.children[i];
					this.createFromKmlJson(childKmlJson, $.proxy(function(childKmlObject) {
						kmlContainer.getFeatures().appendChild(childKmlObject);
						appended++;
						if (appended === totalToAppend) {
							cb.call(cb, kmlContainer);
						}
					}, this));
				}
			}
		},

		createFromKmlJson: function(kmlJson, callback) {
			console.log("createFromKmlJson()");
			var kmlObject = null;
			var cb = callback;
			if (kmlJson && kmlJson.type) {
				switch (kmlJson.type) {
				case "Placemark":
					kmlObject = this.createKmlPlacemark(kmlJson);
					cb.call(cb, kmlObject);
					break;
				case "Document":
					kmlObject = this.createKmlDocument(kmlJson);
					this._createChildrenFromKmlJson(kmlObject, function(kmlDocument) {
						cb.call(cb, kmlDocument);
					});
					break;
				case "NetworkLink":
					// we don't want the GE plugin to be managing 
					// network link updates, so make this a Folder 
					// object instead of a NetworkLink object
					kmlObject = this.createKmlFolder(kmlJson);
					this._createChildrenFromKmlJson(kmlObject, function(kmlFolder) {
						cb.call(cb, kmlFolder);
					});
					break;
				case "Folder":
					kmlObject = this.createKmlFolder(kmlJson);
					this._createChildrenFromKmlJson(kmlObject, function(kmlFolder) {
						cb.call(cb, kmlFolder);
					});
					break;
				default:
					cb.call(cb, null);
					console.log("Unhandled KML object: " + kmlJson.type);
				}
			}
		},
	
		/**
		 * Function: createFromGeoData
		 * 
		 * Converts a GeoData into a GE KmlObject instance.
		 * 
		 * Parameters:
		 *   geodata - <GeoData> to convert.
		 *   callback - Function. Invoked with the KmlObject instance.
		 */
		createFromGeoData: function(geodata, callback) {
			var geoDataId = geodata.id;
			var onComplete = callback;
			geodata.getKmlJson($.proxy(function(kmlJson) {
				var kmlObject = null;
				if (kmlJson && kmlJson.type) {
					switch (kmlJson.type) {
					case "Placemark":
						kmlObject = this.createKmlPlacemark(kmlJson, geoDataId);
						onComplete.call(onComplete, kmlObject);
						break;
					case "Document":
						kmlObject = this.createKmlDocument(kmlJson, geoDataId);
						this._createChildren(geodata, kmlObject, function(kmlDocument) {
							onComplete.call(onComplete, kmlDocument);
						});
						break;
					case "NetworkLink":
						// we don't want the GE plugin to be managing 
						// network link updates, so make this a Folder 
						// object instead of a NetworkLink object
						kmlObject = this.createKmlFolder(kmlJson, geoDataId);
						this._createChildren(geodata, kmlObject, function(kmlFolder) {
							onComplete.call(onComplete, kmlFolder);
						});
						break;
					case "Folder":
						kmlObject = this.createKmlFolder(kmlJson, geoDataId);
						this._createChildren(geodata, kmlObject, function(kmlFolder) {
							onComplete.call(onComplete, kmlFolder);
						});
						break;
					case "ScreenOverlay":
						kmlObject = this.createKmlScreenOverlay(kmlJson, geoDataId);
						onComplete.call(onComplete, kmlObject);
						break;
					default:
						console.log("Unhandled KML object: " + kmlJson.type);
						onComplete.call(onComplete, null);
					}
				}
			}, this));
		}
	};
	ns.KmlObjectCreator = KmlObjectCreator;
})(jQuery, window.core.gearth);