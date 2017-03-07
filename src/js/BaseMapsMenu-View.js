var BaseMapsMenuView = Backbone.View.extend({
	tagName: "ul",
	el: "#menu-basemaps-wrapper",
	events: {
		"click .mnu-basemap-item": "switch",
	},
	template: Handlebars.templates['BaseMapsMenuViewTpl'],
	initialize: function() {

		// this.collection.bind('change:active', this.render, this);
		this.listenTo(appState,'change:layers', this.render, this);
		this.render()
	},
	switch: function(e) {

		var n = $(e.currentTarget).attr("data-id")

		var aslz = appState.get("layers")

		var newaslz = _.reject(aslz, function(l) { //get rid of the one(s) that are baselayers cuz we gonna add a fresh one
			return _.contains(mapBaseLayers.pluck("name"), l)
		});

		newaslz.push(n)
		appState.set({
			layers: newaslz
		});

		return this

	},
	render: function() {
		$(this.el).html(this.template({

			rows: this.collection.toJSON()

		}));
	}
});