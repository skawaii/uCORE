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
						}
						this.add(showFeatureEvent.geoData.id);
					}
				}, this));
				this.eventChannel.subscribe(HideFeatureEvent.type, $.proxy(function(hideFeatureEvent) {
					if (hideFeatureEvent && hideFeatureEvent.geoData
							&& hideFeatureEvent.geoData.id
							&& hideFeatureEvent.geoData.getKmlFeatureType() === KmlFeatureType.NETWORK_LINK) {
						_hidden.push(hideFeatureEvent.geoData.id);
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
			console.log("Will poll next in " + nextPollInterval + " ms");
			if (nextPollInterval >= 0) {
				nextPollInterval = Math.min(nextPollInterval, 1);
				this._timer = window.setTimeout(
						$.proxy(this.execute, this), 
						nextPollInterval);				
			}
		},

		computeNextPollInterval: function() {
			var nextUpdate = -1;
			if (this._links) {
				for (var linkId in this._links) {
					// don't consider hidden features
					if ($.inArray(linkId, this._hidden) < 0) {
						var record = this._links[linkId];
						var link = GeoDataStore.getById(linkId);
						if (link && record) {
							if (record.lastUpdateTime < 0) {
								// this link has never been populated, so do it now
								return 0;
							}
							else if (this.isTimeBasedUpdate(link)) {
								var tmp = this.getNextDesiredUpdateTime(
										link, record.lastUpdateTime);
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
				return Math.min(nextUpdate - new Date().getTime(), 0);
			}
			// none of the links use onInterval refresh mode
			return -1;
		},

		execute: function() {
			console.log("execute queue");
			if (this._links) {
				var finishedLooping = false;
				var total = 0;
				var count = 0;
				var resetTimerAfterAllLinks = function() {
					count++;
					if (finishedLooping && count == total) {
						this.resetTimer();
					}
				};
				for (var linkId in this._links) {
					// don't update hidden links (hidden link data is now stale)
					if ($.inArray(linkId, this._hidden) < 0) {
						var link = GeoDataStore.getById(linkId);
						var record = this._links[linkId];
						if (link && record) {
							this._update(link, record, false, $.proxy(resetTimerAfterAllLinks, this));
							total++;
						}
					}
				}
				finishedLooping = true;
			}
		},
		
		_update: function(link, record, forceUpdate, callback) {
			console.log("update " + link.id);
			console.log(core.util.ObjectUtils.describe(link));
			var now = new Date().getTime();
			var doUpdate = forceUpdate || record.lastUpdateTime < 0;
			if (!doUpdate) {
				if (this.isTimeBasedUpdate(link)) {
					var nextDesiredUpdate = this.getNextDesiredUpdateTime(
							link, record.lastUpdateTime);
					doUpdate = nextDesiredUpdate <= new Date().getTime();
				}
				else if (this.isViewBasedUpdate(link)) {
					doUpdate = !this._bbox || !record.lastUpdateBbox 
						|| !record.lastUpdateBbox.equals(this._bbox) 
						|| record.lastUpdateAltitude != this._altitude;
				}
			}
			if (doUpdate) {
				var href = link.href;
				if (href) {
					console.log("updating " + href);
					var endpoint = href;
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
					var eventChannel = this.eventChannel;
					var bbox = this._bbox;
					var altitude = this._altitude;
					var linkId = link.id;
					eventChannel.publish(new GeoDataUpdateBeginEvent(
							NetworkLinkQueue.EVENT_PUBLISHER_NAME, 
							link));
					this.geodataRetriever.fetch(endpoint, {
						success: function(geodata) {
							console.log("successfully updated");
							var networkLink = GeoDataStore.getById(linkId);
							networkLink.linkData = geodata;
							networkLink = GeoDataStore.persist(networkLink);
							console.log("NEW network link: " + core.util.ObjectUtils.describe(geodata));
							eventChannel.publish(new GeoDataUpdateEndEvent(
									NetworkLinkQueue.EVENT_PUBLISHER_NAME, 
									networkLink));
							// update last update data since update succeeded
							record.lastUpdateTime = now;
							record.lastUpdateBbox = bbox;
							record.lastAltitude = altitude;
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
		lastUpdateTime: -1,
		lastUpdateBbox: null,
		lastUpdateAltitude: null
	};
	NetworkLinkQueue.Record = Record;
})(jQuery, window.core.geo);