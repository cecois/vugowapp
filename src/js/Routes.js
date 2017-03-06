var Route = Backbone.Router.extend({
	routes: {
		"(:slug)(/:page)(/:query)(/:layers)(/:downout)(/:active)(/:bbox)(/)":"default"
	},
initialize: function(options) {
		options || (options = {});
		appState.on('change', this.update, this)
		return this
	},
	update: function(){

if(appState.hasChanged()==true){
appRoute.navigate(appState.update(), {trigger: true,replace: true});} else {
	console.log("state has not changed, no navigation required");
}

return this

	},
	default: function(slug,page,query,layers,downout,active,bbox) {

console.info("VARDUMP:");
console.log("slug:"+slug+";page:"+page+";query:"+query+";layers:"+layers+";downout:"+downout+";active:"+active+";bbox:"+bbox);

		var zslug = (typeof slug !=='undefined' && slug !== null) ? slug : "home";
		
		var zactive = (typeof active !=='undefined' && active !== null) ? active : null;

		var zpage = (typeof page !=='undefined') ? page : "1";

		var zquery = ((query!==null) && (query!=="nil") && (query)) ? query : "*:*";
		
		if( layers=="nil" || typeof layers == 'undefined' || layers == null){
zlayersa=mapBaseLayers.findWhere({active:true}).get("name")
// zlayersa="dummy_set_manually"
zlayers=new Array(zlayersa)

		} else if(layers.indexOf(",")>-1){

			zlayers=layers.split(",")
		} else {
			zlayers=new Array(layers)
		}

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
	bbox:
	zbbox,
	layers:_.unique(zlayers),
	query: zquery
})

}

});
var appRoute = new Route();
Backbone.history.start();