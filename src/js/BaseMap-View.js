var BaseMapView = Backbone.View.extend({

	id: "map",
	initialize: function() {
		
		window.map = new L.Map('map', {
    zoomControl: false,
    center: [51.505, -0.09],
    attributionControl: false,
    zoom: 7
})
		// map.setMaxBounds(UTIL.boundsFromBBOX("-180,-90,180,90"))
		// this.listenTo(appState, 'change:bbox', this.zoom)
		this.listenTo(appState, 'change', this.render)
		// this.listenTo(this.collection, 'change:active', this.render)
		return this
		// .render()
	},
	zoom: function() {

		if ((appState.get("bbox") !== null) && typeof appState.get("bbox") !== 'undefined' && map.getBounds().toBBoxString() !== appState.get("bbox")) {
			map.fitBounds(UTIL.boundsFromBBOX(appState.get("bbox")))
		}

		return this

	},
	render: function() {

		var am = this.collection.findWhere({
			active: true
		});
		var def = (typeof am !== 'undefined')?am.get("definition"):null;

		// remove global layer here first so we don't keep stacking baselayers
		// (we only need one baselayer at a time, of course)
		if (typeof baseLayer == 'undefined') {
			baseLayer = null;
		} else {
			map.removeLayer(baseLayer);
		}
		// a little special handling for stamen maps
		if (typeof am !== 'undefined' && am.get("source") == "stamen") {

			baseLayer = new L.StamenTileLayer(def.id);

			appConsole.set({
				message: "Basemap switched to " + am.get("nom") + ", which might have zoom restrictions"
			})

		} else if (def.subdomains != undefined) {

			baseLayer = new L.TileLayer(def.url, {
				subdomains: def.subdomains,
				maxZoom: 18
			});

		} else {

			baseLayer = new L.TileLayer(def.url, {
				maxZoom: 18
			});
		}

		map.addLayer(baseLayer);
		baseLayer.bringToBack();


		return this
		.zoom()

	}



});