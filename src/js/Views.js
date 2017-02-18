var DownloadView = Backbone.View.extend({
	el: $("#modal-download-copy"),
	template: Handlebars.templates['Modal-Download'],
	template_error: Handlebars.templates['Modal-Download-Error'],
	events: {
		// "click .search-active-bt-close" : "stfu"
		"click .download-format-choose": "download"
	},
	initialize: function() {
		this.listenTo(this.model, 'change', this.change);
		return this
	},
	download: function(e){

		var fmt = $(e.currentTarget).attr("data-id")

		var ogslug = this.model.get("ogslug")

		var cc=UTIL.carto2config(ogslug)
		var usr = cc.usr
		,host=cc.host
		,table=cc.table;

// pull the sql but with type=null - meaning actually pull data (don't just count it e.g.)
var sql = UTIL.carto_sql_gen(null,ogslug);

var format = fmt;

var durl = host+"/api/v2/sql?format="+format+"&q="+sql;
window.location.href = durl;

return this


},
change: function(){

	console.log("in change of dlv")
	return this.render()

},
render: function(){

	appActivityView.stfu();

	var fmts = []
	switch (this.model.get("geo_source")) {
		case "carto":
		dlfmts = Config.D_FORMATS_CARTO;
		dlsource = "Carto";
		dltitle = "Available Formats from Carto:"
		break;
		case "local":
		dlfmts = []
		break;
		default:
		console.log("shouldn't even be here")
	}


	var ogslug = this.model.get("ogslug")

	var cc=UTIL.carto2config(ogslug)
	var usr = cc.usr
	,host=cc.host
	,table=cc.table;

// pull the sql but as a count
var sql = UTIL.carto_sql_gen('count',ogslug);

var durl = host+"/api/v2/sql?";

var that=this

$.getJSON( durl, {q:sql,format:'json'} )
.done(function( json ) {
	if(json.rows[0]['count']==0){
		var explainn = (appDLEX.get("clip")==1)?"Given that downloads are currently clipped to the map extent, you likely just need to zoom out/reposition the map.": "The map is not currently clipping downloads by extent - either the table is empty or some other error is preventing features to appear.";
		$(that.el).html(that.template_error(
			{title:"Error - no features were found within the current AOI.",
			explain:explainn}
			))
	} else {
		$(that.el).html(that.template(
			{title:dltitle,
				formats:dlfmts,
				source:dlsource,
				count:json.rows[0]['count'],
				dl:that.model.toJSON()}
				))}
		$('#modal-download').modal('show');
	})
.fail(function( jqxhr, textStatus, error ) {
	var err = textStatus + ", " + error;
	console.log( "Request Failed: " + err );
});

return this
}

});

var DownloadExtentMenuView = Backbone.View.extend({
	el: $("#layer-switcher-dlex"),
	template: Handlebars.templates['layer-switcher-dlex'],
	events:{},
	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
		return this
	},
	render: function(){


		$(this.el).html(this.template(this.model.toJSON()))

		return this
	}

});

var ConsoleView = Backbone.View.extend({
	el: $("#consoleContainer"),
	template: Handlebars.templates['consoleViewTpl'],
	initialize: function() {
		this.render();
		this.model.bind("change", this.render, this);
	},
	render: function() {
		$(this.el).html(this.template(this.model.toJSON()))
		return this;
	},
	reset: function() {
		this.model.set({
			message: "Hi, I'm Console reset."
		})
		return this
		.render()
	}
});

var AOIMenuView = Backbone.View.extend({
	el: $("#layer-switcher-aoi"),
	template: Handlebars.templates['layer-switcher-aoi'],
	events:{},
	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
		return this
	},
	render: function(){


		$(this.el).html(this.template(this.model.toJSON()))

		return this
	}

});

