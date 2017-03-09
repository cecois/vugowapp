var Route = Backbone.Router.extend({
	routes: {
		"(:slug)(/:page)(/:query)(/:baselayer)(/:overlays)(/:downout)(/:active)(/:bbox)(/)":"default"
	},
initialize: function(options) {
		options || (options = {});
		appState.on('change', this.update, this)
		return this
	},
	update: function(){

if(appState.hasChanged()==true){
appRoute.navigate(appState.pullurl(), {trigger: true,replace: false});} else {
	console.log("state has not changed, no navigation required");
}

return this

	},
	default: function(slug,page,query,baselayer,overlays,downout,active,bbox) {

console.info("VARDUMP:");
console.log("slug:"+slug+";page:"+page+";query:"+query+";baselayer:"+baselayer+";downout:"+downout+";active:"+active+";bbox:"+bbox);

		var zslug = (typeof slug !=='undefined' && slug !== null) ? slug : "home";
		
		var zactive = (typeof active !=='undefined' && active !== null) ? active : null;

		var zpage = (typeof page !=='undefined') ? page : "1";

		var zquery = ((query!==null) && (query!=="nil") && (query)) ? query : "*:*";
		
		var zoverlays = ((overlays!==null) && (overlays!=="nil") && (overlays)) ? overlays : null;
		
		// var zblayername = ( baselayer=="nil" || typeof baselayer == 'undefined' || baselayer == null) ? mapBaseLayers.findWhere({active:true}).get("name"):
		var zblayername = ( baselayer=="nil" || typeof baselayer == 'undefined' || baselayer == null ) ? mapBaseLayers.findWhere({active:true}).get("name") : baselayer;
// zlayer="dummy_set_manually"

		// }
		// } else if(layers.indexOf(",")>-1){
		// 	// here's where we can sniff out layers other than basemaps

		// 	zlayername=layers.split(",")[0]
		// } else {
			// zlayername=layers

// zlayers=new Array(zlayername)
// zlayers=zlayername

		var zdownout = (typeof downout !== 'undefined' && downout!==null && downout !== 'nil') ? downout : "down";
		
		var zbbox = (typeof bbox !== 'undefined' && bbox!==null && bbox!=="null" && bbox!=="nil") ? bbox : appState.get("bbox");



appState.set({
	downout:zdownout
	,
	slug:
	(appState.get("slug")!==zslug) ? zslug : appState.get("slug")
	,
	active:
	(appState.get("active")!==zactive) ? zactive : appState.get("active")
	,
		overlays:
	(appState.get("overlays")!==zoverlays) ? zoverlays : appState.get("overlays")
	,
	bbox:
	zbbox,
	// layers:_.unique(zlayers),
	baselayer:zblayername,
	query: zquery
})

}

});
var appRoute = new Route();
Backbone.history.start();