(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['AOIStatusTpl'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<!-- <input id=\"aoi-toggle\" type=\"checkbox\" data-toggle=\"toggle\" data-size=\"mini\" class=\"toggle\"  data-on=\"on\" data-off=\"off\"> -->\n<span\"><strong>DOWNLOAD CLIPS TO:</strong> "
    + container.escapeExpression(((helper = (helper = helpers.type_display || (depth0 != null ? depth0.type_display : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"type_display","hash":{},"data":data}) : helper)))
    + "</span>";
},"useData":true});
templates['BaseMapsMenuViewTpl'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "<li class=\"mnu-basemap-item\" data-id=\""
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + "\">\n<img class=\""
    + alias2(alias1((depth0 != null ? depth0.active : depth0), depth0))
    + "\" src=\"images/thumbs/"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + ".png\" height=\"\" width=\"\">\n</li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<ul class=\"list-inline\" id=\"mnu-basemaps\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.rows : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</ul>";
},"useData":true});
templates['PanelMenuViewTpl'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<li data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"col-md-2 "
    + alias4(((helper = (helper = helpers.active || (depth0 != null ? depth0.active : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"active","hash":{},"data":data}) : helper)))
    + "\">\n\n	"
    + alias4(((helper = (helper = helpers.displayname || (depth0 != null ? depth0.displayname : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayname","hash":{},"data":data}) : helper)))
    + "\n\n</li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['QueryFormViewTpl'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "\n<div class=\"col-lg-12\">\n    <div class=\"input-group col-lg-12\">\n	<input type=\"text\" placeholder=\"query here for data OR locations of interest\" class=\"form-control\" value='"
    + container.escapeExpression(((helper = (helper = helpers.querydisplay || (depth0 != null ? depth0.querydisplay : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"querydisplay","hash":{},"data":data}) : helper)))
    + "'>\n      <span class=\"input-group-btn\">\n      </span>\n    </div><!-- /input-group -->\n  </div><!-- /.col-lg-6 -->\n\n\n";
},"useData":true});
templates['TriagePlacesViewTpl'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : {}, alias4=helpers.helperMissing;

  return "\n	<li class=\"triage-query-item\">\n		<span data-id=\""
    + alias2(alias1((depth0 != null ? depth0.llgod_type : depth0), depth0))
    + "\" data-bbox=\""
    + alias2(alias1((depth0 != null ? depth0.boundingbox : depth0), depth0))
    + "\" data-target=\""
    + alias2(alias1((depth0 != null ? depth0.display_name : depth0), depth0))
    + "\"  class=\"triage-trigger\">"
    + ((stack1 = (helpers.equal || (depth0 && depth0.equal) || alias4).call(alias3,(depth0 != null ? depth0.llgod_type : depth0),"aoi_nom",{"name":"equal","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.equal || (depth0 && depth0.equal) || alias4).call(alias3,(depth0 != null ? depth0.llgod_type : depth0),"aoi_custom",{"name":"equal","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</span>\n		<span class=\""
    + alias2((helpers.nominatum_iconify || (depth0 && depth0.nominatum_iconify) || alias4).call(alias3,(depth0 != null ? depth0.osm_type : depth0),{"name":"nominatum_iconify","hash":{},"data":data}))
    + "\"></span>\n	</li>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3=container.escapeExpression;

  return alias3((helpers.nominatum_chop || (depth0 && depth0.nominatum_chop) || alias2).call(alias1,(depth0 != null ? depth0.display_name : depth0),0,{"name":"nominatum_chop","hash":{},"data":data}))
    + "  ("
    + alias3(container.lambda((depth0 != null ? depth0.type : depth0), depth0))
    + ") "
    + alias3((helpers.nominatum_chop || (depth0 && depth0.nominatum_chop) || alias2).call(alias1,(depth0 != null ? depth0.display_name : depth0),1,{"name":"nominatum_chop","hash":{},"data":data}))
    + " "
    + alias3((helpers.nominatum_chop || (depth0 && depth0.nominatum_chop) || alias2).call(alias1,(depth0 != null ? depth0.display_name : depth0),2,{"name":"nominatum_chop","hash":{},"data":data}));
},"4":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return alias2(alias1((depth0 != null ? depth0.display_name : depth0), depth0))
    + "  ("
    + alias2(alias1((depth0 != null ? depth0.type : depth0), depth0))
    + ")";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<h4>"
    + container.escapeExpression(container.lambda((depth0 != null ? depth0.title : depth0), depth0))
    + "</h4>\n<ul class=\"list-unstyled\">"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.rows : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</ul>";
},"useData":true});
})();