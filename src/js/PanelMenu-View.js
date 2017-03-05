var PanelMenuView = Backbone.View.extend({

	el: $("#navContainer .tabbable .nav-tabs"),
	template: Handlebars.templates['PanelMenuViewTpl'],
	events: {
		"click li": function(e) {
			var pid = $(e.currentTarget).attr("data-id")
			appState.set({
				slug: pid
			})
		}
	},
	initialize: function() {
		this.listenTo(appState, 'change', this.render);
		return this.render()
	},
	render: function() {

		$(this.el).html(this.template(this.collection.toJSON()))
		return this
		.subrender()
	},
	subrender: function() {


		var target = appState.get("slug")

		$("#paneContainer").find(".tab-pane").removeClass("active")
		$("#paneContainer").find("#" + target).addClass("active");

		return this

	}

});