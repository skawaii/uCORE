module("core.services.KmlJsonProxyService");

test("getKmlJson", function() {
	var service = new core.services.KmlJsonProxyService("/kmlproxy");
	stop();
	service.getKmlJson("http://carma.org/earth/2007_raw_abs_energy.kml", {
		success: function(data) {
			strictEqual(typeof data, "object");
			start();
		},
		error: function(errorThrown) {
			ok(false, "error: " + errorThrown);
			start();
		}
	});
});