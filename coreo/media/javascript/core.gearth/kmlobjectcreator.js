if (!window.core)
	window.core = {};
if (!window.core.gearth)
	window.core.gearth = {};

(function($, ns) {
	var KmlObjectCreator = function(ge) {
		this.ge = ge;
	};
	KmlObjectCreator.prototype = {
		
		/**
		 * Property: ge
		 * 
		 * Google Earth plugin instance.
		 */
		ge: null,
		
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
					throw "Unknown altitude mode: " + str;
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
				this._appendKmlAltitudeGeometry(kmlExtrudableGeometry, kmlJson);
			}
			return kmlExtrudableGeometry;
		},
		
		createKmlPoint: function(kmlJson) {
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
				this._appendKmlExtrudableGeometry(kmlPoint, kmlJson);
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
				kmlLookAt = this.ge.createKmlLookAt(id);
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
				var altitudeMode = getKmlAltitudeModeEnum(kmlJson.altitudeMode);
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
			var kmlRegion = null;
			return kmlRegion;
		},
		
		createKmlTimePrimitive: function(kmlJson) {
			var kmlTimePrimitive = null;
			return kmlTimePrimitive;
		},
		
		_appendKmlFeature: function(kmlFeature, kmlJson) {
			if (kmlFeature && kmlJson) {
				if ("name" in kmlJson)
					kmlFeature.setName(kmlJson.name);
				
				kmlFeature.setVisibility(false);
				if ("visibility" in kmlJson && kmlJson.visibility === true)
					kmlFeature.setVisibility(true);
				
				kmlFeature.setOpen(false);
				if ("open" in kmlJson && kmlJson.open === true)
					kmlFeature.setOpen(true);
				
				if ("address" in kmlJson)
					kmlFeature.setAddress(kmlJson.address);
				
				if ("snippet" in kmlJson)
					kmlFeature.setSnippet(kmlJson.snippet);
				
				if ("description" in kmlJson)
					kmlFeature.setDescription(kmlJson.description);
				
				if ("abstractView" in kmlJson) {
					var kmlAbstractView = this.createKmlAbstractView(kmlJson.abstractView);
					kmlFeature.setAbstractView(kmlAbstractView);
				}
				
				if ("styleUrl" in kmlJson)
					kmlFeature.setStyleUrl(kmlJson.styleUrl);
				
				if ("styleSelector" in kmlJson) {
					var kmlStyleSelector = this.createKmlStyleSelector(kmlJson.styleSelector);
					kmlFeature.setStyleSelector(kmlStyleSelector);					
				}
				
				if ("region" in kmlJson) {
					var kmlRegion = this.createKmlRegion(kmlJson.region);
					kmlFeature.setRegion(kmlRegion);					
				}
				
				if ("timePrimitive" in kmlJson) {
					var kmlTimePrimitive = this.createKmlTimePrimitive(kmlJson.timePrimitive);
					kmlFeature.setTimePrimitive(kmlTimePrimitive);
				}
				
				if ("opacity" in kmlJson) {
					var str = $.trim(kmlJson.opacity + "");
					var opacity = parseFloat(str);
					if (!isNaN(opacity))
						kmlFeature.setOpacity(opacity);					
				}
			}
			return kmlFeature;
		},
		
		createKmlPlacemark: function(kmlJson) {
			var kmlPlacemark = null;
			if (kmlJson) {
				var kmlPlacemark = this.ge.createPlacemark(geoData.id);
				var kmlGeometry = this.createKmlGeometry(kmlJson.geometry);
				if (kmlGeometry)
					kmlPlacemark.setGeometry(kmlGeometry);
				this._appendKmlFeature(kmlPlacemark, kmlJson);
			}
			return kmlPlacemark;
		},
		
		createKmlDocument: function(kmlJson) {
			var kmlDocument = null;
			if (kmlJson) {
				var id = kmlJson.id ? kmlJson.id : "";
				kmlDocument = this.ge.createDocument(id);
				
				this._appendKmlFeature(kmlDocument, kmlJson);
			}
			return kmlDocument;
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
			geodata.getKmlJson($.proxy(function(kmlJson) {
				var kmlObject = null;
				if (kmlObject && kmlJson.type) {
					switch (kmlJson.type) {
					case "Placemark":
						kmlObject = this.createKmlPlacemark(kmlJson);
						callback.call(callback, kmlObject);
						break;
					case "Document":
						kmlObject = this.createKmlDocument(kmlJson);
						var childGeoDatas = [];
						geodata.iterateChildren($.proxy(function(childGeoData) {
							childGeoDatas.push(childGeoData);
						}, this));
						while (childGeoDatas.length > 0) {
							var totalToAppend = childGeoDatas.length;
							var appended = 0;
							var childGeoData = childGeoDatas.shift();
							this.createFromGeoData(childGeoData, $.proxy(function(childKmlObject) {
								kmlObject.appendChild(childKmlObject);
								appended++;
								if (totalToAppend == appended) {
									callback.call(callback, kmlObject);
								}
							}));							
						}
						break;
					case "NetworkLink":
						kmlObject = this.createKmlFolderFromLink(kmlJson);
						callback.call(callback, kmlObject);
						break;
					case "Folder":
						kmlObject = this.createKmlFolder(kmlJson);
						callback.call(callback, kmlObject);
						break;
					default:
						console.log("Unhandled KML object: " + kmlJson.type);
					}
				}
				
			}, this));
		}
	};
	ns.KmlObjectCreator = KmlObjectCreator;
})(jQuery, window.core.gearth);