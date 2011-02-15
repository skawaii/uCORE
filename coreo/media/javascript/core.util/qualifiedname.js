if (!window.core)
	window.core = {};
if (!window.core.util)
	window.core.util = {};

(function($, ns) {
	
	var QualifiedName = function(nsPrefix, nsUri, localName) {
		this.nsPrefix = nsPrefix;
		this.nsUri = nsUri;
		this.localName = localName;
	};
	ns.QualifiedName = QualifiedName;
	
})(jQuery, window.core.util);