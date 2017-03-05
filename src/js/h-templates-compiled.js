(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['PanelMenuViewTpl'] = template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<li data-id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"col-md-2 "
    + escapeExpression(((helper = (helper = helpers.active || (depth0 != null ? depth0.active : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"active","hash":{},"data":data}) : helper)))
    + "\">\n\n	"
    + escapeExpression(((helper = (helper = helpers.displayname || (depth0 != null ? depth0.displayname : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"displayname","hash":{},"data":data}) : helper)))
    + "\n\n</li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1;
  stack1 = helpers.each.call(depth0, depth0, {"name":"each","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { return stack1; }
  else { return ''; }
  },"useData":true});
})();