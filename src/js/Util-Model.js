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



	}
});