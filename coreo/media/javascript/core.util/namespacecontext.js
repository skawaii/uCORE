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

	/**
	 * Constructor: NamespaceContext
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   prefixToUriMap - Object. Optional. Initial namespace mappings. 
	 *         Map where property name is a namespace prefix and property 
	 *         value is a namespace URI.
	 */
	var NamespaceContext = function(prefixToUriMap) {
		if (prefixToUriMap) {
			this.prefixToUriMap = prefixToUriMap;
		}
	};
	NamespaceContext.prototype = {

		/**
		 * Property: prefixToUriMap
		 * 
		 * Object. Namespace mappings. Property name is a namespace prefix. 
		 * Property value is a namespace URI.
		 */
		prefixToUriMap: {},

		/**
		 * Function: set
		 * 
		 * Add or replace a namespace mapping.
		 * 
		 * Parameters:
		 *   prefix - String. Namespace prefix.
		 *   uri - String. Namespace URI.
		 */
		set: function(prefix, uri) {
			Assert.type(prefix, "string", "prefix must be a string");
			Assert.type(uri, "string", "uri must be a string");
			this.prefixToUriMap[prefix] = uri;
		},

		/**
		 * Function: getUri
		 * 
		 * Retrieve the namespace URI for a namespace prefix.
		 * 
		 * Parameters:
		 *   prefix - String. Namespace prefix.
		 *   
		 * Returns:
		 *   String. Namespace URI, or undefined if the prefix isn't defined.
		 */
		getUri: function(prefix) {
			if (prefix == null || prefix == undefined)
				prefix = "";
			Assert.type(prefix, "string", "prefix must be a string");
			return this.prefixToUriMap[prefix];
		},

		/**
		 * Function: getPrefix
		 * 
		 * Retrieve the namespace prefix for a namespace URI.
		 * 
		 * Parameters:
		 *   uri - String. Namespace URI.
		 *   
		 * Returns:
		 *   String. Namespace prefix, or undefined if the URI isn't defined.
		 */
		getPrefix: function(uri) {
			for (var prefix in this.prefixToUriMap) {
				if (this.prefixToUriMap[prefix] === uri) {
					return prefix;
				}
			}
			return undefined;
		},

		/**
		 * Function: containsUri
		 * 
		 * Determine if a namespace URI has been declared.
		 * 
		 * Parameters:
		 *   uri - String. Namespace URI.
		 *   
		 * Returns:
		 *   Boolean. True if namespace URI has been declared.
		 */
		containsUri: function(uri) {
			return (this.getPrefix(uri) != undefined);
		},
		
		/**
		 * Function: containsPrefix
		 * 
		 * Determines if a namespace prefix has been declared.
		 * 
		 * Parameters:
		 *   prefix - String. Namespace prefix.
		 *   
		 * Returns:
		 *   Boolean. True if the namespace prefix has been declared.
		 */
		containsPrefix: function(prefix) {
			return (this.getUri(prefix) != undefined);
		},
		
		/**
		 * Function: setDefault
		 * 
		 * Sets the default namespace - the namespace used on XML nodes 
		 * when no namespace prefix is used.
		 * 
		 * Parameters:
		 *   uri - String. Namespace URI.
		 */
		setDefault: function(uri) {
			if (uri == null || uri == undefined)
				uri = "";
			this.set("", uri);
		},
		
		/**
		 * Function: getDefault
		 * 
		 * Retrieves the default namespace - the namespace used on XML 
		 * nodes when no namespace prefix is used.
		 * 
		 * Returns:
		 *   String. Namespace URI.
		 */
		getDefault: function() {
			return this.getUri("");
		}
		
	};
	ns.NamespaceContext = NamespaceContext;
})(jQuery, window.core.util);