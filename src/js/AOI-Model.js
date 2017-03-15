var AOI = Backbone.Model.extend({
	defaults: {
		active: false
	},
	initialize: function() {
		this.listenTo(appState, 'change:aoi', this.detect);
	}
	,detect: function(){

		var aoi = appState.get("aoi")

		console.log("aoi:"); console.log(aoi);

		this.set({type:"nom",aoi:"geom obj goes here"})

		return this
	}
});