var PreeView = Backbone.View.extend({
	el:null,
	events:{},
	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
		return this
	},
	subrender_carto: function(){

		console.info("we made subrender_carto at least")
		var ogslug=this.model.get("gurl")

		var cc=UTIL.carto2config(ogslug)
		var usr = cc.usr
		,host=cc.host
		,table=cc.table;		

		console.log("usr:");console.log(usr)
		console.log("host:");console.log(host)
		console.log("table:");console.log(table)

		appActivityView.stfu()

		var G = null;
		if(Config.MODE=="bus"){
			$.getJSON("js/fake-carto.json",function(g){

				L.geoJSON(g, {
					style:UTIL.get_style(g.geometry.type.toLowerCase()),
					onEachFeature: function(f,l){

						return UTIL.oef(f,l);
					}
					// onEachFeature: UTIL.oef()
					
				}).addTo(groupPREEV)
			})
		} else {
			var sql = new cartodb.SQL({ user: Config.CARTO_USER });

			sql.execute("SELECT * FROM "+table+" WHERE cartodb_id > {{id}}", { id: 3 },{format:"GeoJSON"})
			.done(function(data) {    

				L.geoJSON(data, {
					style:UTIL.get_style("fepoly"),
					pointToLayer: function(feature, latlng) {
						return L.circleMarker(latlng, UTIL.get_style("point"));
					},
					onEachFeature: function(f,l){

						return UTIL.oef(f,l);
					}
				}).addTo(groupPREEV);

				return data.rows;
			})
			.error(function(errors) {    
  // errors contains a list of errors
  console.log("errors:" + errors);  })
		}

		// function onEachFeature(feature, layer) {
		// 	var popupContent = "<p>I'm " +feature.properties.name + "</p>";

		// 	if (feature.properties && feature.properties.popupContent) {
		// 		popupContent += feature.properties.popupContent;
		// 	}

		// 	layer.bindPopup(popupContent);
		// }

		// map.setView([39.74739, -105], 13);	
		map.fitBounds(groupPREEV.getBounds());
		


		return this
	},
	render: function(){

		groupPREEV.clearLayers()
		var gt = this.model.get("gso")
		console.info("gt:")
		console.log(gt);
		switch(gt) {
			case "carto":
			return this.subrender_carto()
			break;
			// case "esri rest":
			// return this.subrender_esri_rest()
			// break;
			// case "arcgis feature service":
			// return this.subrender_esri_arcgis()
			// break;
			// case "geojson":
			// return this.subrender_geojson()
			// break;
			// case "json":
			// return this.subrender_json()
			// break;
			// case "kmz":
			// return this.subrender_kmz()
			// break;
			// case "wcs":
			// return this.subrender_wcs()
			// break;
			// case "wfs":
			// return this.subrender_wfs()
			// break;
			// case "wms":
			// return this.subrender_wms()
			// break;
			// case "xml":
			// return this.subrender_xml()
			// break;
			default:
			return this.subrender_unrenderable()
		} 

		// .addTo(groupPREEV)


		// if(typeof esr._activeCells!=="undefined"){
		// 	console.log("84")
		// 	// appActivity.set({message:"84 "+this.model.get("gtyp")})
		// } else {
		// 	appActivity.set({message:"...failed, nudging the url and trying again..."})
		// 	max = 10
		// 	esr = L.esri.featureLayer({url: this.model.url().replace("http:", "https:"),where:"OBJECTID<="+max,timeout: 5000  })
		// 	.addTo(groupPREEV).on("loading",function(){
		// 		appActivity.set({message:"attempting render of sample "+max+ "features from server type "+this.model.get("gtyp")})
		// 	}).on("loaded",function(){
		// 		appActivity.set({message:"rendered sample "+max+ "features"})
		// 	})

		// }


		map.fitBounds(groupPREEV.getBounds());

		return this
	}

});

var DownloadExtentView = Backbone.View.extend({

	el: null,
	events: {
	},
	initialize: function() {


		// this.listenTo(this.collection, 'sync', this.render);
		this.listenTo(this.model, 'change', this.update);


		return this
			// .render()

		},
		update: function(){


			if(this.get("clip")==1){
				console.log("clip is 1")
			// this.set({bbox:map.getBounds().toBBoxString()})
		} else {
			console.log("clip is NOT 1")
			this.set({bbox:"-180,-90,180,90"})

		}

		return this.render()
	},
	render: function() {



		groupDLEX.clearLayers()



		var rstyle = UTIL.get_style("dlex") //pull the aoi style from our universal utility model

// if we r gunna use this we'll need to convert bbox to geojson
var geojson = this.model.get(turf.bboxPolygon(Util.boundsArrFromBBOX("bbox")))

// if we have a single point coming in, we can't clip a download to it, so we're buffering by 500 meters
if (geojson.type == "Point") {

	var pt = {
		"type": "Feature",
		"properties": {},
		"geometry": {
			"type": "Point",
			"coordinates": geojson.coordinates
		}
	};

	var unit = 'meters';

	var geojson = turf.buffer(pt, POINTBUFFER, unit);


}

var extent = turf.extent(geojson);

var exbbx = turf.bboxPolygon(extent);

var se = exbbx.geometry.coordinates[0][1]

var gjo;

gjo = L.geoJson(geojson, {

	style: rstyle,
	pointToLayer: function(feature, latlng) {
		return L.circleMarker(latlng, rstyle);
	}

}).addTo(groupDLEX)

		// map.fitBounds(groupDLEX.getBounds())

		// the hackiest hack in all the land? later the layerswitcher splits nominatim names by comma in order to truncate
		// since i don't want "dlex" to show in the switcher, there's this thing of beauty:
		// var anom = ",dlex"
		// var atyp = "dlex"

		// var switcherhash = {
		// 	id: gjo._leaflet_id,
		// 	"name": anom,
		// 	type: atyp,
		// 	label: "Download Extent",
		// 	style: rstyle
		// }
		// mapSwitchLayers.remove(mapSwitchLayers.where({
		// 	type: "dlex"
		// }));

		// mapSwitchLayers.push(switcherhash)

		// var ttcopy = "downloads currently clipped to dashed line"


		// L.marker([se[1], se[0]], {
		// 		opacity: 0
		// 	})
		// 	.addTo(map)
		// 	.bindTooltip(ttcopy, {
		// 		opacity: .5,
		// 		direction: "right",
		// 		offset: [-15, 0]
		// 	}).openTooltip()

		// gjo.bringToFront()

		// appActivityView.stfu()
		groupDLEX.bringToFront()
		// appState.set({downout:"down"}) //not sure how much we wanna dictate app state, but if ppl are searching for places they prolly wanna see em

		return this


	}

});

