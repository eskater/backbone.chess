define(['underscore', 'backbone'], function (_, Backbone) {
	return Backbone.Model.extend({
        attributes: {
            http: null,
            tokens: null,
            params: null
        },
        defaults: {
            tokens: ''
            params: {}
        },
        initialize: function(http, tokens) {
			this.http(http).tokens(tokens);
        },
		http: function(http) {
			if (http) {
				this.set('http', http);

				return this;
			}

			return this.get('http');
		},
        param: function(name, value) {
            var params = this.params();

            if (typeof value != 'undefined') {
                params[name] = value;

                return this;
            }

            return params[name];
        },
        params: function(params) {
			if (params) {
				this.set('params', params);

				return this;
			}

			return this.get('params');
		},
        tokens: function(tokens) {
			if (tokens) {
				this.set('tokens', tokens).params(_.object(_.map(urlpath.query.split(';'), function(tokens) { return tokens.split('='); })));

				return this;
			}

			return _.map(_.pairs(this.params()), function(item) { return _.template('<%=key%>=<%=value%>;').call(this, {key: item[0], value: item[1]}); }).join('');
		},
    });
});
