var AOIView = Backbone.View.extend({
	// el: $("#inputContainer"),
	// template: Handlebars.templates['QueryFormViewTpl'],
	events: {
		// "keyup": "delay",
		// "click #bt-query": "execute_by_click"
	},
	initialize: function() {
		groupAOI = L.featureGroup().addTo(map).bringToFront();
		// this.render()
		// this.model.bind("change:query", this.render, this)
		// this.listenTo(appState, 'change:query', this.prequery);
		this.listenTo(this.model, 'change:aoi', this.render);
		return this
	},
	render: function() {
		// $(this.el).html(this.template(this.model.toJSON()))
		if(this.model.get("aoi")!==null && (this.model.get("type")=='point' || this.model.get("type")=='bbox') ){

			groupAOI.clearLayers();
			L.geoJSON(this.model.get("aoi"), {
				style: UTIL.get_style("aoi")
			}).addTo(groupAOI);}
			map.fitBounds(groupAOI.getBounds())
			return this
		}
	})