var ActiveView = Backbone.View.extend({

	el: $("#search-active"),
	template: Handlebars.templates['ActiveViewTpl'],
	events: {
		// "click .search-active-bt-close" : "stfu"
		"click .search-active-bt-close": "deactivate"
	},
	initialize: function() {


		// this.listenTo(this.collection, 'sync', this.render);
		// this.listenTo(this.model, 'change', this.render);
		// this.listenTo(this.collection, 'change', this.prerender);
		this.listenTo(appState, 'change:active', this.prerender);
		// this.listenTo(this.model, 'sync', this.prerender);
		return this
	},
	prerender: function() {


		// var am = _.findWhere(this.collection,{_id:appState.get("active")})
		var am = this.collection.findWhere({
			_id: appState.get("active")
		})

		if (appState.get("active") == null) {
			return this.stfu()
		} else {
			// this.collection.fetch()
			return this.render()
		}

	},
	deactivate: function() {

		appState.set({
			active: null
		})
		return this

	},
	stfu: function() {

		$(this.el).addClass('down')
		return this
	},
	render: function() {

		// triageQueryView.unrender() //if we wanna show the active pane, we'll hide the other overlays



		if (typeof this.collection.findWhere({
			_id: appState.get("active")
		}) !== 'undefined') {
			$(this.el).html(this.template(this.collection.findWhere({
				_id: appState.get("active")
			}).toJSON()));

			$(this.el).removeClass('down')
		}

		// also zoom to it
		quQueryView.zoom(appState.get("active"))

		return this
	}

});

var QueryMap = Backbone.View.extend({

	el: null,
	events: {
	},
	initialize: function() {


		this.listenTo(this.collection, 'sync', this.render);
		this.listenTo(this.collection, 'change', this.render);
		// this.listenTo(appState, 'change:ahit', this.render);
		return this

	},
	choose: function(e) {



		return this
	},
	render: function() {

		groupHITZ.clearLayers()


		var modz = _.sortBy(this.collection.models, function(m) {

			var w = parseInt(m.get("bbox_west"))
			var s = parseInt(m.get("bbox_south"))
			var e = parseInt(m.get("bbox_east"))
			var n = parseInt(m.get("bbox_north"))

			return (w - e) * (n - s);
		});

		var qarea = turf.area(turf.bboxPolygon([1, 1, 1, 1]))
		var qbbox = null

		_.each(modz, function(m) {

			var w = m.get("bbox_west")
			var s = m.get("bbox_south")
			var e = m.get("bbox_east")
			var n = m.get("bbox_north")

			var bbox = [w, s, e, n];

			var turfpoly = turf.bboxPolygon(bbox);
			var harea = turf.area(turfpoly)

			if (harea > qarea) {
				qarea = harea;
				qbbox = bbox;

			}

			turfpoly.properties = {
				did: m.get("_id"),
				title: m.get("title"),
				format: m.get("format")
			}

			// console.log("m in each of render:"); console.log(m);

			var rstyle = (m.get("_id") == appState.get("active")) ? UTIL.get_style("active") : UTIL.get_style("hit")



			var gjo = L.geoJson(turfpoly, {

				style: rstyle,
				pointToLayer: function(feature, latlng) {
					return L.circleMarker(latlng, rstyle);
				}

			})
			.on("mouseover", function(g) {

				if (g.layer.feature.properties.did !== appState.get("active")) {
					var did = g.layer.feature.properties.did
							// $(".hit-wrapper[data-id='" + did + "']").find(".hit-title").addClass("hit-hover")
							$(".hit-wrapper[data-id='" + did + "']").addClass("hit-hover")
							g.layer.setStyle(UTIL.get_style("hithover"))
						}

					}).on("mouseout", function(g) {

						if (g.layer.feature.properties.did !== appState.get("active")) {
							var did = g.layer.feature.properties.did
							// $("#search-hits").find(".hit-wrapper[data-id='" + did + "']>.hit-title").removeClass("hit-hover")
							// $(".hit-wrapper[data-id='" + did + "']>.hit-title").removeClass("hit-hover")
							// $(".hit-wrapper[data-id='" + did + "']").find(".hit-title").removeClass("hit-hover")
							$(".hit-wrapper[data-id='" + did + "']").removeClass("hit-hover")
							g.layer.setStyle(UTIL.get_style("hit"))
						}

					})
					.on("click", function(g) {
						var did = g.layer.feature.properties.did
						// g.layer.setStyle(UTIL.get_style("active"))
						// appState.set({
						// 	ahit: did
						// })

						appState.set({
							active: (appState.get("active") == did) ? null : did
						})

					})
					.addTo(groupHITZ)

			// snap the map to the extent of the whole group (not easy!)
			// map.fitBounds(L.geoJson(turf.bboxPolygon(qbbox)).getBounds())

		})

		var switchername = (typeof this.collection.findWhere({
			active: true
		}) !== 'undefined') ? "Search Hit Envelopes (1 Active)" : "Search Hit Envelopes";


		var switcherhash = {
			id: groupHITZ._leaflet_id,
			"name": switchername,
			type: "hitz",
			label: "Search Results",
			style: UTIL.get_style("hit")

		}
		if (this.length > 0) {
			mapSwitchLayers.remove(mapSwitchLayers.where({
				type: "hitz"
			}));
			mapSwitchLayers.push(switcherhash)
		}
		// map.fitBounds(groupHITZ.getBounds())
		// $(".toolbar-hitz-zoom").attr("data-id",bbox)
		return this
	}

});



