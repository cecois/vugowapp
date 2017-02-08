var Download = Backbone.Model.extend({defaults: {stamp:null},initialize: function(){return this;}}); //dl

var DownloadExtent = Backbone.Model.extend({
	defaults: {
		"bbox": null,
		"clip":1
		// "type": null
	},
	initialize: function() {

		// this.set({bbox:map.getBounds().toBBoxString()})
		// this.listenTo(triagePlace,"change","update")
		// this.listenTo(appState,"change:bbox","update")
		// this.listenTo(this,"change","update")
		// this.listenTo(appAOI, 'change:geojson', this.update);
		// map.on('moveend', this.update());
		// map.on('moveend', this.set({bbox:map.getBounds().toBBoxString()}));

		// var that = this
		// groupAOI.on('layeradd',function(){
		// 	that.update()
		// })

		return this
		// .update()
	},
	update: function(){

		console.log("in update, appstate bbox:")
		console.log(appDLEX.get("bbox"));

		if(this.get("clip")==1){
			console.log("clip is 1")
			this.set({bbox:appDLEX.get("bbox")})
		} else {
			console.log("clip is NOT 1")
			this.set({bbox:"-180,-90,180,90"})

		}


		return this

	}


}); //dlex

var Query = Backbone.Model.extend({
	defaults: {
		// qurl: "../../solr/select/?version=2.2&rows=25&defType=edismax&wt=json&q=",
		// qroot: "http://libgeoqa:8080/solr/select/?version=2.2&indent=off&wt=json&q=",
		qroot: "http://localhost:8989/solr/biblio/select/?version=2.2&indent=off&wt=json&q=",
		querystring: '',
		spatialSolr: '',
		hash: "",
		numrows: 25,
		recordOffset: 0,
		query: ''
	},


	initialize: function() {

		this.listenTo(appState, 'change', function() {
			this.get_query();
		});

	},
	get_sorters: function() {
		// most basic - score only
		var sorterString = '&sort=score desc';

		return sorterString;

	},
	get_filter_query: function() {

		var bounds = UTIL.boundsFromBBOX(appState.get("bbox"))

		var bbox_west = bounds.getWest()
		var bbox_south = bounds.getSouth()
		var bbox_east = bounds.getEast()
		var bbox_north = bounds.getNorth()

		// these are xy/area/difference params that feed the ranking algorithm
		var xdif = Math.abs((bbox_east - bbox_west))
		var xdifAboveWest = (xdif / 2) + bbox_west
		var ydif = Math.abs((bbox_north - bbox_south))
		var ydifAboveSouth = (ydif / 2) + bbox_south

		// adjusted from OpenGeoPortal's solr fq, mostly just the minimum frange valu
		var fq = "fq={!frange l=0 u=10}product(2.0,map(sum(map(sub(abs(sub(" + xdifAboveWest + "," + xdif + ")),sum(" + xdif / 2 + ",div(sub(bbox_east,bbox_west),2))),0,400000,1,0),map(sub(abs(sub(" + ydifAboveSouth + "," + ydif + ")),sum(" + ydif / 2 + ",div(sub(bbox_north,bbox_south),2))),0,400000,1,0)),0,0,1,0))";


		return fq;

	},
	get_query: function() {

		var querystring = appState.get("query");

		if (querystring.indexOf("_id:") > -1) { //someones already got what they want
			return querystring
		}


		var queryOG = '{!lucene q.op=AND df=description}' + querystring + '~' + this.get_spatial() + this.get_filter_query() + "&start=" + this.get_record_offset() + this.get_sorters()
		
		var query = '{!lucene q.op=AND df=description}' + querystring + '&bf=' + this.get_spatial() + "&start=" + this.get_record_offset() + this.get_sorters()

		// this.set({
		// 	"query": query
		// });

		return query
	},
	get_spatial: function() {

		// fake area value of current map view - we'll compare it to the fake area of the record
		// we want one vector that boosts based on
		var fakeArea = this.get_earth_factor();

		var bounds = UTIL.boundsFromBBOX(appState.get("bbox"))

		var bbox_west = bounds.getWest()
		var bbox_south = bounds.getSouth()
		var bbox_east = bounds.getEast()
		var bbox_north = bounds.getNorth()

/*

"recip(sum(abs(sub(Area,41.31167295465366)),.01),1,1000,1000)^70","product(sum(map(sum(map(sub(-89.76379394531125,MinX),0,400,1,0),map(sub(-89.76379394531125,MaxX),-400,0,1,0),map(sub(39.614004503559,MinY),0,400,1,0),map(sub(39.614004503559,MaxY),-400,0,1,0)),4,4,1,0),map(sum(map(sub(-89.76379394531125,MinX),0,400,1,0),map(sub(-89.76379394531125,MaxX),-400,0,1,0),map(sub(40.679843584072,MinY),0,400,1,0),map(sub(40.679843584072,MaxY),-400,0,1,0)),4,4,1,0),map(sum(map(sub(-89.76379394531125,MinX),0,400,1,0),map(sub(-89.76379394531125,MaxX),-400,0,1,0),map(sub(41.745682664585,MinY),0,400,1,0),map(sub(41.745682664585,MaxY),-400,0,1,0)),4,4,1,0),map(sum(map(sub(-87.3413085937485,MinX),0,400,1,0),map(sub(-87.3413085937485,MaxX),-400,0,1,0),map(sub(39.614004503559,MinY),0,400,1,0),map(sub(39.614004503559,MaxY),-400,0,1,0)),4,4,1,0),map(sum(map(sub(-87.3413085937485,MinX),0,400,1,0),map(sub(-87.3413085937485,MaxX),-400,0,1,0),map(sub(40.679843584072,MinY),0,400,1,0),map(sub(40.679843584072,MaxY),-400,0,1,0)),4,4,1,0),map(sum(map(sub(-87.3413085937485,MinX),0,400,1,0),map(sub(-87.3413085937485,MaxX),-400,0,1,0),map(sub(41.745682664585,MinY),0,400,1,0),map(sub(41.745682664585,MaxY),-400,0,1,0)),4,4,1,0),map(sum(map(sub(-84.91882324218575,MinX),0,400,1,0),map(sub(-84.91882324218575,MaxX),-400,0,1,0),map(sub(39.614004503559,MinY),0,400,1,0),map(sub(39.614004503559,MaxY),-400,0,1,0)),4,4,1,0),map(sum(map(sub(-84.91882324218575,MinX),0,400,1,0),map(sub(-84.91882324218575,MaxX),-400,0,1,0),map(sub(40.679843584072,MinY),0,400,1,0),map(sub(40.679843584072,MaxY),-400,0,1,0)),4,4,1,0),map(sum(map(sub(-84.91882324218575,MinX),0,400,1,0),map(sub(-84.91882324218575,MaxX),-400,0,1,0),map(sub(41.745682664585,MinY),0,400,1,0),map(sub(41.745682664585,MaxY),-400,0,1,0)),4,4,1,0)),0.1111111111111111)^30","sum(recip(abs(sub(product(sum(MinX,MaxX),.5),-84.594726562499)),1,1000,1000),recip(abs(sub(product(sum(MinY,MaxY),.5),44.840290651398)),1,1000,1000))^15","if(and(exists(MinX),exists(MaxX),exists(MinY),exists(MaxY)),map(sum(map(MinX,-92.186279296874,-82.496337890623,1,0),map(MaxX,-92.186279296874,-82.496337890623,1,0),map(MinY,38.548165423046,42.811521745098,1,0),map(MaxY,38.548165423046,42.811521745098,1,0)),4,4,1,0),0)^80"

*/

/*

"recip(sum(abs(sub(Area,fakeArea)),.01),1,1000,1000)^70","sum(recip(abs(sub(product(sum(MinX,MaxX),.5),bbox_east)),1,1000,1000),recip(abs(sub(product(sum(MinY,MaxY),.5),bbo_north)),1,1000,1000))^15","if(and(exists(MinX),exists(MaxX),exists(MinY),exists(MaxY)),map(sum(map(MinX,bbox_west,bbox_east,1,0),map(MaxX,bbox_west,bbox_east,1,0),map(MinY,bbox_south,bbox_north,1,0),map(MaxY,bbox_south,bbox_north,1,0)),4,4,1,0),0)^80"

*/

		// some spatial-relavance boosters adjusted from OpenGeoPortal's solr query
		var spatial = '"recip(sum(abs(sub(Area,'+fakeArea+')),.01),1,1000,1000)^70","sum(recip(abs(sub(product(sum(MinX,MaxX),.5),'+bbox_east+')),1,1000,1000),recip(abs(sub(product(sum(MinY,MaxY),.5),'+bbox_north+')),1,1000,1000))^15","if(and(exists(MinX),exists(MaxX),exists(MinY),exists(MaxY)),map(sum(map(MinX,'+bbox_west+','+bbox_east+',1,0),map(MaxX,'+bbox_west+','+bbox_east+',1,0),map(MinY,'+bbox_south+','+bbox_north+',1,0),map(MaxY,'+bbox_south+','+bbox_north+',1,0)),4,4,1,0),0)^80"'

		return spatial

	},
	get_spatialOG: function() {

		// fake area value of current map view - we'll compare it to the fake area of the record
		// we want one vector that boosts based on
		var fakeArea = this.get_earth_factor();

		var bounds = UTIL.boundsFromBBOX(appState.get("bbox"))

		var bbox_west = bounds.getWest()
		var bbox_south = bounds.getSouth()
		var bbox_east = bounds.getEast()
		var bbox_north = bounds.getNorth()

		// some spatial-relavance boosters adjusted from OpenGeoPortal's solr query
		var spatial = '_val_:"product(15.0,recip(sum(abs(sub(product(sub(bbox_east,bbox_west),sub(bbox_north,bbox_south)),' + fakeArea + ')),.01),1,1000,1000))"';
		spatial += ' _val_:"product(3.0,recip(abs(sub(product(sum(bbox_east,bbox_west),.5),0)),1,1000,1000))"';
		spatial += ' _val_:"product(3.0,recip(abs(sub(product(sum(bbox_north,bbox_south),.5),0)),1,1000,1000))"';
		spatial += ' _val_:"product(10.0,map(sum(map(bbox_west,' + bbox_west + ',' + bbox_east + ',1,0),map(bbox_east,' + bbox_west + ',' + bbox_east + ',1,0),map(bbox_south,' + bbox_south + ',' + bbox_north + ',1,0),map(bbox_north,' + bbox_south + ',' + bbox_north + ',1,0)),4,4,1,0))"';

		return spatial

	},
	get_earth_factor: function() {

		var bounds = UTIL.boundsFromBBOX(appState.get("bbox"))

		var bbox_west = bounds.getWest()
		var bbox_south = bounds.getSouth()
		var bbox_east = bounds.getEast()
		var bbox_north = bounds.getNorth()

		var fakeArea = ((bbox_east - bbox_west) * (bbox_north - bbox_south))

		return fakeArea

	},
	get_record_offset: function() {
		var offset = (appState.get("page") * 25 - 25);
		// this.set({recordOffset:offset});
		return offset;
	}


});

