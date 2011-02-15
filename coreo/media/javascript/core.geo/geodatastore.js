/**
 * Class: GeoDataStore
 * 
 * A repository for <GeoDataFeature> objects.
 * 
 * Namespace:
 *  core.geo
 * 
 * Dependencies:
 *  - core.util.XmlUtils
 *  - core.util.IdSequence
 *  - jQuery
 */
if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function($, ns) {
	
	var XMLUTILS = core.util.XmlUtils;
	var IDSEQ = core.util.IdSequence;
	
	var idSequence = new IDSEQ("core-");
	var store = {};
	
	var GeoDataStore = {
		
		generateId: function() {
			var id = null;
			do {
				id = idSequence.nextId();
			}
			while (GeoDataStore.idExists(id));
			return id;
		},
		
		persist: function(feature) {
			if (!feature) {
				return feature;
			}
			var id = feature.id;
			if (!id) {
				id = GeoDataStore.generateId();
				feature.id = id;
				if (!feature.owner) {
					// this is a root-level feature
					store[id] = feature;
				}
				else {
					// persist this in the store directly if the owner isn't 
					// in the store
					var ownerId = feature.owner.id;
					if (!(ownerId in store)) {
						store[id] = feature;
					}
				}
				if ("postSave" in feature 
						&& typeof feature.postSave === "function") {
					feature.postSave();
				}
			}
			return feature;
		},
		
		idExists: function(id) {
			if (id) {
				for (var existingId in store) {
					if (existingId === id 
						|| ("getFeatureById" in store[existingId]
							&& typeof store[existingId] === "function"
							&& store[existingId].getFeatureById(id))) {
						return true;
					}
				};
			}
			return false;
		},
		
		getById: function(id) {
			if (id) {
				for (var existingId in store) {
					if (existingId === id) {
						return store[existingId];
					}
					if ("getFeatureById" in store[existingId]
						&& (typeof store[existingId].getFeatureById === "function")) {
						var feature = store[existingId].getFeatureById(id);
						if (feature) {
							return feature;
						}
					}
				}
			}
			return null;
		},
		
		deleteById: function(id) {
			store[id] = null;
			delete store[id];
		}
	};
	ns.GeoDataStore = GeoDataStore;
})(jQuery, window.core.geo);