module("core.services.SearchService");

test("constructor", function() {
	var service = new core.services.SearchService("1", "2");
	ok(service);
	strictEqual(service.linksEndpoint, "1");
	strictEqual(service.libEndpoint, "2");
});

test("search", function() {
	var service = new core.services.SearchService("/search-links/", "/search-libraries/");
	service.search("Hot", function(linkOrLibrary) {
		core.util.ObjectUtils.describe(linkOrLibrary.fields);
		start();
	});
	stop();
});