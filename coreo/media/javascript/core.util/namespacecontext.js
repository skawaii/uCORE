/**
 * Class: NamespaceContext
 * 
 * Map of XML namespace prefixes and URIs.
 * 
 * Namespace:
 *  core.util
 * 
 * Dependencies:
 *  - jQuery
 *  - core.util.Assert
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	var Assert = core.util.Assert;

	var NamespaceContext = function(prefixToUriMap) {
		if (prefixToUriMap) {
			this.prefixToUriMap = prefixToUriMap;
		}
	};
	NamespaceContext.prototype = {

		prefixToUriMap: {},

		set: function(prefix, uri) {
			Assert.type(prefix, "string", "prefix must be a string");
			Assert.type(uri, "string", "uri must be a string");
			this.prefixToUriMap[prefix] = uri;
		},

		getUri: function(prefix) {
			if (prefix == null || prefix == undefined)
				prefix = "";
			Assert.type(prefix, "string", "prefix must be a string");
			return this.prefixToUriMap[prefix];
		},

		getPrefix: function(uri) {
			for (var prefix in this.prefixToUriMap) {
				if (this.prefixToUriMap[prefix] === uri) {
					return prefix;
				}
			}
			return undefined;
		},

		containsUri: function(uri) {
			return (this.getPrefix(uri) != undefined);
		},
		
		containsPrefix: function(prefix) {
			return (this.getUri(prefix) != undefined);
		},
		
		setDefault: function(uri) {
			if (uri == null || uri == undefined)
				uri = "";
			this.set("", uri);
		},
		
		getDefault: function() {
			return this.getUri("");
		}
		
	};
	ns.NamespaceContext = NamespaceContext;
})(jQuery, window.core.util);