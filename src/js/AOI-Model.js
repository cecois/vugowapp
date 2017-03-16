var AOI = Backbone.Model.extend({
	defaults: {
		active: false
		,type:null
		,aoi:null
	},
	initialize: function() {
		this.listenTo(appState, 'change:query', this.detect);
		this.listenTo(appState, 'change:aoi', this.detect);
		// this.listenTo(this, 'change:type', this.geofy);
	}
	,geofy: function(){

		var geom = null;

		console.log("geofy tpye:"); console.log(this.get("type"));

		return this

	}
	,detect: function(){

		var aoistring = (typeof appState.get("aoi") !== 'undefined' && appState.get("aoi") !== null && appState.get("aoi") !== 'null')?appState.get("aoi"):appState.get("query");

		// console.log("in detect, aoistring:")
		// console.log(aoistring)

		var atype = null;
		var geom = null;
		// var ascoo = aoistring.split(",") // bust it open on commas
		var ascoo = _.map(aoistring.split(","), function(c){ return parseFloat(c); }); // bust it open on commas and cast em to numbers

		switch (true) {
			case (aoistring=="*:*"):
atype="can't process an AOI with *:*"; // if its "*:*" theres nothing aoi can do with that
break;
case (/[a-z]/i.test(aoistring)):
atype="not coordinates!";
break;
case (ascoo.length==4 && _.every(ascoo, function(c) { return isNaN(parseFloat(c))==false; })==true):
atype="bbox";
geom = turf.bboxPolygon(ascoo);
break;
case (ascoo.length==2 && _.every(ascoo, function(c) { return isNaN(parseFloat(c))==false; })==true):
atype="pair";
var center = turf.point(ascoo);
var radius = 5;
var steps = 33;
var units = 'kilometers';
geom = turf.circle(center, radius, steps, units);
console.log("geom:"); console.log(geom);
break;
default:
type=null
}

// geom = this.geofy()

// console.log("after some work [nominatim and/or turf prolly] we can set aoi.type and aoi.aoi here, view will trigger and render")
// if its a coord pair we'll turfjs it and buffer it
// if its a coord array of 4+ we'll turfjs it
// if its a string we'll send it to triagePlaces, which will query [nominatim] for a renderable geom
console.log("geom.62:"); console.log(geom);
this.set({type:atype,aoi:geom})

return this
}
});