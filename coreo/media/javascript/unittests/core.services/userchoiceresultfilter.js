module("core.services.UserChoiceResultFilter");

test("constructor", function() {
	var filter = new core.services.UserChoiceResultFilter("gridEl");
	ok(filter);
	strictEqual(filer.gridEl, "gridEl");
	core.testutils.assertImplements(filter, core.services.SearchResultFilter.prototype);
});