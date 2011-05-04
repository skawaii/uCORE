/**
 * Class: UserService
 * 
 * Client to the CORE user web services.
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   - jQuery
 */

if (!window.core)
	window.core = {};
if (!window.core.services)
	window.core.services = {};

(function($, ns) {
	/**
	 * Constructor: UserService
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   cfg - Object. Contains the following properties:
	 *         currentUserEndpoint - String. URL to retrieve the current user 
	 *               JSON object.
	 *         currentUser - Object. Initializes the current user (value 
	 *               returned from getCurrentUser).
	 */
	var UserService = function(cfg) {
		var cachedCurrentUser;
		cachedCurrentUser = false;
		if ("currentUser" in cfg) {
			cachedCurrentUser = cfg.currentUser;
		}
		return {
			/**
			 * Function: initCurrentUser
			 * 
			 * Initializes the current user so that no AJAX calls need to be 
			 * made to retrieve the current user information.
			 * 
			 * Parameters:
			 *   currentUser - Object. JSON object to return from getCurrentUser.
			 */
			initCurrentUser: function(currentUser) {
				cachedCurrentUser = currentUser;
			},
			
			/**
			 * Function: getCurrentUser
			 * 
			 * Retrieves the user profile of the currently logged in user.
			 * 
			 * Returns:
			 *   jQuery Deferred. Resolve callback is invoked with a single 
			 *   parameter that is the CoreUser JSON object.
			 */
			getCurrentUser: function() {
				var deferred = $.Deferred();
				if (cachedCurrentUser === false) {
					$.ajax(cfg.currentUserEndpoint, {
						type: "GET",
						dataType: "json",
						success: function(currentUser, textStatus, jqXHR) {
							cachedCurrentUser = currentUser;
							deferred.resolve(cachedCurrentUser);
						},
						error: function(jqXHR, textStatus, errorThrown) {
							deferred.reject(jqXHR.responseText);
						}
					});
				}
				else {
					deferred.resolve(cachedCurrentUser);
				}
				return deferred.promise();
			}
		};
	};
	ns.UserService = UserService;
})(jQuery, window.core.services);