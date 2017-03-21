var TriageCollection = Backbone.Collection.extend({
	model: Triage,
	url: function() {
		return null
	},
	initialize: function(models, options) {
		options || (options = {});
	}
	,parse: function(data) {
		var gj = data[0]

		return gj

	}
	,url: function() {
		// return "http://nominatim.openstreetmap.org/search.php?limit=1&format=jsonv2&polygon_geojson=1" + "&q=" + encodeURIComponent(appState.get("query"))
		return "http://nominatim.openstreetmap.org/search.php?limit=1&format=jsonv2" + "&q=" + encodeURIComponent(appState.get("query"))
	}


});