var Activity = Backbone.Model.extend({
	defaults: {
		message: "",
		spin: false
	}
});

var Preev = Backbone.Model.extend({
	defaults: {
		gurl:null,
		gso:null
	},
	url: function(){
			// here's a chance to mutate/sniff the thing
			return this.gurl
		}

	});

var Console = Backbone.Model.extend({

	defaults:{message:"Hi, I'm Console. The 'z' key will toggle the main pane."}

});

var Hit = Backbone.Model.extend({});

var TriageCoordz = Backbone.Model.extend({
	defaults: {
		"coordzin": null,
		"type": null
	},
	initialize: function() {
		this.bind("change:coordzin", this.update, this)
	},
	as_choice: function() {


		console.log("217:"); console.log(this);

		if (this.get("type") == "radius") {
			var coordz = this.get("coordzin").split(",")
			var lon = coordz[0]
			var lat = coordz[1]
			var rad = coordz[2].split("m")[0] / 1000 //turf wants kilometers but i already committed to taking meters as param
			var pt = {
				"type": "Feature",
				"properties": {},
				"geometry": {
					"type": "Point",
					"coordinates": [lon, lat]
				}
			};
			var unit = 'kilometers';
			var buffered = turf.buffer(pt, rad, unit);
			var result = turf.featurecollection([buffered.features, pt]);
			var enveloped = turf.envelope(buffered);
			var west = enveloped.geometry.coordinates[0][0][0]
			var south = enveloped.geometry.coordinates[0][0][1]
			var east = enveloped.geometry.coordinates[0][2][0]
			var north = enveloped.geometry.coordinates[0][2][1]
			var choice = {
				"boundingbox": [
				south,
				north,
				west,
				east
				],
				"geojson": result.features[0][0], //just the buffer
				"lat": lat,
				"lon": lon,
				"display_name": "Custom AOI",
				"category": null,
				"type": this.get("type"),
				"osm_type": "relation" // we are faking this cuzzits the best choice to use in nomin situations
			}

		} else if (this.get("type") == "point") {

			console.log("256:point")
			var coordz = this.get("coordzin").split(",")
			var lon = coordz[0]
			var lat = coordz[1]
			var pt = {
				"type": "Feature",
				"properties": {},
				"geometry": {
					"type": "Point",
					"coordinates": [lon, lat]
				}
			};
			var unit = 'kilometers';
			var buffered = turf.buffer(pt, 2.5, unit); // arbitrary - we just wanna put something nice on the map
			var result = turf.featurecollection([buffered.features, pt]);
			var enveloped = turf.envelope(buffered);
			var west = enveloped.geometry.coordinates[0][0][0]
			var south = enveloped.geometry.coordinates[0][0][1]
			var east = enveloped.geometry.coordinates[0][2][0]
			var north = enveloped.geometry.coordinates[0][2][1]
			var choice = {
				"boundingbox": [
				south,
				north,
				west,
				east
				],
				"geojson": pt,
				"lat": lat,
				"lon": lon,
				"display_name": "Custom AOI",
				"category": null,
				"type": this.get("type"),
				"osm_type": "node" // we are faking this cuzzits the best choice to use in nomin situations
			}


		} else if (this.get("type") == "poly") {
			console.log("294:poly")

			var coordz = this.get("coordzin").split(",")

			var poly = turf.bboxPolygon(coordz);

			var enveloped = turf.envelope(poly);

// var centroid = turf.centroid(poly);
// console.log("centroid:"); console.log(centroid);
// var lat =
// var lon =

var west = Number(enveloped.geometry.coordinates[0][0][0])
var south = Number(enveloped.geometry.coordinates[0][0][1])
var east = Number(enveloped.geometry.coordinates[0][2][0])
var north = Number(enveloped.geometry.coordinates[0][2][1])
			var nudgex = (west - east) * .1 // just a little nudge so users can see the bbox they drew
			var nudgey = (north - south) * .1 // just a little nudge so users can see the bbox they drew

			var lat = (north - south)*.5
			var lon = (east - west)*.5
			var choice = {
				"boundingbox": [
				south + nudgex,
				north + nudgey,
				west - nudgey,
				east - nudgex
				],
				"geojson": poly,
				"lat": lat,
				"lon": lon,
				"display_name": "Custom AOI",
				"category": null,
				"type": this.get("type"),
				"osm_type": "relation" // we are faking this cuzzits the best choice to use in nomin situations
			}

		}

		// }

		return choice

	},
	update: function() {

		if (typeof this.get("coordzin") !== 'undefined' && this.get("coordzin") !== null) {
			switch (true) {
				case (this.get("coordzin").split(",").length == 1):
				var typ = "invalid"
				break;
				case (this.get("coordzin").split(",").length == 2):
				var typ = "point"
				break;
				case (this.get("coordzin").indexOf("m") > -1):
				var typ = "radius"
				break;
				case (this.get("coordzin").split(",").length > 2):
				var typ = "poly"
				break;
				default:
				var typ = "invalid"
			}
		}
		this.set({
			type: typ
		})
		return this
	},
});