var QueryView = Backbone.View.extend({

	el: function() {
		return $("#" + this.id)
	},
	template: Handlebars.templates['QueryViewTpl'],
	template_split: Handlebars.templates['QueryViewSplitTpl'],
	events: {
		"mouseover li": "lighten",
		"mouseout li": "darken",
		"click .hit-title": "activate",
		"click .toolbar-hitz-zoom": "zoomall",
		"click .toolbar-hit-trigger.toolbar-hit-trigger-extent": "zoom",
		"click .toolbar-hit-trigger.toolbar-hit-trigger-download": "download_triage",
		"click .toolbar-hit-trigger.toolbar-hit-trigger-preview": "preview_triage",
		"click .toolbar-hitz-hide": "hide"
	},
	initialize: function() {


		this.listenTo(this.collection, 'sync', this.render);
		this.listenTo(this.collection, 'change', this.render);
		this.listenTo(appState, 'change:downout', this.render);
		// this.listenTo(appState, 'change:layers', this.preview);
		return this
			// var moptions={keyboard:true,show:false}; $("#triageContainer").modal(moptions);
			// this.render()
		},
		hide: function(e) {


			(map.hasLayer(groupHITZ) == true) ? map.removeLayer(groupHITZ): map.addLayer(groupHITZ)

		// either way we want any AOIs to be front
		groupAOI.bringToFront()

		$('.toolbar-hitz-hide').toggleClass("on")
		return this

	},
	zoomall: function(e) {

//its hard to underscore leaflet groups so we iterate a little first
var westens=[]
var suds=[]
var easties=[]
var nordz=[]
groupHITZ.eachLayer(function(l) {

	var b = l.getBounds();

	westens.push(b.getWest())
	suds.push(b.getSouth())
	easties.push(b.getEast())
	nordz.push(b.getNorth())

});

map.fitBounds([[_.max(nordz),_.min(westens)],[_.min(suds),_.max(easties)]])

return this
},
activate: function(e){

	var did = $(e.currentTarget).parents('.hit-wrapper').attr('data-id')

	appState.set({
		active: (appState.get("active") == did) ? null : did
	}) 

	return this

},
preview_triage: function(e){

// watch for state.layers changes (specifically p: prefixeds)

if(typeof e == 'object'){

	var pdid = "p:"+$(e.currentTarget).parents('.hit-wrapper').attr('data-id'); // note the p prefix - State uses this to smartly divide the layer array

} else {
	// incoming e is just a predefined id
	var pdid = "p:"+e
}

if(pdid.indexOf("p:">=0)){

	var lz = appState.get("layers")
	lz.push(pdid);
	appState.set({layers:lz,non:appState.get("non")+1})
}
	// var am = quHz.findWhere({_id:did});
	
	// appActivity.set({message:"sniffing format..."})
	// var grt = am.get("geo_render_type")
	// var grt = (am.get("geo_render_type")!=='undefined')?am.get("geo_render_type"):null;

	// if(grt==null){
	// 	appActivity.set({hang:true,message:"no web-renderable format"})} else {
		// appActivity.set({message:"attempting render where renderable format = "+grt})
		// appPreev.set({gurl:am.get("geo_render_url"),gso:am.get("geo_source")});
		// }

		return this

	},
	preview_brok: function(e){


		if(appState){
		// var peez = _.find(appState.get("layers"),function(l){return (l.substring(0,2)=='p:');}).split("p:")[1];
		var peez=appState.get("layers").find(function(L){return (L.substring(0,2)=="p:");}).split("p:")[1]

		var preev = (peez)?quHz.findWhere({_id:peez}):null;

		if(typeof preev !== null){


			console.log("preev:")
			console.log(preev)

	// var ah = quHz.findWhere({_id:preevs.split("p:")[1]});

	// console.log("ah:");console.log(ah);}
	appActivity.set({message:"sniffing format..."})
	var grt = preev.get("geo_render_type")
	var grt = (preev.get("geo_render_type")!=='undefined')?preev.get("geo_render_type"):null;

	if(grt==null){
		appActivity.set({hang:true,message:"no web-renderable format"})} else {
			appActivity.set({message:"attempting render where renderable format = "+grt})
			appPreev.set({gurl:preev.get("geo_render_url"),gso:preev.get("geo_source")});
		}
	}}

	return this

},
download_triage: function(e){


	did = $(e.currentTarget).parents('.hit-wrapper').attr('data-id')
	var am = quHz.findWhere({_id:did});




	appActivity.set({message:"sniffing source &amp; format..."})

// here's future switch for raster or other sources w/ different APIs
// if(am.get("geo_source")=="carto"){
	// return this.download_carto(am)
	appDL.set(am.attributes,{silent:true});

	appDL.set({stamp:Date.now()})
	// if(appDL._changing=='false'){
	// 	appDL.trigger('change', appDL);
	// }

	return this
// } else {
// 	return this
// }

},
present: function(m){

	// appActivityView.stfu();

	// var so = "carto";

	// if(so=="carto"){
	// 	var fmts = ["csv","shp","geojson","svg","kml"]
	// }

	// $("#modal-download-copy").html(fmts.join(" - "))
	// $('#modal-download').modal('show');

	return this

},
// download_carto: function(m){


// 	var ogs = m.get("ogslug")
// 	// rather than force storing this in meta, it's just as easy to yank it - at least for a controlled demo like this
// 	// var usr = ogs.split(".carto")[0].split("://")[1]
// 	// var host = ogs.split("/tables")[0]
// 	// var table = ogs.split("tables/")[1]

// 	var cc=UTIL.carto2config(ogslug)
// 	var usr = cc.usr
// 	,host=cc.host
// 	,table=cc.table;

// 	console.log("host")
// 	console.log(host)

// 	var sql = "select * from "+table+" limit 5";
// 	var format = "csv";

// 	// var durl = "https://"+usr+".carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM cbb_point LIMIT 1"
// 	var durl = host+"/api/v2/sql?format="+format+"&q="+sql;
// 	// window.location.href = durl;
// 	console.log(durl);

// 	return this
// },
zoom: function(e){

	var did = null
	if(typeof e == 'object'){

		did = $(e.currentTarget).parents('.hit-wrapper').attr('data-id')} else {
			did = e;
		}

		console.log(did)

		var am = quHz.findWhere({_id:did});

		if(typeof am !== 'undefined'){
			var amboundz = UTIL.boundsFromBBOX(am.get("bbox_west")+','+am.get("bbox_south")+','+am.get("bbox_east")+','+am.get("bbox_north"))

			map.fitBounds(amboundz)
// if am
}
return this

},
darken: function(e) {

	var d_d = $(e.currentTarget).attr("data-id")

		// $(e.currentTarget).find(".hit-title").removeClass("hit-hover")
		$(e.currentTarget).removeClass("hit-hover")

		groupHITZ.eachLayer(function(L) {


			if (L.toGeoJSON().features[0].properties.did == d_d) {


				if (appState.get("active") == d_d) {
					L.setStyle(UTIL.get_style("active"))
				} else {

					L.setStyle(UTIL.get_style("hit"))
				}
			}

		})

		return this
	},
	lighten: function(e) {

		var d_d = $(e.currentTarget).attr("data-id")
		if(appState.get("active")!==d_d){
			$(e.currentTarget).addClass("hit-hover")
			groupHITZ.eachLayer(function(L) {
				if (L.toGeoJSON().features[0].properties.did == d_d) {
					L.setStyle(UTIL.get_style("hithover"))
				}

			})}



			return this

		},
		unrender: function() {

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

		// appActivity.set({message:"processing AOI (area of interest) as : "+arr.target})


		appAOI.set({
			pre: arr
		})


		return this
	},
	rewire: function(){

		$(".tt").tooltip();

		return this

	},
	render: function() {


		var title = (this.collection.length > 0) ? "RESULTS (" + this.collection.length + " total):" : "(no query results)";



		if (appState.get("downout") == 'split') {

			$(this.el).html(this.template_split({
				count: this.collection.models.length,
				rows: this.collection.toJSON(),
				title: title
			}));

		} else {
			$(this.el).html(this.template({
				count: this.collection.models.length,
				rows: this.collection.toJSON(),
				title: title
			}));
		}
		return this
		.rewire();
	}

});


