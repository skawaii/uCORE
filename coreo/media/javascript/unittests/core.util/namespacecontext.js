module("core.util.NamespaceContext");

test("constructor", function() {
	var ctx = new core.util.NamespaceContext();
	strictEqual(ctx.getDefault(), undefined);
	var nsMap = {}
	ctx = new core.util.NamespaceContext(nsMap);
	strictEqual(ctx.prefixToUriMap, nsMap);
	ctx = new core.util.NamespaceContext({"a": "b"});
	ok("a" in ctx.prefixToUriMap);
	strictEqual(ctx.prefixToUriMap["a"], "b");
});

test("set", function() {
	var ctx = new core.util.NamespaceContext();
	ctx.set("a", "b");
	strictEqual(ctx.prefixToUriMap["a"], "b");
	ctx.set("a", "c");
	strictEqual(ctx.prefixToUriMap["a"], "c");
});

test("getUri", function() {
	var ctx = new core.util.NamespaceContext({"a": "b", "": "foo"});
	strictEqual(ctx.getUri("a"), "b");
	strictEqual(ctx.getUri(""), "foo", "getUri('') returns the default namespace");
	strictEqual(ctx.getUri("b"), undefined);
	strictEqual(ctx.getUri(undefined), "foo");
	strictEqual(ctx.getUri(null), "foo");
	raises(function(){ctx.getUri(1);});
	raises(function(){ctx.getUri([]);});
	raises(function(){ctx.getUri({});});
});

test("getPrefix", function() {
	var ctx = new core.util.NamespaceContext({"a": "b"});
	strictEqual(ctx.getPrefix("b"), "a");
	strictEqual(ctx.getPrefix("a"), undefined);
});

test("containsUri", function() {
	var ctx = new core.util.NamespaceContext({"a": "b"});
	strictEqual(ctx.containsUri("b"), true);
	strictEqual(ctx.containsUri("a"), false);
});

test("containsPrefix", function() {
	var ctx = new core.util.NamespaceContext({"a": "b"});
	strictEqual(ctx.containsPrefix("a"), true);
	strictEqual(ctx.containsPrefix("b"), false);
});

test("setDefault", function() {
	var ctx = new core.util.NamespaceContext({"a": "b"});
	ctx.setDefault("foo");
	strictEqual(ctx.prefixToUriMap[""], "foo");
	ctx.setDefault(null);
	strictEqual(ctx.prefixToUriMap[""], "");
	ctx.setDefault(undefined);
	strictEqual(ctx.prefixToUriMap[""], "");
});

test("getDefault", function() {
	var ctx = new core.util.NamespaceContext({"a": "b"});
	strictEqual(ctx.getDefault(), undefined);
	ctx.prefixToUriMap[""] = "foo";
	strictEqual(ctx.getDefault(), "foo");
});