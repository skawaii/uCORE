/**
 * Class: GeoDataStore
 * 
 * A repository for <GeoData> objects.
 * 
 * Namespace:
 *  core.geo
 * 
 * Dependencies:
 *  - core.util.IdSequence
 */
if (!window.core)
	window.core = {};
if (!window.core.geo)
	window.core.geo = {};

(function(ns) {
	
	var idSequence = new core.util.IdSequence("core-");

	var store = {};
	
	var GeoDataStore = {
		
		/**
		 * Function: generateId
		 * 
		 * Generates a new unique ID.
		 * 
		 * Returns:
		 *   String. Unique ID.
		 */
		generateId: function() {
			var id = null;
			do {
				id = idSequence.nextId();
			}
			while (GeoDataStore.idExists(id));
			return id;
		},
		
		/**
		 * Function: persist
		 * 
		 * Saves a <GeoData> instance into the repository.
		 * If the object to persist has a "postSave" function, it will 
		 * be invoked after setting the ID and persisting the object in 
		 * the repository.
		 * 
		 * Parameters:
		 *   feature - <GeoData>. Object to save in the repository.
		 *   
		 * Returns:
		 *   <GeoData>. Persisted object.
		 */
		persist: function(feature) {
			if (!feature) {
				return feature;
			}
			var id = feature.id;
			if (!id) {
				id = GeoDataStore.generateId();
				feature.id = id;
			}
			store[id] = feature;
			if ("postSave" in feature 
					&& typeof feature.postSave === "function") {
				feature.postSave();
			}
			return feature;
		},
		
		/**
		 * Function: idExists
		 * 
		 * Tests if an object with an ID exists in the repository.
		 * 
		 * Parameter:
		 *   id - String. <GeoData> ID.
		 * 
		 * Returns:
		 *   Boolean. True if an object exists with the provided ID.
		 */
		idExists: function(id) {
			return !!(id && id in store);
		},
		
		/**
		 * Function: getById
		 * 
		 * Retrieve a <GeoData> instance by its ID.
		 * 
		 * Parameters:
		 *   id - String. The object's ID.
		 *   
		 * Returns:
		 *   <GeoData>. The object, or null if it doesn't exist.
		 */
		getById: function(id) {
			return id && id in store && store[id];
		},
		
		/**
		 * Function: deleteById
		 * 
		 * Removes an object from the repository.
		 * 
		 * Parameters:
		 *   id - String. ID to remove.
		 */
		deleteById: function(id) {
			store[id] = null;
			delete store[id];
		}
	};
	ns.GeoDataStore = GeoDataStore;
})(window.core.geo);