var BaseMapsMenuView = Backbone.View.extend({
	tagName: "ul",
	el: "#menu-basemaps-wrapper",
	events: {
		"click .mnu-basemap-item": "switch",
	},
	template: Handlebars.templates['baseMapsMenuViewTpl'],
	initialize: function() {

		this.collection.bind('change:active', this.render, this);
		this.render()
	},
	switch: function(e) {

		var n = $(e.currentTarget).attr("data-id")

		console.log("n:");console.log(n);

		var aslz = appState.get("layers")

		var newaslz = _.reject(aslz, function(l) { //get rid of the one(s) that are baselayers cuz we gonna add a fresh one
			return _.contains(mapBaseLayers.pluck("name"), l)
		});

		console.log("newaslz:")
		console.log(newaslz)

		// aslz.push(n)
		newaslz.push(n)
		appState.set({
			layers: newaslz
		});
		// this.collection.switch(n)

		console.log("appstatelayers:")
		console.log(appState.get("layers"))

		return this

	},
	render: function() {
		console.log("in render at 1020")
		$(this.el).html(this.template({

			rows: this.collection.toJSON()

		}));
	}
});

var ActivityView = Backbone.View.extend({
	el: $("#activityContainer"),
	template: Handlebars.templates['activityViewTpl'],
	events: {
		"click .activity-cancel": "stfu",
	},
	initialize: function() {

		NProgress.configure({
			parent: "#activityContainer",
			showSpinner: false
		});

		this.model.bind("change", this.render, this);
		// this.render();
	},
	stfu: function(hang) {
		NProgress.done()
		$(this.el).addClass("idle")
			// $("#inputSearch").removeClass("hidden")

			if(hang=="hang"){
				// default hangtime of n seconds
				var ht = (this.model.get("hangtime")>0)?this.model.get("hangtime"):5;
				setTimeout(function(){$("#activityWrapper").addClass('hidden')}, ht*1000)
			} else {
				$("#activityWrapper").addClass('hidden')

				$(this.el).removeClass('warn')
			}



			return this
		},
		warn: function() {

			NProgress.done()

			$(this.el).addClass('warn')

			setTimeout(_.bind(this.stfu, this), 4000);

			return this

		},
		render: function() {
			if (this.model.get("message") == null) {
				return this.stfu()
			}
			console.log("rendering activityview")
			NProgress.start();

			$(this.el).removeClass("idle")
			$("#activityWrapper").removeClass('hidden')
			// $("#inputSearch").addClass("hidden")

			$(this.el).html(this.template(
				this.model.toJSON()
				))

			if(this.model.get("hang")==true){
				return this.stfu("hang")
			} else {
				return this}

			}
		});

