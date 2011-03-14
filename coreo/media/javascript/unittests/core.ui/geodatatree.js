module("core.ui.GeoDataTree");

test("constructor", function() {
	var treeEl = $("<div>").attr("id", "tree").appendTo($(document.body));
	
	var geodata = {
		getName: function() { return "foo"; },
		getKmlFeatureType: function() { return "Placemark"; },
		hasChildren: function() { return false; }
	};
	var tree = new core.ui.GeoDataTree(geodata, "#tree");
	ok(tree);
	strictEqual(tree.geodata, geodata);
	strictEqual("#tree", tree.el);
	
	strictEqual(treeEl.text().trim(), "foo");
	strictEqual(treeEl.children().length, 1);
	strictEqual(treeEl.children()[0].tagName.toLowerCase(), "ul");
});