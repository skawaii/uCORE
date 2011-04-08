/**
 * Class: NetworkLinkQueue
 * 
 * Collection of NetworkLink GeoData objects. Handles polling and updating 
 * NetworkLink content.
 * 
 * Namespace:
 *   core.geo
 *   
 * Dependencies:
 *   - jQuery
 *   - core.geo.GeoDataStore
 *   - core.events.GeoDataUpdateBeginEvent
 *   - core.events.GeoDataUpdateEndEvent
 *   - core.events.ShowFeatureEvent
 *   - core.events.HideFeatureEvent
 *   - core.events.ViewChangedEvent
 *   - core.util.URI
 */

if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	var GeoDataUpdateBeginEvent = core.events.GeoDataUpdateBeginEvent;
	if (!GeoDataUpdateBeginEvent)
		throw "Dependency not found: core.events.GeoDataUpdateBeginEvent";
	var GeoDataUpdateEndEvent = core.events.GeoDataUpdateEndEvent;
	if (!GeoDataUpdateEndEvent)
		throw "Dependency not found: core.events.GeoDataUpdateEndEvent";
	var GeoDataStore = core.geo.GeoDataStore;
	if (!GeoDataStore)
		throw "Dependency not found: core.geo.GeoDataStore";
	var ShowFeatureEvent = core.events.ShowFeatureEvent;
	if (!ShowFeatureEvent)
		throw "Dependency not found: core.events.ShowFeatureEvent";
	var HideFeatureEvent = core.events.HideFeatureEvent;
	if (!HideFeatureEvent)
		throw "Dependency not found: core.events.HideFeatureEvent";
	var ViewChangedEvent = core.events.ViewChangedEvent;
	if (!ViewChangedEvent)
		throw "Dependency not found: core.events.ViewChangedEvent";
	var KmlFeatureType = core.geo.KmlFeatureType;
	if (!KmlFeatureType)
		throw "Dependency not found: core.geo.KmlFeatureType";
	var URI = core.util.URI;
	if (!URI)
		throw "Dependency not found: core.util.URI";
	
	var NetworkLinkQueue = function(geodataRetriever, eventChannel, currentBbox, currentAltitude) {
		this.geodataRetriever = geodataRetriever;
		this.eventChannel = eventChannel;
		this._bbox = currentBbox;
		this._altitude = currentAltitude;
		this._init();
	};
	NetworkLinkQueue.EVENT_PUBLISHER_NAME = "NetworkLinkQueue";
	NetworkLinkQueue.prototype = {
		geodataRetriever: null,

		eventChannel: null,

		_links: {},

		_timer: null,

		_bbox: null,

		_altitude: null,

		_hidden: [],

		_init: function() {
			if (this.eventChannel && ("subscribe" in this.eventChannel)
					&& (typeof this.eventChannel.subscribe === "function")) {
				this.eventChannel.subscribe(ShowFeatureEvent.type, $.proxy(function(showFeatureEvent) {
					if (showFeatureEvent && showFeatureEvent.geoData 
							&& showFeatureEvent.geoData.id
							&& showFeatureEvent.geoData.getKmlFeatureType() === KmlFeatureType.NETWORK_LINK) {
						var idx = $.inArray(showFeatureEvent.geoData.id, this._hidden);
						if (idx >= 0) {
							this._hidden.splice(idx, 1);
							this.resetTimer();
						}
						else {
							this.add(showFeatureEvent.geoData.id);
						}
					}
				}, this));
				this.eventChannel.subscribe(HideFeatureEvent.type, $.proxy(function(hideFeatureEvent) {
					if (hideFeatureEvent && hideFeatureEvent.geoData
							&& hideFeatureEvent.geoData.id
							&& hideFeatureEvent.geoData.getKmlFeatureType() === KmlFeatureType.NETWORK_LINK) {
						this._hidden.push(hideFeatureEvent.geoData.id);
						this.resetTimer();
					}
				}, this));
				this.eventChannel.subscribe(ViewChangedEvent.type, $.proxy(function(viewChangedEvent) {
					if (viewChangedEvent && viewChangedEvent.bounds) {
						this._bbox = viewChangedEvent.bounds;
						this._altitude = viewChangedEvent.altitude;
						this.execute();
					}
				}, this));
			}
		},
		
		add: function(geoDataId) {
			this._links[geoDataId] = new NetworkLinkQueue.Record(geoDataId);
			this.resetTimer();
		},

		removeById: function(geoDataId) {
			delete this._links[geoDataId];
		},

		resetTimer: function() {
			if (this._timer) {
				window.clearTimeout(this._timer);
				this._timer = null;
			}
			var nextPollInterval = this.computeNextPollInterval();
			if (nextPollInterval >= 0) {
				nextPollInterval = Math.max(nextPollInterval, 1);
				this._timer = window.setTimeout(
						$.proxy(this.execute, this), 
						nextPollInterval);				
			}
		},

		RETRY_INTERVAL: 3000,

		computeNextPollInterval: function() {
			var nextUpdate = -1;
			if (this._links) {
				for (var linkId in this._links) {
					// don't consider hidden features
					if ($.inArray(linkId, this._hidden) < 0) {
						var record = this._links[linkId];
						var link = GeoDataStore.getById(linkId);
						if (link && record) {
							if (record.successTime < 0) {
								// this link has never been populated
								// update now if it hasn't been attempted
								if (record.attemptTime < 0) {
									return 0;
								}
								// retry this link after a period of time (RETRY_INTERVAL)
								var tmp = record.attemptTime + this.RETRY_INTERVAL;
								if (nextUpdate == -1 || tmp < nextUpdate) {
									nextUpdate = tmp;
								}
							}
							else if (this.isTimeBasedUpdate(link)) {
								var tmp = this.getNextDesiredUpdateTime(
										link, record.successTime);
								if (nextUpdate == -1 || tmp < nextUpdate) {
									nextUpdate = tmp;
								}
							}
						}
						else {
							// TODO: remove this link
						}
					}
				}				
			}
			if (nextUpdate > -1) {
				// some links use onInterval refresh mode
				return Math.max(nextUpdate - new Date().getTime(), 0);
			}
			// none of the links use onInterval refresh mode
			return -1;
		},

		execute: function() {
			if (this._links) {
				var finishedLooping = false;
				var total = 0;
				var count = 0;
				var resetTimerAfterAllLinks = $.proxy(function() {
					count++;
					if (finishedLooping && count == total) {
						this.resetTimer();
					}
				}, this);
				for (var linkId in this._links) {
					// don't update hidden links (hidden link data is now stale)
					if ($.inArray(linkId, this._hidden) < 0) {
						var geodata = GeoDataStore.getById(linkId);
						var record = this._links[linkId];
						if (geodata && record) {
							geodata.getEnclosingKmlUrl($.proxy(function(enclosingKmlUrl) {
								geodata.getKmlJson($.proxy(function(kmlJson) {
									var absoluteUrl = new URI(kmlJson.link.href).resolve(new URI(enclosingKmlUrl)).toString();
									this._update(geodata, kmlJson, record, false, absoluteUrl, resetTimerAfterAllLinks);								
								}, this));
							}, this));
							total++;
						}
					}
				}
				finishedLooping = true;
			}
		},

		forceUpdate: function(geodataId, callback) {
			var geodata = GeoDataStore.getById(geodataId);
			if (geodata) {
				var record = this._links[geodataId];
				if (!record) {
					record = new NetworkLinkQueue.Record(geodataId);
					// record isn't persisted. this prevents link from being
					// periodically updated.
				}
				geodata.getEnclosingKmlUrl($.proxy(function(enclosingKmlUrl) {
					geodata.getKmlJson($.proxy(function(kmlJson) {
						var absoluteUrl = new URI(kmlJson.link.href).resolve(new URI(enclosingKmlUrl)).toString();
						this._update(geodata, kmlJson, record, true, absoluteUrl, callback);								
					}, this));
				}, this));
			}
		},

		_update: function(geodata, kmlJsonLink, record, forceUpdate, absoluteUrl, callback) {
			var now = new Date().getTime();
			var doUpdate = forceUpdate || record.successTime < 0 
				|| record.attemptTime < 0;
			if (!doUpdate && (record.successTime >= record.attemptTime
					|| (new Date().getTime() - record.attemptTime) >= this.RETRY_INTERVAL)) {
				if (this.isTimeBasedUpdate(kmlJsonLink.link)) {
					var nextDesiredUpdate = this.getNextDesiredUpdateTime(
							kmlJsonLink.link, record.successTime);
					doUpdate = nextDesiredUpdate <= new Date().getTime();
				}
				else if (this.isViewBasedUpdate(kmlJsonLink.link)) {
					doUpdate = !this._bbox || !record.successBbox 
						|| !record.successBbox.equals(this._bbox) 
						|| record.successAltitude != this._altitude;
				}
			}
			if (doUpdate) {
				if (absoluteUrl) {
					var endpoint = absoluteUrl;
					if (this._bbox) {
						// BBOX=[bboxWest],[bboxSouth],[bboxEast],[bboxNorth]
						var sw = this._bbox.getSouthWest().toUrlValue();
						var ne = this._bbox.getNorthEast().toUrlValue();
						var params = $.param({
							bbox: sw + "," + ne
						});
						if (endpoint.indexOf("?") >= 0) {
							endpoint += "&" + params;
						}
						else {
							endpoint += "?" + params;
						}
					}
					record.attemptTime = now;
					var eventChannel = this.eventChannel;
					var bbox = this._bbox;
					var altitude = this._altitude;
					var linkId = geodata.id;
					eventChannel.publish(new GeoDataUpdateBeginEvent(
							NetworkLinkQueue.EVENT_PUBLISHER_NAME, 
							geodata));
					this.geodataRetriever.fetch(endpoint, {
						success: function(geodata) {
							var networkLink = GeoDataStore.getById(linkId);
							if (networkLink) {
								geodata.getKmlJson($.proxy(function(kmlJson) {
									networkLink.removeAllChildren();
									if ("children" in kmlJson && "length" in kmlJson.children) {
										for (var i = 0; i < kmlJson.children.length; i++) {
											var childKmlJson = kmlJson.children[i];
											networkLink.addChild(childKmlJson);
										}
									}
									
								}, this));
							}
							networkLink = GeoDataStore.persist(networkLink);
							eventChannel.publish(new GeoDataUpdateEndEvent(
									NetworkLinkQueue.EVENT_PUBLISHER_NAME, 
									networkLink));
							// update last update data since update succeeded
							record.successTime = now;
							record.successBbox = bbox;
							record.successAltitude = altitude;
							if (callback)
								callback.call(callback);
						},
						error: function(errorThrown) {
							var networkLink = GeoDataStore.getById(linkId);
							eventChannel.publish(new GeoDataUpdateEndEvent(
									NetworkLinkQueue.EVENT_PUBLISHER_NAME, 
									networkLink, 
									errorThrown));
							if (callback)
								callback.call(callback);
						}
					});
				}
				else if (callback) {
					callback.call(this);
				}
			}
			else if (callback) {
				callback.call(this);
			}
		},
		
		isTimeBasedUpdate: function(networkLink) {
			return networkLink && networkLink.refreshMode 
				&& networkLink.refreshMode === "onInterval"; 
		},

		isViewBasedUpdate: function(networkLink) {
			return networkLink && networkLink.refreshMode 
				&& networkLink.refreshMode === "onChange";
		},

		getNextDesiredUpdateTime: function(networkLink, lastUpdateTime) {
			if (lastUpdateTime < 0) {
				return 1;
			}
			if (this.isTimeBasedUpdate(networkLink) 
					&& networkLink.refreshInterval
					&& networkLink.refreshInterval > 0) {
				if (!lastUpdateTime || lastUpdateTime < 0) {
					return new Date().getTime();
				}
				var msInterval = networkLink.refreshInterval * 1000;
				return lastUpdateTime + msInterval;
			}
			return -1;
		}
	};
	ns.NetworkLinkQueue = NetworkLinkQueue;

	var Record = function() {};
	Record.prototype = {
		attemptTime: -1,
		successTime: -1,
		successBbox: null,
		successAltitude: null
	};
	NetworkLinkQueue.Record = Record;
})(jQuery, window.core.geo);