module("core.util.IdSequence");

test("nextId", function() {
	var idSequence = new core.util.IdSequence("foo-");
	ok("nextId" in idSequence, "IdSequence contains a nextId member");
	strictEqual(typeof idSequence.nextId, "function", "nextId is a function");
	same("foo-0", idSequence.nextId());
	same("foo-1", idSequence.nextId());
	same("foo-2", idSequence.nextId());
});