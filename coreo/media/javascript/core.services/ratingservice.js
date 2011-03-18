/**
 * Class: RatingService
 * 
 * Client for rating CORE Links and LinkLibraries.
 * 
 * Namespace:
 *   core.services
 * 
 * Dependencies:
 *   - jQuery
 *   - core.util.Assert
 *   - core.util.CallbackUtils
 */

if (!window.core)
    window.core = {};
if (!window.core.services)
    window.core.services = {};

if (!window.core) window.core = {};
if (!window.core.services) window.core.services = {}

(function($, ns) {
    var Assert = core.util.Assert;
    var CallbackUtils = core.util.CallbackUtils;

    var RatingService = function(linkEndpoint, libEndpoint) {
        this.linkEndpoint = linkEndpoint;
        this.libEndpoint = libEndpoint;
    };

    RatingService.prototype = {
        linkEndpoint = null;
        libEndpoint = null;

        getRating: function(id, isLink, isLibrary, callback) {
            Assert.isTrue(arguments.length >= 3, "Invalid number of arguments. At least 3 arguments are required."
            Assert.isTrue((isLink === true && !isLibrary) || (!isLink && isLibrary === true), "isLink and isLibrary cannot both be true.");
        };

        rate: function(id, score, comment, isLink, isLibrary, callback) {

        };

        rateLink: function(id, score, comment, callback) {
            
        };

        rateLibrary: function(id, score, comment, callback) {
            
        };
    };

    ns.RatingService = RatingService;
})(jquery, window.core.services)

