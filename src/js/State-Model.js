var State = Backbone.Model.extend({
	defaults: {
		"downout": "out",
		"slug": "home",
		"bbox": null,
		"layers": null,
		"page": "1",
		"apikey": "0",
		"active": null,
		"query": "",
		"active": null,
		"dlex": "map",
		"querytype": null
	},
	initialize: function(options) {
		options || (options = {});
		// this.on('change:non', this.layerize, this)
		this.on('change', this.update, this)
		return this
	},
	toggle: function(which) {

	var whi = (typeof which == 'undefined') ? "split" : which;

	switch (this.get("downout")) {
		case "split":
		wh = "out"
		break;
		case "down":
		wh = "out"
		break;
		case null:
		wh = 'nil'
		break;
		default:
		wh = whi
	}

	this.set({
		downout:
		wh
	})

	return this

},
	update: function() {

		var uslug = this.get("slug")
		var upage = this.get("page")
		// var uquery = (this.get("query")==null || this.get("query")=="")?"nil":this.get("query")
		var uquery = this.get("query")
		// var ulayers = (this.get("layers").length>1)?_.unique(this.get("layers")).join():this.get("layers")[0]
		var ulayers = this.get("layers")
		var udownout = this.get("downout")
		// var uactive = (this.get("active")==null || this.get("active")=="")?"nil":this.get("active")
		var uactive = this.get("active")
// var uactive = this.get("active")
var ubbox = this.get("bbox")

var state = "#" + uslug + "/" + upage + "/" + uquery + "/" + ulayers + "/" + udownout + "/" + uactive+ "/" + ubbox

return state

		// /pullurl
	}
});