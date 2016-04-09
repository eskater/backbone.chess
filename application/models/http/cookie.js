define(['underscore', 'models/model', 'models/http/session', 'collections/http/item/cookies'], function (_, Model, Session, Cookies) {
	return Model.extend({
		idAttribute: 'sessid',
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
		get: function(name) {
			return this.cookies().findWhere({name: name});
		},
		set: function(name, value, expires, path, domain, secure, rebuilt) {
			if (typeof name != 'string') {
				return this.setattr.apply(this, arguments);
			}

			var data = this._compact({name: name, value: value, expires: expires, path: path, domain: domain, secure: secure, rebuilt: rebuilt}),
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
		sessid: function(sessid, rebuilt) {
			if (sessid) {
				var session = new Session();

				session.http(this.http()).sessid(sessid); this.http().session(session);

				this.set(this.cookieid(), sessid, undefined, '/', undefined, undefined, rebuilt).setattr('sessid', sessid);

				return this;
			}

			return this.getattr('sessid');
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
			return Model.prototype.set.apply(this, arguments);
		},
		getattr: function() {
			return Model.prototype.get.apply(this, arguments);
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
				this.sessid(this.get(this.cookieid()).value(), true);
			} else {
				this.sessid(Math.random().toString().substr(10));
			}

			return this;
		},
		cookieid: function() {
			return this.http().cookieid();
		},
		buildheaders: function() {
			this.http().headers(this.headers());
		},
		sync: function() {
			return false;
		},
		_compact: function(object) {
			var data = {};

			for (var i in object) {
				if (typeof object != 'undefined') {
					data[i] = object[i];
				}
			}

			return data;
		}
    });
});
