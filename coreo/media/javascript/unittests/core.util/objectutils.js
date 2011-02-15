module("core.util.ObjectUtils");

test("describe", function() {
	ok("describe" in core.util.ObjectUtils, "describe member exists");
	strictEqual(typeof core.util.ObjectUtils.describe, "function", "describe is a function");
	var desc = core.util.ObjectUtils.describe({foo: 1});
	ok(desc);
	strictEqual(jQuery.trim(desc), "number foo = 1");
});