var Query = Backbone.Model.extend({
	defaults: {
		// qurl: "../../solr/select/?version=2.2&rows=25&defType=edismax&wt=json&q=",
		// qroot: "http://libgeoqa:8080/solr/select/?version=2.2&indent=off&wt=json&q=",
		qroot: "http://localhost:8989/solr/biblio/select/?version=2.2&indent=off&wt=json&q=",
		querystring: '',
		// querydisplay: this.get_query_display(),
		querydisplay: null,
		spatialSolr: '',
		hash: "",
		numrows: 25,
		recordOffset: 0,
		query: '',
		qtype:'data'
	},


	initialize: function() {

		this.listenTo(appState, 'change', function() {
			this.set({querydisplay:this.get_query_display(),querystring:this.get_query(),query:appState.get("query")});
		});

	},
	get_query_display: function(){

return (appState.get("query")=="*:*")?"*":appState.get("query")

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