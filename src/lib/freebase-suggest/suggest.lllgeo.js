/*
 * Copyright 2012, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Additional Licenses for Third Party components can be found here:
 * http://wiki.freebase.com/wiki/Freebase_Site_License
 *
 */
(function(c, t) {
	if (!("console" in window)) {
		var q = window.console = {};
		q.log = q.warn = q.error = q.debug = function() {}
	}
	c(function() {
		var a = c("<div>");
		c(document.body).append(a);
		var b = setTimeout(function() {
			if (c.cleanData) {
				var d = c.cleanData;
				c.cleanData = function(e) {
					for (var f = 0, h;
					(h = e[f]) != null; f++) c(h).triggerHandler("remove");
					d(e)
				}
			} else {
				var g = c.fn.remove;
				c.fn.remove = function(e, f) {
					return this.each(function() {
						if (!f) if (!e || c.filter(e, [this]).length) c("*", this).add([this]).each(function() {
							c(this).triggerHandler("remove")
						});
						return g.call(c(this), e, f)
					})
				}
			}
		}, 1);
		a.bind("remove", function() {
			clearTimeout(b)
		});
		a.remove()
	});
	var r = {
		key: 1,
		filter: 1,
		spell: 1,
		exact: 1,
		lang: 1,
		scoring: 1,
		prefixed: 1,
		stemmed: 1,
		format: 1,
		mql_output: 1
	};
	c.suggest = function(a, b) {
		c.fn[a] = function(d) {
			this.length || console.warn("Suggest: invoked on empty element set");
			return this.each(function() {
				if (this.nodeName) if (this.nodeName.toUpperCase() === "INPUT") this.type && this.type.toUpperCase() !== "TEXT" && console.warn("Suggest: unsupported INPUT type: " + this.type);
				else console.warn("Suggest: unsupported DOM element: " + this.nodeName);
				var g = c.data(this, a);
				g && g._destroy();
				c.data(this, a, new c.suggest[a](this, d))._init()
			})
		};
		c.suggest[a] = function(d, g) {
			var e = this,
				f = this.options = c.extend(true, {}, c.suggest.defaults, c.suggest[a].defaults, g),
				h = f.css_prefix = f.css_prefix || "",
				i = f.css;
			this.name = a;
			c.each(i, function(j) {
				i[j] = h + i[j]
			});
			f.ac_param = {};
			c.each(r, function(j) {
				var m = f[j];
				m === null || m === "" || (f.ac_param[j] = m)
			});
			f.flyout_lang = null;
			if (f.ac_param.lang) {
				var k = f.ac_param.lang;
				if (c.type(k) === "string") k = k.split(",");
				if (c.isArray(k) && k.length) if (k = c.trim(k[0])) f.flyout_lang = k
			}
			this._status = {
				START: "",
				LOADING: "",
				SELECT: "",
				ERROR: ""
			};
			if (f.status && f.status instanceof Array && f.status.length >= 3) {
				this._status.START = f.status[0] || "";
				this._status.LOADING = f.status[1] || "";
				this._status.SELECT = f.status[2] || "";
				if (f.status.length === 4) this._status.ERROR = f.status[3] || ""
			}
			k = this.status = c('<div style="display:none;">').addClass(i.status);
			var n = this.list = c("<ul>").addClass(i.list),
				l = this.pane = c('<div style="display:none;" class="fbs-reset">').addClass(i.pane);
			l.append(k).append(n);
			if (f.parent) c(f.parent).append(l);
			else {
				l.css("position", "absolute");
				f.zIndex && l.css("z-index", f.zIndex);
				c(document.body).append(l)
			}
			l.bind("mousedown", function(j) {
				e.input.data("dont_hide", true);
				j.stopPropagation()
			}).bind("mouseup", function(j) {
				e.input.data("dont_hide") && e.input.focus();
				e.input.removeData("dont_hide");
				j.stopPropagation()
			}).bind("click", function(j) {
				j.stopPropagation();
				if (j = e.get_selected()) {
					e.onselect(j, true);
					e.hide_all()
				}
			});
			n.hover(function(j) {
				e.hoverover_list(j)
			}, function(j) {
				e.hoverout_list(j)
			});
			this.input = c(d).attr("autocomplete", "off").unbind(".suggest").bind("remove.suggest", function() {
				e._destroy()
			}).bind("keydown.suggest", function(j) {
				e.keydown(j)
			}).bind("keypress.suggest", function(j) {
				e.keypress(j)
			}).bind("keyup.suggest", function(j) {
				e.keyup(j)
			}).bind("blur.suggest", function(j) {
				e.blur(j)
			}).bind("textchange.suggest", function() {
				e.textchange()
			}).bind("focus.suggest", function(j) {
				e.focus(j)
			}).bind(c.browser.msie ? "paste.suggest" : "input.suggest", function() {
				clearTimeout(e.paste_timeout);
				e.paste_timeout = setTimeout(function() {
					e.textchange()
				}, 0)
			});
			this.onresize = function() {
				e.invalidate_position();
				if (l.is(":visible")) {
					e.position();
					if (f.flyout && e.flyoutpane && e.flyoutpane.is(":visible")) {
						var j = e.get_selected();
						j && e.flyout_position(j)
					}
				}
			};
			c(window).bind("resize.suggest", this.onresize).bind("scroll.suggest", this.onresize)
		};
		c.suggest[a].prototype = c.extend({}, c.suggest.prototype, b)
	};
	c.suggest.prototype = {
		_init: function() {},
		_destroy: function() {
			this.pane.remove();
			this.list.remove();
			this.input.unbind(".suggest");
			c(window).unbind("resize.suggest", this.onresize).unbind("scroll.suggest", this.onresize);
			this.input.removeData("data.suggest")
		},
		invalidate_position: function() {
			self._position = null
		},
		status_start: function() {
			this.hide_all();
			this.status.siblings().hide();
			if (this._status.START) {
				this.status.text(this._status.START).show();
				if (!this.pane.is(":visible")) {
					this.position();
					this.pane_show()
				}
			}
			this._status.LOADING && this.status.removeClass("loading")
		},
		status_loading: function() {
			this.status.siblings().show();
			if (this._status.LOADING) {
				this.status.addClass("loading").text(this._status.LOADING).show();
				if (!this.pane.is(":visible")) {
					this.position();
					this.pane_show()
				}
			} else this.status.hide()
		},
		status_select: function() {
			this.status.siblings().show();
			this._status.SELECT ? this.status.text(this._status.SELECT).show() : this.status.hide();
			this._status.LOADING && this.status.removeClass("loading")
		},
		status_error: function() {
			this.status.siblings().show();
			this._status.ERROR ? this.status.text(this._status.ERROR).show() : this.status.hide();
			this._status.LOADING && this.status.removeClass("loading")
		},
		focus: function(a) {
			this.input.val() === "" ? this.status_start() : this.focus_hook(a)
		},
		focus_hook: function() {
			if (!this.input.data("data.suggest") && !this.pane.is(":visible") && c("." + this.options.css.item, this.list).length) {
				this.position();
				this.pane_show()
			}
		},
		keydown: function(a) {
			var b = a.keyCode;
			if (b === 9) this.tab(a);
			else if (b === 38 || b === 40) a.shiftKey || a.preventDefault()
		},
		keypress: function(a) {
			var b = a.keyCode;
			if (b === 38 || b === 40) a.shiftKey || a.preventDefault();
			else b === 13 && this.enter(a)
		},
		keyup: function(a) {
			var b = a.keyCode;
			var v = $(a.currentTarget).val()

/*
here we have a block that monitors keyup for coordinate pairs, wkt strings, etc.
when one is a positive id, it sets the aoi model with the IDd type and raw string
*/
			var isCoords = detectCoordinates(v)
			var isWKTString = detectWKT(v)

if(isCoords=='pair'){
appAOI.set({type:"pair",string:v})
} //if coordpair

if(isCoords=='poly'){
appAOI.set({type:"poly",string:v})
} //if coordpoly

if(isWKTString==true){
appAOI.set({type:"wkt",string:v})
} //if coordpair




			if (b === 38) {
				a.preventDefault();
				this.up(a)
			} else if (b === 40) {
				a.preventDefault();
				this.down(a)
			} else if (a.ctrlKey && b === 77) c(".fbs-more-link", this.pane).click();
			else if (c.suggest.is_char(a)) {
				clearTimeout(this.keypress.timeout);
				var d = this;
				this.keypress.timeout = setTimeout(function() {
					d.textchange()
				}, 0)
			} else b === 27 && this.escape(a);
			return true
		},
		blur: function() {
			if (!this.input.data("dont_hide")) {
				this.input.data("data.suggest");
				this.hide_all()
			}
		},
		tab: function(a) {
			if (!(a.shiftKey || a.metaKey || a.ctrlKey)) {
				a = this.options;
				a = this.pane.is(":visible") && c("." + a.css.item, this.list).length;
				var b = this.get_selected();
				if (a && b) {
					this.onselect(b);
					this.hide_all()
				}
			}
		},
		enter: function(a) {
			var b = this.options;
			if (this.pane.is(":visible")) if (a.shiftKey) {
				this.shift_enter(a);
				a.preventDefault()
			} else if (c("." + b.css.item, this.list).length) if (b = this.get_selected()) {
				this.onselect(b);
				this.hide_all();
				a.preventDefault()
			} else {
				this.input.data("data.suggest");
				if (c("." + this.options.css.item + ":visible", this.list).length) {
					this.updown(false);
					a.preventDefault()
				}
			}
		},
		shift_enter: function() {},
		escape: function() {
			this.hide_all()
		},
		up: function(a) {
			this.updown(true, a.ctrlKey || a.shiftKey)
		},
		down: function(a) {
			this.updown(false, null, a.ctrlKey || a.shiftKey)
		},
		updown: function(a, b, d) {
			var g = this.options.css,
				e = this.list;
			if (this.pane.is(":visible")) {
				var f = c("." + g.item + ":visible", e);
				if (f.length) {
					e = c(f[0]);
					f = c(f[f.length - 1]);
					var h = this.get_selected() || [];
					clearTimeout(this.ignore_mouseover.timeout);
					this._ignore_mouseover = false;
					if (a) if (b) this._goto(e);
					else if (h.length) if (h[0] == e[0]) {
						e.removeClass(g.selected);
						this.input.val(this.input.data("original.suggest"));
						this.hoverout_list()
					} else this._goto(h.prevAll("." + g.item + ":visible:first"));
					else this._goto(f);
					else if (d) this._goto(f);
					else if (h.length) if (h[0] == f[0]) {
						f.removeClass(g.selected);
						this.input.val(this.input.data("original.suggest"));
						this.hoverout_list()
					} else this._goto(h.nextAll("." + g.item + ":visible:first"));
					else this._goto(e)
				}
			} else a || this.textchange()
		},
		_goto: function(a) {
			a.trigger("mouseover.suggest");
			var b = a.data("data.suggest");
			this.input.val(b ? b.name : this.input.data("original.suggest"));
			this.scroll_to(a)
		},
		scroll_to: function(a) {
			var b = this.list,
				d = b.scrollTop(),
				g = d + b.innerHeight(),
				e = a.outerHeight();
			a = a.prevAll().length * e;
			e = a + e;
			if (a < d) {
				this.ignore_mouseover();
				b.scrollTop(a)
			} else if (e > g) {
				this.ignore_mouseover();
				b.scrollTop(d + e - g)
			}
		},
		textchange: function() {
			this.input.removeData("data.suggest");
			this.input.trigger("fb-textchange", this);
			var a = this.input.val();
			if (a === "") this.status_start();
			else {
				this.status_loading();
				this.request(a)
			}
		},
		request: function() {},
		response: function(a) {
			if (a) {
				"cost" in a && this.trackEvent(this.name, "response", "cost", a.cost);
				if (this.check_response(a)) {
					var b = [];
					if (c.isArray(a)) b = a;
					else if ("result" in a) b = a.result;
					var d = c.map(arguments, function(i) {
						return i
					});
					this.response_hook.apply(this, d);
					var g = null,
						e = this,
						f = this.options;
					c.each(b, function(i, k) {
						if (!k.id && k.mid) k.id = k.mid;
						var n = e.create_item(k, a).bind("mouseover.suggest", function(l) {
							e.mouseover_item(l)
						});
						n.data("data.suggest", k);
						e.list.append(n);
						if (i === 0) g = n
					});
					this.input.data("original.suggest", this.input.val());
					if (c("." + f.css.item, this.list).length === 0 && f.nomatch) {
						b = c('<li class="fbs-nomatch">');
						if (typeof f.nomatch === "string") b.text(f.nomatch);
						else {
							f.nomatch.title && b.append(c('<em class="fbs-nomatch-text">').text(f.nomatch.title));
							f.nomatch.heading && b.append(c("<h3>").text(f.nomatch.heading));
							if ((f = f.nomatch.tips) && f.length) {
								var h = c('<ul class="fbs-search-tips">');
								c.each(f, function(i, k) {
									h.append(c("<li>").text(k))
								});
								b.append(h)
							}
						}
						b.bind("click.suggest", function(i) {
							i.stopPropagation()
						});
						this.list.append(b)
					}
					d.push(g);
					this.show_hook.apply(this, d);
					this.position();
					this.pane_show()
				}
			}
		},
		pane_show: function() {
			var a = false;
			if (c("> li", this.list).length) a = true;
			a || this.pane.children(":not(." + this.options.css.list + ")").each(function() {
				if (c(this).css("display") != "none") {
					a = true;
					return false
				}
			});
			if (a) if (this.options.animate) {
				var b = this;
				this.pane.slideDown("fast", function() {
					b.input.trigger("fb-pane-show", b)
				})
			} else {
				this.pane.show();
				this.input.trigger("fb-pane-show", this)
			} else {
				this.pane.hide();
				this.input.trigger("fb-pane-hide", this)
			}
		},
		create_item: function(a) {
			var b = this.options.css,
				d = c("<li>").addClass(b.item);
			a = c("<label>").text(a.name);
			d.append(c("<div>").addClass(b.item_name).append(a));
			return d
		},
		mouseover_item: function(a) {
			if (!this._ignore_mouseover) {
				a = a.target;
				if (a.nodeName.toLowerCase() !== "li") a = c(a).parents("li:first");
				var b = c(a),
					d = this.options.css;
				c("." + d.item, this.list).each(function() {
					this !== b[0] && c(this).removeClass(d.selected)
				});
				if (!b.hasClass(d.selected)) {
					b.addClass(d.selected);
					this.mouseover_item_hook(b)
				}
			}
		},
		mouseover_item_hook: function() {},
		hoverover_list: function() {},
		hoverout_list: function() {},
		check_response: function() {
			return true
		},
		response_hook: function() {
			this.list.empty()
		},
		show_hook: function() {
			this.status_select()
		},
		position: function() {
			var a = this.pane,
				b = this.options;
			if (!b.parent) {
				if (!self._position) {
					var d = this.input,
						g = d.offset(),
						e = d.outerWidth(true),
						f = d.outerHeight(true);
					g.top += f;
					var h = a.outerWidth(),
						i = a.outerHeight(),
						k = g.top + i / 2,
						n = c(window).scrollLeft();
					d = c(window).scrollTop();
					var l = c(window).width(),
						j = c(window).height() + d,
						m = true;
					if ("left" == b.align) m = true;
					else if ("right" == b.align) m = false;
					else if (g.left > n + l / 2) m = false;
					if (!m) {
						m = g.left - (h - e);
						if (m > n) g.left = m
					}
					if (k > j) {
						b = g.top - f - i;
						if (b > d) g.top = b
					}
					this._position = g
				}
				a.css({
					top: this._position.top,
					left: this._position.left
				})
			}
		},
		ignore_mouseover: function() {
			this._ignore_mouseover = true;
			var a = this;
			this.ignore_mouseover.timeout = setTimeout(function() {
				a.ignore_mouseover_reset()
			}, 1E3)
		},
		ignore_mouseover_reset: function() {
			this._ignore_mouseover = false
		},
		get_selected: function() {
			var a = null,
				b = this.options.css.selected;
			c("li", this.list).each(function() {
				var d = c(this);
				if (d.hasClass(b) && d.is(":visible")) {
					a = d;
					return false
				}
			});
			return a
		},
		onselect: function(a) {
			var b = a.data("data.suggest");
			if (b) {
				this.input.val(b.name).data("data.suggest", b).trigger("fb-select", b);
				this.trackEvent(this.name, "fb-select", "index", a.prevAll().length)
			}
		},
		trackEvent: function(a, b, d, g) {
			this.input.trigger("fb-track-event", {
				category: a,
				action: b,
				label: d,
				value: g
			})
		},
		hide_all: function() {
			this.pane.hide();
			this.input.trigger("fb-pane-hide", this)
		}
	};
	c.extend(c.suggest, {
		defaults: {
			status: ["Location shortcut search...", "Searching for locations...", "Select a LOCATION from the list:", "Sorry, something went wrong. Please try again later"],
			soft: false,
			nomatch: "no matches",
			css: {
				pane: "fbs-pane",
				list: "fbs-list",
				item: "fbs-item",
				item_name: "fbs-item-name",
				selected: "fbs-selected",
				status: "fbs-status"
			},
			css_prefix: null,
			parent: null,
			animate: false,
			zIndex: null
		},
		strongify: function(a, b) {
			var d, g = a.toLowerCase().indexOf(b.toLowerCase());
			if (g >= 0) {
				var e = b.length;
				d = document.createTextNode(a.substring(0, g));
				var f = c("<strong>").text(a.substring(g, g + e));
				g = document.createTextNode(a.substring(g + e));
				d = c("<div>").append(d).append(f).append(g)
			} else d = c("<div>").text(a);
			return d
		},
		keyCode: {
			CAPS_LOCK: 20,
			CONTROL: 17,
			DOWN: 40,
			END: 35,
			ENTER: 13,
			ESCAPE: 27,
			HOME: 36,
			INSERT: 45,
			LEFT: 37,
			NUMPAD_ENTER: 108,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			RIGHT: 39,
			SHIFT: 16,
			SPACE: 32,
			TAB: 9,
			UP: 38,
			OPTION: 18,
			APPLE: 224
		},
		is_char: function(a) {
			if (a.type === "keypress") if ((a.metaKey || a.ctrlKey) && a.charCode === 118) return true;
			else {
				if ("isChar" in a) return a.isChar
			} else {
				var b = c.suggest.keyCode.not_char;
				if (!b) {
					b = {};
					c.each(c.suggest.keyCode, function(d, g) {
						b["" + g] = 1
					});
					c.suggest.keyCode.not_char = b
				}
				return !("" + a.keyCode in b)
			}
		},
		parse_input: function(a) {
			for (var b = /(\S+)\:(?:\"([^\"]+)\"|(\S+))/g, d = a, g = [], e = {}, f = b.exec(a); f;) {
				if (f[1] in r) e[f[1]] = c.isEmptyObject(f[2]) ? f[3] : f[2];
				else g.push(f[0]);
				d = d.replace(f[0], "");
				f = b.exec(a)
			}
			d = c.trim(d.replace(/\s+/g, " "));
			return [d, g, e]
		},
		mqlkey_fast: /^[_A-Za-z0-9][A-Za-z0-9_-]*$/,
		mqlkey_slow: /^(?:[A-Za-z0-9]|\$[A-F0-9]{4})(?:[A-Za-z0-9_-]|\$[A-F0-9]{4})*$/,
		check_mql_key: function(a) {
			if (c.suggest.mqlkey_fast.test(a)) return true;
			else if (c.suggest.mqlkey_slow.test(a)) return true;
			return false
		},
		check_mql_id: function(a) {
			if (a.indexOf("/") === 0) {
				a = a.split("/");
				a.shift();
				if (!(a.length == 1 && a[0] === "")) for (var b = 0, d = a.length; b < d; b++) if (!c.suggest.check_mql_key(a[b])) return false;
				return true
			} else return false
		}
	});
	var s = {
		_destroy: c.suggest.prototype._destroy,
		show_hook: c.suggest.prototype.show_hook
	};
	c.suggest("suggest", {
		_init: function() {
			var a = this,
				b = this.options;
			if (b.flyout_service_url == null) b.flyout_service_url = b.service_url;
			this.flyout_url = b.flyout_service_url;
			if (b.flyout_service_path) this.flyout_url += b.flyout_service_path;
			this.flyout_url = this.flyout_url.replace(/\$\{key\}/g, b.key);
			if (b.flyout_image_service_url == null) b.flyout_image_service_url = b.service_url;
			this.flyout_image_url = b.flyout_image_service_url;
			if (b.flyout_image_service_path) this.flyout_image_url += b.flyout_image_service_path;
			this.flyout_image_url = this.flyout_image_url.replace(/\$\{key\}/g, b.key);
			if (!c.suggest.cache) c.suggest.cache = {};
			if (b.flyout) {
				this.flyoutpane = c('<div style="display:none;" class="fbs-reset">').addClass(b.css.flyoutpane);
				if (b.flyout_parent) c(b.flyout_parent).append(this.flyoutpane);
				else {
					this.flyoutpane.css("position", "absolute");
					b.zIndex && this.flyoutpane.css("z-index", b.zIndex);
					c(document.body).append(this.flyoutpane)
				}
				this.flyoutpane.hover(function(d) {
					a.hoverover_list(d)
				}, function(d) {
					a.hoverout_list(d)
				}).bind("mousedown.suggest", function(d) {
					d.stopPropagation();
					a.pane.click()
				});
				if (!c.suggest.flyout) c.suggest.flyout = {};
				if (!c.suggest.flyout.cache) c.suggest.flyout.cache = {}
			}
		},
		_destroy: function() {
			s._destroy.call(this);
			this.flyoutpane && this.flyoutpane.remove();
			this.input.removeData("request.count.suggest");
			this.input.removeData("flyout.request.count.suggest")
		},
		shift_enter: function() {
			if (this.options.suggest_new) {
				this.suggest_new();
				this.hide_all()
			}
		},
		hide_all: function() {
			this.pane.hide();
			this.flyoutpane && this.flyoutpane.hide();
			this.input.trigger("fb-pane-hide", this);
			this.input.trigger("fb-flyoutpane-hide", this)
		},
		request: function(a, b) {
			var d = this,
				g = this.options,
				e = a,
				f = g.ac_param.filter || [],
				h = null;
			if (c.type(f) === "string") f = [f];
			f = f.slice();
			if (g.advanced) {
				var i = c.suggest.parse_input(e);
				e = i[0];
				i[1].length && f.push("(all " + i[1].join(" ") + ")");
				h = i[2];
				if (c.suggest.check_mql_id(e)) {
					f.push('(all mid:"' + e + '")');
					e = ""
				}
			}
			i = {};
			i[g.query_param_name] = e;
			if (b) i.cursor = b;
			c.extend(i, g.ac_param, h);
			if (f.length) i.filter = f;
			var k = g.service_url + g.service_path + "?" + c.param(i, true);
			if (e = c.suggest.cache[k]) this.response(e, b ? b : -1, true);
			else {
				clearTimeout(this.request.timeout);
				var n = {
					url: g.service_url + g.service_path,
					data: i,
					traditional: true,
					beforeSend: function() {
						var l = d.input.data("request.count.suggest") || 0;
						l || d.trackEvent(d.name, "start_session");
						l += 1;
						d.trackEvent(d.name, "request", "count", l);
						d.input.data("request.count.suggest", l)
					},
					success: function(l) {
						c.suggest.cache[k] = l;
						l.prefix = a;
						d.response(l, b ? b : -1)
					},
					error: function(l) {
						d.status_error();
						d.trackEvent(d.name, "request", "error", {
							url: this.url,
							response: l ? l.responseText : ""
						});
						d.input.trigger("fb-error", Array.prototype.slice.call(arguments))
					},
					complete: function(l) {
						l && d.trackEvent(d.name, "request", "tid", l.getResponseHeader("X-Metaweb-TID"))
					},
					dataType: "jsonp",
					cache: true
				};
				this.request.timeout = setTimeout(function() {
					c.ajax(n)
				}, g.xhr_delay)
			}
		},
		create_item: function(a, b) {
			var d = this.options.css,
				g = c("<li>").addClass(d.item),
				e = c("<label>").append(c.suggest.strongify(a.name || a.id, b.prefix)),
				f = c("<div>").addClass(d.item_name).append(e);
			a.under && c(":first", e).append(c("<small>").text(" (" + a.under + ")"));
			g.append(f);
			e = a.notable;
			d = c("<div>").addClass(d.item_type);
			if (e && e.name) d.text(e.name);
			else this.options.show_id && a.id && d.text(a.id);
			f.prepend(d);
			return g
		},
		mouseover_item_hook: function(a) {
			a = a.data("data.suggest");
			this.options.flyout && a && this.flyout_request(a)
		},
		check_response: function(a) {
			return a.prefix === this.input.val()
		},
		response_hook: function(a, b) {
			this.flyoutpane && this.flyoutpane.hide();
			b > 0 ? c(".fbs-more", this.pane).remove() : this.list.empty()
		},
		show_hook: function(a, b, d) {
			s.show_hook.apply(this, [a]);
			var g = this.options,
				e = this,
				f = this.pane,
				h = this.list,
				i = a.result,
				k = c(".fbs-more", f),
				n = c(".fbs-suggestnew", f);
			c(".fbs-status", f);
			var l = a.correction;
			if (l && l.length) {
				var j = c('<a class="fbs-spell-link" href="#">').append(l[0]).bind("click.suggest", function(m) {
					m.preventDefault();
					m.stopPropagation();
					e.input.val(l[0]).trigger("textchange")
				});
				e.status.empty().append("Search instead for ").append(j).show()
			}
			var nid = i[0].notable.id;
			var islocation = i.indexOf("location") != -1;
			if (i && i.length && "cursor" in a) {
				if(islocation == true){
				k.data("cursor.suggest", a.cursor);
				k.show()
				}
			} else k.remove();
			if (g.suggest_new) {
				if (!n.length) {
					a = c('<button class="fbs-suggestnew-button">');
					a.text(g.suggest_new);
					n = c('<div class="fbs-suggestnew">').append('<div class="fbs-suggestnew-description">Your item not in the list?</div>').append(a).append('<span class="fbs-suggestnew-shortcut">(Shift+Enter)</span>').bind("click.suggest", function(m) {
						m.stopPropagation();
						e.suggest_new(m)
					});
					f.append(n)
				}
				n.show()
			} else n.remove();
			if (d && d.length && b > 0) {
				b = d.prevAll().length * d.outerHeight();
				h.scrollTop();
				h.animate({
					scrollTop: b
				}, "slow", function() {
					d.trigger("mouseover.suggest")
				})
			}
		},
		suggest_new: function() {
			var a = this.input.val();
			if (a !== "") {
				this.input.data("data.suggest", a).trigger("fb-select-new", a);
				this.trackEvent(this.name, "fb-select-new", "index", "new");
				this.hide_all()
			}
		},
		more: function(a) {
			if (a) {
				var b = this.input.data("original.suggest");
				b !== null && this.input.val(b);
				this.request(this.input.val(), a);
				this.trackEvent(this.name, "more", "cursor", a)
			}
			return false
		},
		flyout_request: function(a) {
			var b = this,
				d = this.options,
				g = this.flyoutpane.data("data.suggest");
			if (g && a.id === g.id) {
				if (!this.flyoutpane.is(":visible")) {
					this.flyout_position(this.get_selected());
					this.flyoutpane.show();
					this.input.trigger("fb-flyoutpane-show", this)
				}
			} else if ((g = c.suggest.flyout.cache[a.id]) && g.id && g.html) this.flyout_response(g);
			else {
				var e = a.id,
					f = {
						url: this.flyout_url.replace(/\$\{id\}/g, a.id),
						traditional: true,
						beforeSend: function() {
							var h = b.input.data("flyout.request.count.suggest") || 0;
							h += 1;
							b.trackEvent(b.name, "flyout.request", "count", h);
							b.input.data("flyout.request.count.suggest", h)
						},
						success: function(h) {
							h["req:id"] = e;
							h.html = c.suggest.suggest.create_flyout(h, b.flyout_image_url);
							c.suggest.flyout.cache[e] = h;
							b.flyout_response(h)
						},
						error: function(h) {
							b.trackEvent(b.name, "flyout", "error", {
								url: this.url,
								response: h ? h.responseText : ""
							})
						},
						complete: function(h) {
							h && b.trackEvent(b.name, "flyout", "tid", h.getResponseHeader("X-Metaweb-TID"))
						},
						dataType: "jsonp",
						cache: true
					};
				if (d.flyout_lang) f.data = {
					lang: d.flyout_lang
				};
				clearTimeout(this.flyout_request.timeout);
				this.flyout_request.timeout = setTimeout(function() {
					c.ajax(f)
				}, d.xhr_delay);
				this.input.trigger("fb-request-flyout", f)
			}
		},
		flyout_response: function(a) {
			var b = this.pane,
				d = this.get_selected() || [];
			if (b.is(":visible") && d.length) if ((b = d.data("data.suggest")) && a["req:id"] === b.id && a.html) {
				this.flyoutpane.html(a.html);
				this.flyout_position(d);
				this.flyoutpane.show().data("data.suggest", b);
				this.input.trigger("fb-flyoutpane-show", this)
			}
		},
		flyout_position: function(a) {
			if (!this.options.flyout_parent) {
				var b = this.pane,
					d = this.flyoutpane,
					g = this.options.css,
					e = t,
					f = {
						top: parseInt(d.css("top"), 10),
						left: parseInt(d.css("left"), 10)
					},
					h = b.offset(),
					i = b.outerWidth(),
					k = d.outerHeight(),
					n = d.outerWidth();
				if (this.options.flyout === "bottom") {
					e = h;
					i = this.input.offset();
					if (h.top < i.top) e.top -= k;
					else e.top += b.outerHeight();
					d.addClass(g.flyoutpane + "-bottom")
				} else {
					e = a.offset();
					a = a.outerHeight();
					e.left += i;
					var l = e.left + n;
					b = c(document.body).scrollLeft();
					var j = c(window).width() + b;
					e.top = e.top + a - k;
					if (e.top < h.top) e.top = h.top;
					if (l > j) {
						h = e.left - (i + n);
						if (h > b) e.left = h
					}
					d.removeClass(g.flyoutpane + "-bottom")
				}
				e.top === f.top && e.left === f.left || d.css({
					top: e.top,
					left: e.left
				})
			}
		},
		hoverout_list: function() {
			this.flyoutpane && !this.get_selected() && this.flyoutpane.hide()
		}
	});
	c.extend(c.suggest.suggest, {
		defaults: {
			// filter: null,
			filter: '(all type:/education/university)',
			spell: "always",
			exact: false,
			scoring: null,
			lang: null,
			key: null,
			prefixed: true,
			stemmed: null,
			format: null,
			advanced: true,
			show_id: true,
			query_param_name: "query",
			service_url: "https://www.googleapis.com/freebase/v1",
			service_path: "/search",
			align: null,
			flyout: true,
			flyout_service_url: null,
			flyout_service_path: "/topic${id}?filter=suggest&limit=3&key=${key}",
			flyout_image_service_url: null,
			flyout_image_service_path: "/image${id}?maxwidth=75&key=${key}",
			flyout_parent: null,
			suggest_new: null,
			nomatch: {
				title: "No suggested matches",
				heading: "Tips on getting better suggestions:",
				tips: ["Enter more or fewer characters", "Add words related to your original search", "Try alternate spellings", "Check your spelling"]
			},
			css: {
				item_type: "fbs-item-type",
				flyoutpane: "fbs-flyout-pane"
			},
			xhr_delay: 200
		},
		get_values: function(a, b) {
			var d = a.property;
			return d && d[b] && d[b].values ? d[b].values : null
		},
		get_first_value: function(a, b) {
			var d = c.suggest.suggest.get_values(a, b);
			if (d && d.length > 0) return d[0];
			return null
		},
		create_flyout: function(a, b) {
			var d = c.suggest.suggest.get_values,
				g = c.suggest.suggest.get_first_value,
				e = g(a, "/type/object/name");
			e = e ? e.text : a.id;
			var f = g(a, "/common/topic/description") || g(a, "/common/topic/article") || false;
			if (f) f = f.text;
			if (g = g(a, "/common/topic/image") || false) g = b.replace(/\$\{id\}/g, a.id);
			var h = [],
				i = [a.id],
				k = d(a, "/common/topic/notable_properties");
			k && c.each(k, function(m, p) {
				var o = d(a, p.id);
				if (o && o.length) {
					o = c.map(o, function(u) {
						return u.text
					}).join(", ");
					h.push([p.text || p.id, o])
				}
			});
			k = d(a, "/common/topic/notable_for");
			var n = d(a, "/common/topic/notable_types");
			if (k || n) {
				var l = {};
				i = [];
				c.each([k, n], function(m, p) {
					p && p.forEach(function(o) {
						if (o.id && !l[o.id]) {
							i.push(o.text);
							l[o.id] = true
						}
					})
				})
			}
			i = i.join(", ");
			var j = c('<div class="fbs-flyout-content">');
			j.append(c('<h1 id="fbs-flyout-title">').text(e));
			c.each(h, function(m, p) {
				j.append(c('<h3 class="fbs-topic-properties">').append(c("<strong>").text(p[0] + ": ")).append(document.createTextNode(p[1])))
			});
			f && j.append(c('<p class="fbs-topic-article">').text(f));
			if (g) {
				j.children().addClass("fbs-flyout-image-true");
				j.prepend(c('<img id="fbs-topic-image" class="fbs-flyout-image-true" src="' + g + '">'))
			}
			e = c('<span class="fbs-flyout-types">').append(i);
			e = c('<div class="fbs-attribution">').append(e);
			return c("<div>").append(j).append(e).html()
		}
	});
	document.createElement("input")
})(jQuery);
