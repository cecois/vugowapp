var AOI = Backbone.Model.extend({
	defaults: {
		active: false
		,type:'map'
		,aoi:null
	},
	initialize: function() {
		this.listenTo(appState, 'change:query', this.detect);
		// this.listenTo(appState, 'change:aoi', this.detect);
		// this.listenTo(this, 'change:type', this.geofy);
	}
	,geofy: function(){

		var geom = null;

		console.log("geofy tpye:"); console.log(this.get("type"));

		return this

	}
	,detect: function(){

/*

we wanna pull either the aoi or query value from appstate, sniff what it is (string vs. bbox array vs. coordinate pair, etc) and then set the AOI with it (when applicable) [type and geometry];

if it's a string we shop it to a service (currently nominatim) via the triagePlaces collx/view to see if we can get the geom there - could be it's not a location string but a data query but who cares, amiright?

	*/

var aoistring = (typeof appState.get("aoi") !== 'undefined' && appState.get("aoi") !== null && appState.get("aoi") !== 'null')?appState.get("aoi"):appState.get("query");

var atype = null;
var geom = null;


		var ascoo = (typeof aoistring !== 'undefined')? _.map(aoistring.split(","), function(c){ return parseFloat(c); }) : ''; // bust it open on commas and cast em to numbers

		switch (true) {

// BTDUBZ: if an AOI was previously set (the [not great] test is whether groupAOI is on) we wanna keep it until it's explicitly removed
case (/[a-z]/i.test(aoistring)):
// if its a string we'll send it to triagePlaces, which will query [nominatim] for a renderable geom
atype="string";
break;
case (ascoo.length==4 && _.every(ascoo, function(c) { return isNaN(parseFloat(c))==false; })==true):
// if its a coord array of 4+ we'll turfjs it
atype="bbox";
geom = turf.bboxPolygon(ascoo);
break;
case (ascoo.length==2 && _.every(ascoo, function(c) { return isNaN(parseFloat(c))==false; })==true):
// if its a coord pair we'll turfjs it and buffer it
atype="point";
var center = turf.point(ascoo);
var radius = Config.POINTBUFFER;
var steps = 33;
var units = 'meters';
geom = turf.circle(center, radius, steps, units);
break;
default:
atype="map"
}

// only if things have changed
if((atype=='point'||atype=='bbox') && (this.get("aoi")!==geom)){
	this.set({type:atype,aoi:geom})
}

return this
}
});