var AOIMapView = Backbone.View.extend({
	el: null,
	events: {},
	initialize: function() {


		// this.listenTo(this.model, 'set', this.render)
		// this.listenTo(this.model, 'sync', this.render)
		// this.listenTo(this.model, 'change', this.render)
		this.listenTo(this.model, 'change:geojson', this.render)
		// this.listenTo(appState, 'change:query', this.aoize);
		// this.listenTo(appState, 'change:query', this.render);

		return this
	},
	log: function() {

		console.log("AMV's model changed");

		return this

	},
	check: function() {

		return this

	},

	render: function() {


		groupAOI.clearLayers() // only one of these in groupAOI at once



		if (this.model.get("boundingbox")) {

			appState.set({
				bbox: UTIL.boundstringFromNOMIN(this.model.get("boundingbox"))
			});
		} else {
			appConsole.set({
				message: "No bounding box from Nominatim - couldn't zoom to the AOI"
				}) // incoming geojson bounding box only becomes appState zoomy
		}


		var rstyle = UTIL.get_style("aoi") //pull the aoi style from our universal utility model

		// var moptions = {
		// 	radius: 18,
		// 	fillColor: "#ff7800",
		// 	color: "#000",
		// 	weight: 1,
		// 	opacity: 1,
		// 	fillOpacity: 0.8
		// };

		var gjo;

		gjo = L.geoJson(this.model.get("geojson"), {

			style: rstyle,
			pointToLayer: function(feature, latlng) {
				return L.circleMarker(latlng, rstyle);
			}

		}).addTo(groupAOI)


		var anom = (this.model.get("geojson").type.toLowerCase() == 'point') ? this.model.get("display_name") : this.model.get("display_name")
		var atyp = (this.model.get("geojson").type.toLowerCase() == 'point') ? "aoi_point" : "aoi"

		// appState.set({dlex:atyp}) //this stores in appstate the geom we'll use to clip download jobs - IMPORTANT!

		// var switcherhash = {
		// 	id: gjo._leaflet_id,
		// 	"name": anom,
		// 	type: atyp,
		// 	label: "AOI",
		// 	style: rstyle
		// }
		// mapSwitchLayers.remove(mapSwitchLayers.where({
		// 	type: "aoi"
		// }));
		// mapSwitchLayers.remove(mapSwitchLayers.where({
		// 	type: "aoi_point"
		// }));
		// mapSwitchLayers.push(switcherhash)


		var labeltitle = "<h5>" + this.model.get("display_name") + "</h5>"
		var labelattrib = (this.model.get("pre").type == "aoi_nom") ? "<div class='anno'>(source: <a href='http://nominatim.openstreetmap.org/'>nominatim.openstreetmap.org</a>)</div>" : "<div class='anno'>(source: user-supplied</a>)</div>"

		var labelcopy = labeltitle + labelattrib



		var label = L.popup({
			className: 'popup-non',
			closeButton: false,
			autoPan: false
		})
		.setLatLng(L.latLng(this.model.get("lat"), this.model.get("lon")))
		.setContent(labelcopy)
			.openOn(map) // some funny business from that time when leaflet.label stopped working - we take the lat and lon from the nominatim geojson and we manually drop a entirely-stripped-of-style leaflet popup - looks like a label and disappears in that popupy kinda way

			gjo.bringToFront()

			appActivityView.stfu()

		// appState.set({downout:"down"}) //not sure how much we wanna dictate app state, but if ppl are searching for places they prolly wanna see em

		return this
	}
});

var TriageQueryView = Backbone.View.extend({

	el: function() {
		return $("#" + this.id)
	},
	template: Handlebars.templates['triageQueryViewTpl'],
	events: {
		"click li": "choose"
	},
	unrender: function() {

		// console.log("unrendering triagequeryview")
		$('#triageContainer').addClass('hidden')
		$(this.el).addClass('hidden')

		return this


	},
	choose: function(e) {


		var aid = $(e.currentTarget).find("span").attr("data-id")

		this.unrender()

		appState.set({
			active: aid,
			slug: "search"
		})


		return this
	},
	initialize: function() {


		this.listenTo(this.collection, 'sync', this.render);
		// var moptions={keyboard:true,show:false}; $("#triageContainer").modal(moptions);
		// this.render()
		return this
	},
	render: function() {

		appActivity.set({
			message: null
		})



		var title = (this.collection.length > 0) ? "TOP 10 DATASET MATCHES:" : "TOP DATASETS: (no matches)";

		// if(appState.get("query")!=="" && appState.get("query")!==null){
			$('#triageContainer').removeClass('hidden')
			$(this.el).removeClass('hidden')
			// }

			$(this.el).html(this.template({
				count: this.collection.models.length,
				rows: this.collection.toJSON(),
				title: title
			}));
			return this
		}

	});

