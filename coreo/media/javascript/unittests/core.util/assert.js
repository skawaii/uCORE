module("core.util.Assert");

test("hasFunction", function() {
	core.util.Assert.hasFunction({ a: function() {} }, "a");
	
	try {
		core.util.Assert.hasFunction({ a: "" }, "a");
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual("" + e, "Object does not contain function 'a'");
	}
	
	try {
		core.util.Assert.hasFunction({ a: "" }, "b");
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual("" + e, "Object does not contain function 'b'");
	}
	
	try {
		core.util.Assert.hasFunction({ a: "" }, "b", "my error");
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual("" + e, "my error");
	}
});

test("hasMember", function() {
	core.util.Assert.hasMember({ a: "" }, "a");
	core.util.Assert.hasMember({ a: null }, "a");
	core.util.Assert.hasMember({ a: undefined }, "a");
	core.util.Assert.hasMember({ a: function() {} }, "a");
	
	try {
		core.util.Assert.hasMember({ a: "" }, "b");
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual("" + e, "Object does not contain member 'b'");
	}

	try {
		core.util.Assert.hasMember({ a: "" }, "b", null);
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual("" + e, "Object does not contain member 'b'");
	}
	
	try {
		core.util.Assert.hasMember({ a: "" }, "b", undefined);
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual("" + e, "Object does not contain member 'b'");
	}
	
	try {
		core.util.Assert.hasMember({ a: "" }, "b", "MyError");
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual(e, "MyError");
	}
	
	try {
		core.util.Assert.hasMember({ a: "" }, "b", new TypeError("foo"));
		ok(false, "expected exception");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
		strictEqual(e.message, "foo");
	}
});

test("type", function() {
	core.util.Assert.type("", "string");
	core.util.Assert.type({}, "object");
	core.util.Assert.type([], "object");
	core.util.Assert.type(1, "number");
	core.util.Assert.type(undefined, "undefined");
	core.util.Assert.type(null, "object");
	
	try {
		core.util.Assert.type(1, "string");
	}
	catch (e) {
		strictEqual(e.name, "TypeError");
	}
});