define(['underscore', 'backbone', 'models/http/session'], function (_, Backbone, Session) {
	return Backbone.Model.extend({
        attributes: {
			data: null,
			http: null,
			isnew: null,
            tokens: null,
			sessid: null,
			newdata: null
        },
        defaults: {
            data: {},
			isnew: false,
            tokens: '',
			newdata: []
        },
        initialize: function(http) {
			this.http(http).tokens(http.request().headers.cookie || '', true).generate();
        },
		id: function(id) {
			if (id) {
				this.setattr('sessid', id);

				if (this.isnew()) {
					this.set(this.cookieid(), id);
				}

				this.http().session(new Session(this.http(), id));

				return this;
			}

			return this.getattr('sessid');
		},
		get: function(name) {
			var data = this.data();

			return data[name];
		},
		set: function(name, value, expires, path, domain) {
			if (typeof name == 'object') {
				return this.setattr.apply(this, arguments);
			}

			var data = this.data();

			data[name] = value;

			this.newdata([name]);

			return this;
		},
        data: function(data, full) {
			if (data) {
				this.setattr('data', _.extend({}, this.getattr('data'), data));

				if (full) {
					this.setattr('data', data);
				} else {
					this.setattr('data', _.extend({}, this.getattr('data'), data));

					this.newdata(_.keys(data));
				}

				return this;
			}

			return this.getattr('data');
		},
		http: function(http) {
			if (http) {
				this.setattr('http', http);

				return this;
			}

			return this.getattr('http');
		},
		isnew: function(isnew) {
			if (typeof isnew != 'undefined') {
				this.setattr('isnew', isnew);

				return this;
			}

			return this.getattr('isnew');
		},
        tokens: function(tokens, full) {
			if (typeof tokens != 'undefined') {
				if (tokens) {
					this.setattr('tokens', tokens).data(_.object(_.map(tokens.trim().split(';'), function(tokens) { return tokens.trim().split('='); })), full);
				}

				return this;
			}

			return _.map(_.pairs(this.data()), function(item) {
				return _.template('<%=key%>=<%=value%>;').call(this, {key: item[0], value: item[1]});
			}).join('');
		},
		setattr: function() {
			return Backbone.Model.prototype.set.apply(this, arguments);
		},
		getattr: function() {
			return Backbone.Model.prototype.get.apply(this, arguments);
		},
		headers: function() {
			var tokens = this.newtokens(),
				headers = {};

			if (tokens) {
				headers['Set-Cookie'] = tokens;
			}

			return headers;
		},
		newdata: function(newdata) {
			if (newdata) {
				this.setattr('newdata', _.union(this.getattr('newdata'), newdata));

				return this;
			}

			return this.getattr('newdata');
		},
		generate: function() {
			if (this.get(this.cookieid())) {
				this.id(this.get(this.cookieid()));
			} else {
				this.isnew(true).id(Math.random().toString().substr(10));
			}

			return this;
		},
		cookieid: function() {
			return this.http().cookieid();
		},
		newtokens: function() {
			if (this.newdata()) {
				var list = _.pairs(_.pick.apply(this, _.union([this.data(), this.newdata()])));

				return _.map(list, function(item) {
					return _.template('<%=key%>=<%=value%>').call(this, {key: item[0], value: item[1]});
				}).join(';');
			}

			return '';
		},
		buildheaders: function() {
			this.http().headers(this.headers());
		}
    });
});
