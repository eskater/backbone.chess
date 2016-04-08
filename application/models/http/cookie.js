define(['underscore', 'backbone', 'models/http/session', 'collections/http/item/cookies'], function (_, Backbone, Session, Cookies) {
	return Backbone.Model.extend({
        attributes: {
			http: null,
			sessid: null,
			cookies: null
        },
        defaults: function() {
			return {
				cookies: new Cookies()
	        }
		},
        initialize: function(http) {
			this.http(http).tokens(http.request().headers.cookie || '', true).generate();
        },
		id: function(id, rebuilt) {
			if (id) {
				var session = new Session();

				session.http(this.http()).id(id); this.http().session(session);

				this.set(this.cookieid(), id, false, '/', false, rebuilt).setattr('sessid', id);

				return this;
			}

			return this.getattr('sessid');
		},
		get: function(name) {
			return this.cookies().findWhere({name: name});
		},
		set: function(name, value, expires, path, domain, rebuilt) {
			if (typeof name != 'string') {
				return this.setattr.apply(this, arguments);
			}

			var data = {name: name, value: value, expires: expires, path: path, domain: domain, rebuilt: rebuilt},
				cookie = this.cookies().findWhere(_.omit(data, 'rebuilt'));

			if (!cookie) {
				this.cookies().create(data);
			}

			return this;
		},
		http: function(http) {
			if (http) {
				this.setattr('http', http);

				return this;
			}

			return this.getattr('http');
		},
        tokens: function(tokens, rebuilt) {
			if (typeof tokens != 'undefined') {
				if (tokens) {
					this.cookies().parse(tokens, rebuilt);
				}

				return this;
			}

			return this.cookies().tokens(rebuilt ? {rebuilt: false} : {});
		},
		setattr: function() {
			return Backbone.Model.prototype.set.apply(this, arguments);
		},
		getattr: function() {
			return Backbone.Model.prototype.get.apply(this, arguments);
		},
		headers: function() {
			var tokens = this.tokens(undefined, true),
				headers = {};

			if (tokens) {
				headers['Set-Cookie'] = tokens;
			}

			return headers;
		},
		cookies: function(cookies) {
			if (cookies) {
				this.setattr('cookies', cookies);

				return this;
			}

			return this.getattr('cookies');
		},
		generate: function() {
			if (this.get(this.cookieid())) {
				this.id(this.get(this.cookieid()).value(), true);
			} else {
				this.id(Math.random().toString().substr(10));
			}

			return this;
		},
		cookieid: function() {
			return this.http().cookieid();
		},
		buildheaders: function() {
			this.http().headers(this.headers());
		}
    });
});
