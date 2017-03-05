var PanelsCollection = Backbone.Collection.extend({
	model: Panel,
	url: function() {
		return null
	},
	initialize: function(options) {
		this.listenTo(appState, 'change:slug', this.deactivate);
		options || (options = {});
	},
	activate: function() {


		_.each(this.models, function(m) {
			if (m.get("id") == appState.get("slug")) {
				m.set({
					active: true
				});
			}

		})

		return this

	},
	deactivate: function() {
		this.invoke('set', {
			"active": false
		}, {
			silent: true
		});
		return this
		.activate()
	},

});