/**
 * Class: QualifiedName
 * 
 * A fully-qualified XML node name, containing namespace prefix, namespace 
 * URI, and local name.
 * 
 * Namespace:
 *   core.util
 * 
 * Parameters:
 *   nsPrefix - String. Namespace prefix.
 *   nsUri - String. Namespace URI.
 *   localName - String. Local name.
 * 
 * Dependencies:
 *   none
 */

if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function(ns) {
	/**
	 * Constructor: QualifiedName
	 * 
	 * Initializes the object.
	 * 
	 * Parameters:
	 *   nsPrefix - String. Namespace prefix.
	 *   nsUri - String. Namespace URI.
	 *   localName - String. Local name.
	 */
	var QualifiedName = function(nsPrefix, nsUri, localName) {
		this.nsPrefix = nsPrefix;
		this.nsUri = nsUri;
		this.localName = localName;
	};
	ns.QualifiedName = QualifiedName;
	
})(window.core.util);