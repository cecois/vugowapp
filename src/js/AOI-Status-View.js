var AOIStatus = Backbone.View.extend({
	el: $("#aoi-status"),
	template: Handlebars.templates['AOIStatusTpl'],
	events: {
		// "keyup": "delay",
		// "click .toggle": "toggle"
	},
	initialize: function() {
		// this.model.bind("change:query", this.render, this)
		// this.listenTo(appState, 'change:query', this.prequery);
		this.listenTo(this.model, 'change', this.prerender);
		this.prerender()
		return this
	}
	,prerender(){

		var t = this.model.get("type")
		var typ = null;
		switch (t) {
			case "point":
			this.model.set({type_display:"coordinate pair (buffered by "+Config.POINTBUFFER+" meters)"});
			break;

			case "bbox":
			this.model.set({type_display:"bounding box parsed as W,S,E,N"});
			break;
			default:
			this.model.set({type_display:"visible map extent"});
		}

		return this
		.render()

	}
	// toggle: function(){

	// 	if(map.hasLayer(groupAOI)==true){
	// 		groupAOI.removeFrom(map)
	// 	} else {
	// 		groupAOI.addTo(map)
	// 	}

	// 	return this

	// },
// 	rewire: function(){

// 		if(groupAOI.getLayers().length>=1)
// 		{
// 			if(this.model.get("type")=="visible map extent"){
// 				$('#aoi-toggle').bootstrapToggle('off')
// 			}
// 			else	{$('#aoi-toggle').bootstrapToggle('on')}
// } // if groupAOI even has anything for us
// else {
// 	// nothing to toggle on
// 	$('#aoi-toggle').bootstrapToggle('disable')
// }
// return this

// },
,render: function() {
	$(this.el).html(this.template(this.model.toJSON()))
		// console.log("AOIv.17:"); console.log(this.model);
		return this
		// .rewire()
	}
})