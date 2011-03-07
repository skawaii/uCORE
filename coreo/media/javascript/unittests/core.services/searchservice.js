module("core.services.SearchService");

test("constructor", function() {
	var service = new core.services.SearchService("1", "2");
	ok(service);
	strictEqual(service.linksEndpoint, "1");
	strictEqual(service.libEndpoint, "2");
});

test("search", function() {
	var service = new core.services.SearchService("/search-links/", "/search-libraries/");
	var results = [];
	service.search("Hot", {
		success: function(linkOrLibrary) {
			ok(linkOrLibrary, "success() was invoked with an object");
			ok(linkOrLibrary.pk, "result object has a 'pk' field");
			strictEqual(typeof linkOrLibrary.pk, "number", "result object's 'pk' field is a number");
			ok(linkOrLibrary.model, "result object has a 'model' field");
			strictEqual(typeof linkOrLibrary.model, "string", "result object's 'model' field is a string");
			ok(linkOrLibrary.fields, "result object has a 'fields' field");
			strictEqual(typeof linkOrLibrary.fields, "object", "result object's 'fields' field is an object");
			ok(linkOrLibrary.fields.url, "result object 'fields' contains 'url'");
			strictEqual(typeof linkOrLibrary.fields.url, "string", "url is a string");
			ok(linkOrLibrary.fields.tags, "result object 'fields' contains 'tags'");
			strictEqual(typeof linkOrLibrary.fields.tags, "object", "tags is an object");
			ok(jQuery.isArray(linkOrLibrary.fields.tags), "tags is an array");
			ok(linkOrLibrary.fields.poc, "result object 'fields' contains 'poc'");
			strictEqual(typeof linkOrLibrary.fields.poc, "number", "poc is a number");
			ok(linkOrLibrary.fields.name, "result object 'fields' contains 'name'");
			strictEqual(typeof linkOrLibrary.fields.name, "string", "name is a string");
			ok(linkOrLibrary.fields.desc, "result object 'fields' contains 'desc'");
			strictEqual(typeof linkOrLibrary.fields.desc, "string", "desc is a string");
			results.push(linkOrLibrary);
		},
		error: function(errorThrown) {
			ok(false, "Error: " + errorThrown);
		},
		complete: function() {
			strictEqual(results.length, 84, "Received correct number of results");
			start();
		}
	});
	stop();
});