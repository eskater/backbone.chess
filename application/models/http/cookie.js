define(['underscore', 'backbone'], function (_, Backbone) {
	return Backbone.Model.extend({
        attributes: {
			data: null,
			http: null,
			isnew: null,
            tokens: null,
			newdata: null,
        },
        defaults: {
            data: {},
			isnew: false,
            tokens: '',
			newdata: [],
        },
        initialize: function(http) {
			this.http(http).tokens(http.request().headers.cookie || '').generate();
        },
		id: function(id) {
			if (id) {
				this.setattr('id', id);

				if (this.get(this.cookieid()) != id) {
					this.set(this.cookieid(), id);
				}

				return this;
			}

			return this.getattr('id');
		},
		get: function(name) {
			var data = this.data();

			return data[name];
		},
		set: function(name, value) {
			if (typeof name == 'object') {
				return this.setattr.apply(this, arguments);
			}

			var data = this.data();

			data[name] = value;

			if (this.getattr('newdata').indexOf(name) < 0) {
				this.getattr('newdata').push(name);
			}

			return this;
		},
        data: function(data) {
			if (data) {
				this.setattr('data', _.extend({}, this.getattr('data'), data));

				this.setattr('newdata', _.union(this.getattr('newdata'), _.keys(data)));

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
        tokens: function(tokens) {
			if (typeof tokens != 'undefined') {
				if (tokens) {
					this.setattr('tokens', tokens).data(_.object(_.map(tokens.trim().split(';'), function(tokens) { return tokens.trim().split('='); })));
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
			var tokens = this.newtokens();

			if (tokens) {
				this.http().header('Set-Cookie', tokens);
			}
		},
		generate: function() {
			if (this.get(this.cookieid())) {
				this.id(this.get(this.cookieid()));
			} else {
				this.id(Math.random().toString().substr(10)).isnew(true);
			}

			return this;
		},
		cookieid: function() {
			return this.http().cookieid();
		},
		newtokens: function() {
			if (this.getattr('newdata')) {
				return _.map(_.pairs(_.pick.apply(this, _.union([this.data(), this.getattr('newdata')]))), function(item) {
					return _.template('<%=key%>=<%=value%>;').call(this, {key: item[0], value: item[1]});
				}).join('');
			}

			return '';
		},
    });
});