var TriageCollectionView = Backbone.View.extend({

	el: function() {
		return $("#" + this.id)
	},
	template: Handlebars.templates['triageCollectionViewTpl'],
	events: {
		"click li": "choose"
	},
	initialize: function() {
		console.log("in initialize of TriageCollectionView")


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
		console.log("in choose of TriageCollectionView")


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

var SearchView = Backbone.View.extend({
	el: $("#inputSearch"),
	template: Handlebars.templates['searchFormViewTpl'],
	events: {
		"keyup": "delay",
		"click #bt-query": "execute_by_click"
	},
	initialize: function() {
		this.render()
		this.model.bind("change:query", this.render, this)
		this.listenTo(appState, 'change:query', this.prequery);
		return this
	},
	execute_by_click: function() {

		var qv = $(this.el).find("#inputContainer input").val()



		$("#triageContainer").toggle()

		appState.set({
			query: qv,
			slug: "search"
		})
		return this


	},
	render: function() {
		$(this.el).html(this.template(this.model.toJSON()))
		return this
	},
	delay: function(event) { //  tnx http://stackoverflow.com/questions/6756381/jquery-backbone-js-delay-function-call
		var self = this;
		if (self.timer)
			clearTimeout(self.timer);
		self.timer = setTimeout(function() {

// after delay, fire preprequery
self.preprequery()

self.timer = null;
}, 500);

		return this
	},
	preprequery: function(g) {


// grab val() of user's entry
var qv = $(this.el).find("#inputContainer input").val()

appActivity.set({message:"parsing "+qv+"..."})
// update appState.query with it
appState.set({
	query: qv
})
return this
},
prequery: function(g) {

		// var qv = $(this.el).find("#inputContainer input").val()

		// appState.set({query:qv})

		var qv = appState.get("query")

		switch (true) { //let's try to catch coordinate input
		case (!isNaN(qv.split(",")[0]) && !isNaN(qv.split(",")[1]) && (qv.split(",").length > 2 && qv.split(",")[2].indexOf("m") > -1)):
				var typ = "coords" //point with a 3rd param - radius in meters
				break;
				case (qv.split(",").length == 1):
				var typ = "string"
				break;
				case (_.every(qv.split(","), function(c) {
					return !isNaN(c)
				})):
				var typ = "coords" //poly
				break;
				default:
				var typ = "string"
			}


		if (typ == "coords") { //if these are coordinates, we are gonna pass in quite a different object (e.g. not a nominatim geom but a custom)

			triageCoordz.set({
				coordzin: qv
			})

// we need to mutate into geojson (possibly buffering when necessary)
var element = triageCoordz.as_choice()


triagePlaces.reset()

var llgodelement = element
llgodelement.llgod_type = "aoi_custom"
triagePlaces.push(llgodelement)



return this
} else {


	var service_url = 'http://nominatim.openstreetmap.org/search.php?limit=5&format=jsonv2&q=' + qv;
			// var solr_url = 'http://libgeo:8080/search.php?limit=5&format=jsonv2&q='+qv;


			triagePlaces.reset()

			// TEMPORARY DISABLED SO WE DON'T HIT NOMINATIM TOO HARD DURING TESTING
			if(Config.MODE!=="bus"){
				$.getJSON(service_url, null, function(response) {
					$.each(response, function(i, element) {
						var llgodelement = element
						llgodelement.llgod_type = "aoi_nom"
						triagePlaces.push(llgodelement)
					});
				});}



				return this
		} //wasn't coords - we propogate the query string to nominatim and solr
	}
})


var StateView = Backbone.View.extend({

	el: $("body"),
	events: {
		"click #paneToggler-split": "downout",
		"click #paneToggler-down": "downout"
	},
	initialize: function() {
		// this.model.bind("change:layers", this.validate, this)
		this.model.bind("change", this.render, this)
			// this.model.bind("bbox", this.render, this)
			this.listenTo(map, 'moveend', this.bboxup);
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
		bboxup: function() {

			var bbox = map.getBounds().toBBoxString()

			if (bbox !== this.model.get("bbox")) {
				this.model.set({
					bbox: bbox
				})
				appDLEX.set({
					bbox: bbox
				})
			}

			return this

		},
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

		// if(this.model.get("downout")=="down"){
		// 	$("#paneContainer").addClass('collapsed');
		// 	$("#paneToggler").addClass('collapsed');
		// 	// $("#triageContainer").addClass('hidden');
		// } else {
		// 	// $("#triageContainer").removeClass('hidden');
		// 	$("#paneContainer").removeClass('collapsed');
		// 	$("#paneToggler").removeClass('collapsed');
		// }


		$(document).attr("title", "Vugo Web App: " + appState.get("slug"));

		if (typeof appRoute !== 'undefined') {
			appRoute.navigate(this.model.pullurl());
		}
		return this

	}

});

var DlexToggleView = Backbone.View.extend({

	el: $("#dlex-toggle-wrapper"),
	template: Handlebars.templates['DlexToggleTpl'],
	events: {
		"click li": function(e) {
			var v = (this.model.get("clip")==0)?1:0;
			this.model.set({clip:v});
		}
	},
	initialize: function() {
		// this.listenTo(appState, 'change', this.render);
		this.listenTo(this.model, 'change', this.render);
		return this.render()
	},
	change: function(){

		console.log("clip:")
		console.log(this.model.get("clip"))

		return this.render()

	},
	render: function() {

		$(this.el).html(this.template(this.model.toJSON()))
		return this
	}
});

var PanelMenuView = Backbone.View.extend({

	el: $("#navContainer .tabbable .nav-tabs"),
	template: Handlebars.templates['PanelMenuViewTpl'],
	events: {
		"click li": function(e) {
			var pid = $(e.currentTarget).attr("data-id")
			appState.set({
				slug: pid
			})
		}
	},
	initialize: function() {
		this.listenTo(appState, 'change', this.render);
		return this.render()
	},
	render: function() {

		$(this.el).html(this.template(this.collection.toJSON()))
		return this
		.subrender()
	},
	subrender: function() {


		var target = appState.get("slug")

		$("#paneContainer").find(".tab-pane").removeClass("active")
		$("#paneContainer").find("#" + target).addClass("active");

		return this

	}

});

var BaseMapView = Backbone.View.extend({

	id: "map",
	initialize: function() {
		// map.setMaxBounds(UTIL.boundsFromBBOX("-180,-90,180,90"))
		this.listenTo(appState, 'change:bbox', this.zoom)
		this.listenTo(this.collection, 'change:active', this.render)
		return this.render()
	},
	zoom: function() {

		if ((appState.get("bbox") !== null) && typeof appState.get("bbox") !== 'undefined' && map.getBounds().toBBoxString() !== appState.get("bbox")) {
			map.fitBounds(UTIL.boundsFromBBOX(appState.get("bbox")))
		}

	},
	render: function() {

		var am = this.collection.findWhere({
			active: true
		});
		var def = (typeof am !== 'undefined')?am.get("definition"):null;

		// remove global layer here first so we don't keep stacking baselayers
		// (we only need one baselayer at a time, of course)
		if (typeof baseLayer == 'undefined') {
			baseLayer = null;
		} else {
			map.removeLayer(baseLayer);
		}
		// a little special handling for stamen maps
		if (typeof am !== 'undefined' && am.get("source") == "stamen") {

			baseLayer = new L.StamenTileLayer(def.id);

			appConsole.set({
				message: "Basemap switched to " + am.get("nom") + ", which might have zoom restrictions"
			})

		} else if (def.subdomains != undefined) {

			baseLayer = new L.TileLayer(def.url, {
				subdomains: def.subdomains,
				maxZoom: 18
			});

		} else {

			baseLayer = new L.TileLayer(def.url, {
				maxZoom: 18
			});
		}

		map.addLayer(baseLayer);
		baseLayer.bringToBack();


		return this
		.zoom()

	}



});

var HomeView = Backbone.View.extend({

	el: $("#home"),
	template: Handlebars.templates['HomeViewTpl'],
	initialize: function() {
		this.model.bind("change", this.render, this)
		return this
	},

	render: function() {
		$(this.el).html(this.template(this.model.toJSON()))
		return this.rewire()
	},
	specialize: function() {

		$(this.el).find("#btSpecial").tooltip();

		$(this.el).find("#btSpecial").click(function(e) {

			e.preventDefault()

			if ($(e.currentTarget).hasClass("on")) {
				special.setOpacity(0)
				$(e.currentTarget).removeClass("on")
			} else {
				$(e.currentTarget).addClass("on")
				special.setOpacity(1)
			}

		})

		return this

	},
	rewire: function() {


		// Assign handlers immediately after making the request,
		// and remember the jqxhr object for this request
		var c3url = "../api/v1/rss/relay/c3"
			// $(this.el).find("#c3latest").html('<img src="images/subset-throbber.gif" height="15px" width="15px"><p>pulling latest c3 blog post...</p>');

		// $.getJSON(c3url, {}).done(function(post) {

		// 	if (typeof post !== 'undefined') {
		// 		var updated = post.updated;
		// 		var title = post.title;
		// 		var link = post.link;

		// 		var timeobj = new Time(updated);
		// 		var t = timeobj.format('l' + ", " + 'F' + ' ' + 'j');

		// 		var conc = "LATEST FROM C3: <a href='" + link + "'>" + title + "</a> <span class='anno'><em>posted " + t + "</em></span>";
		// 		//
		// 		$("#c3latest").html(conc);
		// 	} else {
		// 		$("#c3latest").html("failed to fetch latest <a href='https://c3.llan.ll.mit.edu/blogs/249650e6-9c85-498a-bd0d-59b7b602623a/?lang=en_us'>c3 blog</a> post");
		// 	}

		// });



		$(this.el).find("#homereset").popover({
			placement: "top",
			content: "Remove this error message.",
			trigger: "hover",
			container: 'body'
		});

		$("#homereset").click(function() {
			appHome.unset("homeerror");
			$(".popover").hide();
		});

		$(".contact-trigger").click(function() {

			emailContact = new Contact().set({
				message: ""
			});

			emailContactView = new ContactView({
				model: emailContact
			});

			$('#contactContainer').modal('show')

		});

		return this.specialize()
	}

});

var SwitcherView = Backbone.View.extend({

	el: $("#footer-layer-switcher"),
	template: Handlebars.templates['layersSwitcherViewTpl'],
	events: {
		"click .switcher-button-zoom": "zoom",
		"click .switcher-button-onoff": "onoff",
		// "click li": function(e)
	},
	initialize: function() {
		this.listenTo(this.collection, 'add', this.render);
		this.listenTo(map, 'layerremove', this.render);
		// this.render()
		return this
	},
	zoom: function(e) {

		var pid = $(e.currentTarget).attr("data-id")
		var ptyp = $(e.currentTarget).attr("data-type")

		switch (ptyp) {
			case "aoi":
			map.fitBounds(groupAOI.getBounds())
			break;
			case "aoi_point":
			map.fitBounds(UTIL.boundsFromBBOX(UTIL.boundstringFromNOMIN(appAOI.get("boundingbox"))))

			break;
			case "hitz":
			map.fitBounds(groupHITZ.getBounds())
			break;
			case "dlex":
			map.fitBounds(groupDLEX.getBounds())
			break;
			default:
			console.log("boring!")
		}


		return this
	},
	onoff: function(e) {

		// $(e.currentTarget).toggleClass("on")
		var pid = $(e.currentTarget).attr("data-id")
		var ptyp = $(e.currentTarget).attr("data-type")

		switch (ptyp) {
			case "aoi":
			case "aoi_point":
			if (map.hasLayer(groupAOI) == true) {
				groupAOI.removeFrom(map);
				map.closePopup();
			} else {
				groupAOI.addTo(map);
				this.render()
			}

			break;
			case "dlex":
			if (map.hasLayer(groupDLEX) == true) {
				groupDLEX.removeFrom(map);
				map.closePopup();
			} else {
				groupDLEX.addTo(map);
				this.render()
			}
			break;
			case "hitz":
			if (map.hasLayer(groupHITZ) == true) {
				groupHITZ.removeFrom(map);
				map.closePopup();
			} else {
				groupHITZ.addTo(map);
				this.render()
			}
			break;
			default:
			console.log("boring!")
		}


		return this
	},
	upd: function(u) {
		return this
		.render()
	},
	render: function() {

		if (this.collection.length > 0) {

			$(this.el).removeClass('hidden')

			$(this.el).html(this.template({
				layers: this.collection.toJSON(),
				share: parseInt(this.collection.length) / 12
			}));

		}
		return this
	},

});