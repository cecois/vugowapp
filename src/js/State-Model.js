var State = Backbone.Model.extend({
	defaults: {
		"downout": "down",
		"slug": "home",
		"bbox": "3.1626892089843754,50.61113171332364,5.472564697265625,51.172455303299",
		"baselayer": null,
		"overlays": null,
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
		// this.on('change', this.pullurl, this)
		// this.listenTo(map, 'moveend', this.upbbox)
		return this
	},
	upbbox: function(){
var bbx = map.getBounds().toBBoxString();
if(this.get("bbox")!==bbx){
	this.set({bbox:bbx})
}

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
	pullurl: function() {

		var uslug = this.get("slug")
		var upage = this.get("page")
		// var uquery = (this.get("query")==null || this.get("query")=="")?"nil":this.get("query")
		var uquery = this.get("query")
		// var ulayers = (this.get("baselayer").length>1)?_.unique(this.get("baselayer")).join():this.get("baselayer")[0]
		var ublayer = this.get("baselayer")
		console.log("ublayer.ST.56:");console.log(ublayer);
		var uoverlays = this.get("overlays")
		var udownout = this.get("downout")
		// var uactive = (this.get("active")==null || this.get("active")=="")?"nil":this.get("active")
		var uactive = this.get("active")
// var uactive = this.get("active")
var ubbox = this.get("bbox")

var state = "#" + uslug + "/" + upage + "/" + uquery + "/" + ublayer + "/" + uoverlays + "/" + udownout + "/" + uactive+ "/" + ubbox

return state

		// /pullurl
	}
});