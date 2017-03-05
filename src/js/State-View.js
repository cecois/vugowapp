var StateView = Backbone.View.extend({

	el: $("body"),
	events: {
		"click #paneToggler-split": "downout",
		"click #paneToggler-down": "downout"
	},
	initialize: function() {
		this.listenTo(this.model, 'change', this.render)
			// this.listenTo(map, 'moveend', this.bboxup);
			return this
		},
		downout: function(e) {

			e.preventDefault();

			var target = $(e.currentTarget).attr("id").split("-")[1]

// override if the same state was requested (in effect resetting)
if(this.model.get("downout")==target){
	target = "out"
}

			// this.model.toggle("split")
			this.model.set({downout:target})

			return this

		},
		// bboxup: function() {

		// 	var bbox = map.getBounds().toBBoxString()

		// 	if (bbox !== this.model.get("bbox")) {
		// 		this.model.set({
		// 			bbox: bbox
		// 		})
		// 		appDLEX.set({
		// 			bbox: bbox
		// 		})
		// 	}

		// 	return this

		// },
		render: function(a) {

			switch (this.model.get("downout")) {
				case "down":
				$("#paneContainer").removeClass('split');
				$(".homeli").removeClass('split'); //gross but bootstrap responsive didn't work on these manual resizes
				$(".hit-wrapper").removeClass('split'); //gross but bootstrap responsive didn't work on these manual resizes
				$("#paneContainer").addClass('down');

				$("#paneToggler-down").addClass('down');
				$("#paneToggler-split").removeClass('split');
				break;
				case "split":
				$("#paneContainer").removeClass('down');
				$("#paneContainer").addClass('split');
				$(".homeli").addClass('split'); //gross but bootstrap responsive didn't work on these manual resizes
				$(".hit-wrapper").addClass('split'); //gross but bootstrap responsive didn't work on these manual resizes

				$("#paneToggler-down").removeClass('down');
				$("#paneToggler-split").addClass('split');
				break;
				case null:

				break;
				default:
				$("#paneContainer").removeClass('down');
				$("#paneToggler-down").removeClass('down');
				$("#paneContainer").removeClass('split');
				$("#paneToggler-split").removeClass('split');
				$(".homeli").removeClass('split'); //gross but bootstrap responsive didn't work on these manual resizes
				$(".hit-wrapper").removeClass('split'); //gross but bootstrap responsive didn't work on these manual resizes
			}

		$(document).attr("title", "Vugo Web App: " + appState.get("slug"));

		return this

	}

});