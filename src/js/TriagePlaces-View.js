var TriagePlacesView = Backbone.View.extend({

	el: function() {
		return $("#" + this.id)
	},
	template: Handlebars.templates['TriagePlacesViewTpl'],
	events: {
		"click li": "choose"
	},
	initialize: function() {

		this.listenTo(this.collection, 'add', this.render);
		this.listenTo(this.collection, 'reset', this.render);
		// this.listenTo(this.collection, 'sync', this.render);
		// var moptions={keyboard:true,show:false}; $("#triageContainer").modal(moptions);
		// this.render()
		return this
	},
	unrender: function() {
		console.log("in unrender of TriageCollectionView")

		$('#triageContainer').addClass('hidden')
		$(this.el).addClass('hidden')

		return this


	},
	choose: function(e) {

		var typ = $(e.currentTarget).find("span").attr("data-id")
		var target = $(e.currentTarget).find("span").attr("data-target")
		var bbox = $(e.currentTarget).find("span").attr("data-bbox")

		this.unrender()

		var arr = {
			type: typ,
			"target": target,
			"fallback": bbox
		}

		appActivity.set({
			message: "processing AOI (area of interest) as : " + arr.target
		})


		console.log("arr")
		console.log(arr)

		appAOI.set({
			pre: arr
		})


		return this
	},
	render: function() {
		console.log("in render of TriageCollectionView")

		appActivity.set({
			message: null
		})

		var title = (this.collection.length > 0) ? "PLACES/AREAS OF INTEREST:" : "(no matching places/AOIs)";



		if (this.collection.models.length > 0) { //if we don't have any, we don't want that overlay annoying everybody

			$('#triageContainer').removeClass('hidden')
		$(this.el).removeClass('hidden')
	}

	$(this.el).html(this.template({
		count: this.collection.models.length,
		rows: this.collection.toJSON(),
		title: title
	}));

	return this
}

});