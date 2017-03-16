var AOIStatus = Backbone.View.extend({
	el: $("#aoi-status"),
	template: Handlebars.templates['AOIStatusTpl'],
	events: {
		// "keyup": "delay",
		// "click #bt-query": "execute_by_click"
	},
	initialize: function() {
		// this.model.bind("change:query", this.render, this)
		// this.listenTo(appState, 'change:query', this.prequery);
		this.listenTo(this.model, 'change', this.render);
		this.render()
		return this
	},
	render: function() {
		$(this.el).html(this.template(this.model.toJSON()))
		// console.log("AOIv.17:"); console.log(this.model);
		return this
	}
})