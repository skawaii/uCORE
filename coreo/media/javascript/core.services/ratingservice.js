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

if (!window.core) window.core = {};
if (!window.core.services) window.core.services = {}

(function($, ns) {
    var Assert = core.util.Assert;
    var CallbackUtils = core.util.CallbackUtils;

    var RatingService = function(linkEndpoint, libEndpoint) {
        Assert.isTrue(arguments.length == 2, "Invalid number of arguments - 2 argument required.");
        Assert.isTrue(linkEndpoint && libEndpoint, "Invalid arguments - linkEndpoint and libEndpoint must both be defined.");

        if (linkEndpoint.charAt(linkEndpoint.length - 1) != "/") linkEndpoint += "/";
        if (libEndpoint.charAt(libEndpoint.length - 1) != "/") libEndpoint += "/";

        this.linkEndpoint = linkEndpoint;
        this.libEndpoint = libEndpoint;
    };

    RatingService.prototype = {
        linkEndpoint = null;
        libEndpoint = null;

        getRating: function(id, isLibrary, callback) {
            // check the parameter types
            Assert.isTrue(arguments.length >= 2, "Invalid number of arguments - at least 2 arguments required.");
            Assert.type(id, "int");
            var endpoint = (typeof isLibrary === "boolean" && isLibrary) ? this.libEndpoint : this.linkEndpoint;
            callback = arguments[arguments.length - 1]

            if (typeof callback !== "object" && typeof callback !== "function") {
                throw "Invalid argument - expected last argument to be a callback, not " + typeof callback + ".";
            }

            // get the rating
            $.getJSON(endpoint + id + "/", function(data) {
                $.each(data, function(key, val) {
                    CallbackUtils.invokeCallback(callback, val);
                });
            });
        };

        rate: function(id, score, comment, isLibrary, callback) {
            // check the parameter types
            Assert.isTrue(arguments.length >= 4, "Invalid number of arguments - at least 4 arguments required.");
            Assert.type(id, "int");
            Assert.type(score, "int");
            Assert.type(comment, "string");
            var endpoint = (typeof isLibrary === "boolean" && isLibrary) ? this.libEndpoint : this.linkEndpoint;
            callback = arguments[arguments.length - 1]

            if (typeof callback !== "object" && typeof callback !== "function") {
                throw "Invalid argument - expected last argument to be a callback, not " + typeof callback + ".";
            }

            // POST the rating to the server
            $.post(endpoint + id + "/", {"score": score, "comment": comment} function(data) {
                $.each(data, function(key, val) {
                    CallbackUtils.invokeCallback(callback, val);
                });
            }, "json");
        };
    };

    ns.RatingService = RatingService;
})(jquery, window.core.services)