var AOI = Backbone.Model.extend({
	defaults: {
		"pre": null
	},
	initialize: function() {
		// this.bind("change:type", this.update, this)
		this.bind("change:pre", this.update, this)
		// this.bind("change", this.log, this)
		// this.bind("sync",this.log,this)
	},
	log: function(){

		console.log("aoi changed at 353")
		return this

	},

	update: function() {


		if (this.get("pre").type == "aoi_nom") {
			if (this.url() !== null) {
				this.fetch()
			}
		} else {
			this.local()
		}

	},
	local: function() {
		console.log("in local of AOI")
		this.set(triageCoordz.as_choice())
		return this

	},
	parse: function(data) {
		console.log("in parse of AOI")
		var gj = data[0]
			// this.set({geom:gj.geojson})

			return gj

		},
		url: function() {
			console.log("in url of AOI")
			if (this.get("pre").type == "aoi_nom" && this.get("pre").target !== null) {
				return "http://nominatim.openstreetmap.org/search.php?limit=1&format=jsonv2&polygon_geojson=1" + "&q=" + encodeURIComponent(this.get("pre").target)
			}
			return null
		}
	});

var State = Backbone.Model.extend({
	defaults: {
		"downout": "out",
		"non":0,
		"slug": "home",
		"bbox": "-149.94140625000003,13.239945499286312,82.44140625000001,66.23145747862573",
		"layers": [],
		"page": "1",
		"apikey": "0",
		"active": null,
		"query": "",
		"active": null,
		"dlex": "map",
		"querytype": null,
		"sessionid": function() {
			var newDate = new Date;
			return this.get("apikey") + "_" + newDate.getTime();
		}
	},
	initialize: function(options) {
		options || (options = {});
		this.on('change:non', this.layerize, this)
		// this.listenTo(this,'change:non', this.layerize)
		return this
	},
	catchzoomz: function(){

		var bbox = this.get("bbox")

// if(typeof appState.changed.bbox !== 'undefined'){
	map.fitBounds(UTIL.boundsFromBBOX(bbox))
// }

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
	layerize: function() { // we don't trust the incoming layers arr to always be clean

	console.log("im layerize in appstate, hi");
		var intr = _.intersection(this.get("layers"), mapBaseLayers.pluck("name")) // get those that happen to be baselayers

		var keepr = intr.length > 0 ? intr[0] : mapBaseLayers.findWhere({
			active: true
		}).get("name"); // keep just the first one or maybe none of them were baselayers
		var scrubd = _.unique(_.difference(this.get("layers"), mapBaseLayers.pluck("name"))) // either way isolate the non-baselayers
		var prepd = [keepr]

		console.log("scrubd:");console.log(scrubd);

		this.set({
			layers: _.union(prepd, scrubd)
		}, {
			silent: true
		});
		if (mapBaseLayers.findWhere({
			active: true
		}).get("name") !== keepr) {
			mapBaseLayers.switch(keepr)
		}

		// var peez=appState.get("layers").find(function(L){return (L.substring(0,2)=="p:");}).split("p:")[1]

		var P = (scrubd.length>0)?quHz.findWhere({_id:scrubd[0].split("p:")[1]}):null;

		console.log("P")
		console.log(P)

		if(P){

			appPreev.set({
				gurl:P.geo_render_url,
				gso:P.geo_source
			})
		}

		return this

	},
	pullurl: function() {

		var uslug = this.get("slug")
		var upage = this.get("page")
		var uquery = (this.get("query")==null || this.get("query")=="")?"nil":this.get("query")
		var ulayers = (this.get("layers").length>1)?_.unique(this.get("layers")).join():this.get("layers")[0]
		var udownout = this.get("downout")
		var uactive = (this.get("active")==null || this.get("active")=="")?"nil":this.get("active")
// var uactive = this.get("active")
var ubbox = this.get("bbox")

var state = "#" + uslug + "/" + upage + "/" + uquery + "/" + ulayers + "/" + udownout + "/" + uactive+ "/" + ubbox

return state

		// /pullurl
	}
});

var BaseLayer = Backbone.Model.extend({
	defaults: {
		active: false
	},
	initialize: function() {}
});

// var MapLabel = Backbone.Model.extend({});

// var MapLabelsObject = Backbone.Model.extend({
// 	url:function(){
// 		return null
// 	},
// 	initialize: function(options) {
// 		options || (options = {});
// 	}

// });

// var MapLabelsCollection = Backbone.Collection.extend({
// 	model: MapLabel,
// 	url:function(){
// 		return null
// 	},
// 	initialize: function(options) {
// 		options || (options = {});
// 	}

// });

var SwitchLayer = Backbone.Model.extend({});
var Triager = Backbone.Model.extend({});

var Panel = Backbone.Model.extend({
	defaults: {
		active: false
	},
	initialize: function() {}
});

// var BaseMap = Backbone.Model.extend({

// 	initialize: function(){
// 		return this;
// 	}
// });

var Home = Backbone.Model.extend({

	defaults: {}

});

var Util = Backbone.Model.extend({
	initialize: function() {},
	carto2config: function(ogs){
		var a = {}
		var usr = ogs.split(".carto")[0].split("://")[1]
		var host = ogs.split("/tables")[0]
		var table = ogs.split("tables/")[1]

		a.usr=usr;a.host=host;a.table=table;

		return a;
	},
	carto_sql_gen: function(type,ogs){

// SELECT * FROM spatialtrack_poly WHERE the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point(-178.8, 5.3), ST_Point(111, 70)), 4326)

// var ogslug = this.model.get("ogslug")

var cc=UTIL.carto2config(ogs)
var usr = cc.usr
,host=cc.host
,table=cc.table;

var select=(typeof type !== 'undefined' && type =="count")?"select count(*) as count":"select *";


// "the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point("+map.getBounds().getSouthWest().lng+", "+map.getBounds().getSouthWest().lat+"), ST_Point("+map.getBounds().getNorthEast().lng+", "+map.getBounds().getNorthEast().lat+")), 4326)"
var where=(appDLEX.get("clip")==1)?" where the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point("+map.getBounds().getSouthWest().lng+", "+map.getBounds().getSouthWest().lat+"), ST_Point("+map.getBounds().getNorthEast().lng+", "+map.getBounds().getNorthEast().lat+")), 4326)":'';

sql = select+" from "+table+where+";";


// var durl = host+"/api/v2/sql?";
if(type !== 'count'){
	return encodeURIComponent(sql);} else {
		return sql;
	}
},
get_style: function(kind) {


		var po = Config.POLYOPACITY; //poly opacity
		var hitpo = po*.5; //hit poly opacity

		var randomstyles = [{
			"color": "#394834",
			"fillColor": "#394834",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#486f95",
			"fillColor": "#486f95",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#A64800",
			"fillColor": "#A64800",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#A64800",
			"fillColor": "#A64800",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#260F1C",
			"fillColor": "#260F1C",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#2A2E12",
			"fillColor": "#2A2E12",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#414622",
			"fillColor": "#414622",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#8C510A",
			"fillColor": "#8C510A",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#DFC27D",
			"fillColor": "#DFC27D",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#01665E",
			"fillColor": "#01665E",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#4D4D4D",
			"fillColor": "#4D4D4D",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#e86000",
			"fillColor": "#e86000",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#5e399b",
			"fillColor": "#5e399b",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#b5a221",
			"fillColor": "#b5a221",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}, {
			"color": "#656033",
			"fillColor": "#656033",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po
		}];

		var styleaoi = {
			"color": "white",
			"fillColor": "#3F1A4F",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": po,
			radius: 22
		}

		var stylehit = {
			"color": "white",
			"fillColor": "white",
			"weight": 4,
			"opacity": .9,
			"fillOpacity": hitpo,
			radius: 22
		}
		var stylefpo = {
			"color": "black",
			"fillColor": "purple",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": hitpo
		}
		var stylehithover = {
			"color": "white",
			"fillColor": "gray",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": hitpo,
			radius: 22
		}

		var stylehigh = {
			"color": "white",
			"fillColor": "yellow",
			"weight": 2,
			"opacity": .9,
			"fillOpacity": .8,
			radius: 22
		}
		var styledlex = {
			"color": "black",
			"fillColor": "black",
			"dashArray": '3',
			"weight": 2,
			"opacity": 1,
			"fillOpacity": 0,
			radius: 22
		}

		var stylefpt = {
			radius: 8,
			fillColor: "purple",
			color: "black",
			weight: 1,
			opacity: .6,
			fillOpacity: 0.2,
		};


		// var maxh = randomstyles.length;
		// var whichh = _.random(0, maxh);
		// var stylehit=randomstyles[whichh]
		// stylehit.opacity=hitpo
		// stylehit.color="white"


		switch (kind) {
			case "active":
			return stylehigh
			break;
			case "fepoly":
			return stylefpo
			break;
			case "point":
			return stylefpt
			break;
			case "aoi":
			return styleaoi
			break;
			case "hit":
			return stylehit
			break;
			case "dlex":
			return styledlex
			break;
			case "hithover":
			return stylehithover
			break;
			case "styledrawnbox":
			return styledrawnbox
			break;
			default:

			var max = randomstyles.length;
			var which = _.random(0, max);
			return randomstyles[which]

		}



	},
	boundstringFromNOMIN: function(bbox) {

		var bba = bbox

		if (bba.length < 4) {
			return "incomplete bbox submitted"
		}


		var s = bba[0]
		var w = bba[2]
		var e = bba[3]
		var n = bba[1]

		var bboxstring = w + "," + s + "," + e + "," + n

		return bboxstring;

	},
	boundsArrFromBBOX: function(bboxstring){

		var bba = bboxstring.split(",")

		if (bba.length < 4) {
			return "incomplete bbox submitted"
		}


		return [bba[0],bba[1],bba[2],bba[3]];

	},
	bbox2wkt: function(bbox){
// quite rudimentary stopgap (wicket wasn't working at the time) conversion of poly or point to wktL

var coordarr = bbox.split(',')
var clength = coordarr.length
if (clength > 2) {
        // assume a poly
        var west = coordarr[0]
        var south = coordarr[1]
        var east = coordarr[2]
        var north = coordarr[3]
        var wkt = "POLYGON ((" + west + " " + south + ", " + east + " " + south + ", " + east + " " + north + ", " + west + " " + north + ", " + west + " " + south + "))"
            //
        } else {
        	var wkt = "POINT (" + coordarr[1] + " " + coordarr[0] + ")"
        }
        return wkt

    },
    oef: function(f,l){

    	var popupContent = "<strong>" +f.properties.name + "</strong>";

    	if (f.properties && f.properties.popupContent) {
    		popupContent += f.properties.popupContent;
    	}

    	l.bindPopup(popupContent);

    	return this

    },
    boundsFromBBOX: function(bboxstring) {

    	var bba = bboxstring.split(",")

    	if (bba.length < 4) {
    		return "incomplete bbox submitted"
    	}

    	var southWest = L.latLng(bba[1], bba[0]),
    	northEast = L.latLng(bba[3], bba[2]),
    	bounds = L.latLngBounds(southWest, northEast);


    	return bounds;

    }
});