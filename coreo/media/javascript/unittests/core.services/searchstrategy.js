module("core.services.SearchStrategy");

test("constructor", function() {
	var strategy = new core.services.SearchStrategy("searchservice", "searchResultFilter");
	ok(strategy);
	strictEqual(strategy.searchService, "searchservice");
	strictEqual(strategy.searchResultFilter, "searchResultFilter");
});

test("search - url", function() {
	var searchResultFilter = {
		beginInvokes: [],
		begin: function(callback) {
			this.beginInvokes.push(callback);
		},
		resultInvokes: [],
		result: function(data) {
			this.resultInvokes.push(data);
		},
		endInvokes: 0,
		end: function() {
			this.endInvokes++;
			start();
		},
		errorInvokes: [],
		error: function(errorThrown) {
			this.errorInvokes.push(errorThrown);
		}
	};
	var strategy = new core.services.SearchStrategy("searchservice", searchResultFilter);
	strictEqual(typeof strategy.search, "function", "contains 'search' function");
	var resultInvokes = [];
	stop();
	strategy.search("http://localhost:8080/site_media/javascript/unittests/test.kml", {
		result: function(geodata) {
			resultInvokes.push(geodata);
			ok(geodata);
			core.testutils.assertImplements(geodata, core.geo.GeoData.prototype);
			ok(geodata.node, "GeoData references a node in a KML document");
			strictEqual(geodata.node.tagName, "Document");
		},
		error: function(errorThrown) {
			ok(false, "Error: " + errorThrown);
		},
		complete: function() {
			strictEqual(resultInvokes.length, 1, "result callback was invoked");
			strictEqual(searchResultFilter.beginInvokes.length, 0, "searchResultFilter wasn't invoked");
			strictEqual(searchResultFilter.resultInvokes.length, 0, "searchResultFilter wasn't invoked");
			strictEqual(searchResultFilter.endInvokes, 0, "searchResultFilter wasn't invoked");
			strictEqual(searchResultFilter.errorInvokes.length, 0, "searchResultFilter wasn't invoked");
			start();
		}
	});
});

test("search - keyword", function() {
	var mockResult = {
		fields: {
			url: "http://localhost:8080/site_media/javascript/unittests/test.kml"
		}
	};
	var searchResultFilter = {
		beginInvokes: [],
		begin: function(callback) {
			strictEqual(this.beginInvokes.length, 0, "begin is only invoked once");
			strictEqual(this.resultInvokes.length, 0, "result was not invoked before begin");
			strictEqual(this.endInvokes, 0, "end was not invoked before begin");
			this.beginInvokes.push(callback);
		},
		resultInvokes: [],
		result: function(data) {
			strictEqual(this.beginInvokes.length, 1, 
					"searchResultFilter.begin was invoked before result");
			this.resultInvokes.push(data);
			strictEqual(data, mockResult, "mockResult was passed to search filter");
			core.util.CallbackUtils.invokeCallback(
					this.beginInvokes[0], 
					data, "result");
			core.util.CallbackUtils.invokeCallback(
					this.beginInvokes[0], 
					data, "result");
		},
		endInvokes: 0,
		end: function() {
			strictEqual(this.beginInvokes.length, 1, 
				"searchResultFilter.begin was invoked before end");
			strictEqual(this.beginInvokes.length, 1, 
				"searchResultFilter.result was invoked before end");
			strictEqual(this.endInvokes, 0, "end is only invoked once");
			this.endInvokes++;
		},
		errorInvokes: [],
		error: function(errorThrown) {
			this.errorInvokes.push(errorThrown);
		}
	};
	var mockSearchService = {
		searchInvokes: [],
		search: function(term, searchLinks, searchLibraries, callback) {
			strictEqual(term, "foo", "correct search term is used");
			strictEqual(searchLinks, true);
			strictEqual(searchLibraries, true);
			ok(callback);
			strictEqual(typeof callback, "object");
			this.searchInvokes.push({
				"term": term,
				"searchLinks": searchLinks,
				"searchLibraries": searchLibraries,
				"callback": callback
			});
			core.util.CallbackUtils.invokeCallback(callback, mockResult, "result");
			core.util.CallbackUtils.invokeCallback(callback, mockResult, "complete");
		}
	};
	var strategy = new core.services.SearchStrategy(mockSearchService, searchResultFilter);
	var resultInvokes = [];
	stop();
	strategy.search("foo", {
		result: function(geodata) {
			resultInvokes.push(geodata);
			ok(geodata);
			core.testutils.assertImplements(geodata, core.geo.GeoData.prototype);
			ok(geodata.node, "GeoData references a node in a KML document");
			strictEqual(geodata.node.tagName, "Document");
			if (resultInvokes.length > 1) {
				this.complete();
			}
		},
		error: function(errorThrown) {
			ok(false, "Error: " + errorThrown);
		},
		complete: function() {
			strictEqual(resultInvokes.length, 2, "result callback was invoked twice (mock filter impl invokes twice)");
			strictEqual(searchResultFilter.beginInvokes.length, 1, "searchResultFilter.begin was invoked");
			strictEqual(searchResultFilter.resultInvokes.length, 1, "searchResultFilter.result was invoked");
			strictEqual(searchResultFilter.endInvokes, 1, "searchResultFilter.end was invoked");
			strictEqual(searchResultFilter.errorInvokes.length, 0, "searchResultFilter.error wasn't invoked");
			start();
		}
	});
});