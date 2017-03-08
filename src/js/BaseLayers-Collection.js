var BaseLayersCollection = Backbone.Collection.extend({
	model: BaseLayer,
	url: function() {
		return null
	},
	initialize: function(options) {
		options || (options = {});
		this.listenTo(appState,'change:baselayer',this.preswitch)
	},
	activate: function(nl) {

		console.log("activate nl:");console.log(nl);

		var nm = this.findWhere({
			name: nl
		})
		nm.set({
			active: true
		})

		return this

	},
	preswitch: function() { // we don't trust the incoming layers arr to always be clean


console.log("deactivating...");
var ol = this.findWhere({active:true})

console.log("ol:");console.log(ol.get("name"));
ol.set({active:false},{silent:true}) //silent bc we are gonna set true next and that's gonna trigger

var tl = this.findWhere({name:appState.get("baselayer")})
tl.set({active:true})

// console.log("target mod:");
// console.log(tl);



// 		var intr = _.intersection(appState.get("baselayer"), this.pluck("name")) // get those that happen to be baselayers
// console.log("intr:");console.log(intr);
// 		var keepr = intr.length > 0 ? intr[0] : this.models.findWhere({
// 			active: true
// 		}).get("name"); // keep just the first one or maybe none of them were baselayers
		// var scrubd = _.unique(_.difference(appState.get("baselayer"), this.pluck("name"))) // either way isolate the non-baselayers
		// var prepd = intr[0]

		// console.log("keepr:");console.log(keepr);

		// this.set({
		// 	// layers: _.union(prepd, scrubd)
		// 	layers: intr
		// });
		// if (this.models.findWhere({
		// 	active: true
		// }).get("name") !== keepr) {
		// 	this.switch(keepr)
		// }

		// var peez=appState.get("baselayer").find(function(L){return (L.substring(0,2)=="p:");}).split("p:")[1]

		// var P = (scrubd.length>0)?quHz.findWhere({_id:scrubd[0].split("p:")[1]}):null;

		// if(P){

		// 	appPreev.set({
		// 		gurl:P.geo_render_url,
		// 		gso:P.geo_source
		// 	})
		// }

		return this

	},
	switch: function(nn) {

		console.log("switch nn:");console.log(nn);

		this.invoke('set', {
			"active": false
		}, {
			silent: true
		});
		return this
		.activate(nn)
	},

});