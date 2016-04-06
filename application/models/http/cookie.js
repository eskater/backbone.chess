define(['underscore', 'backbone'], function (_, Backbone) {
	return Backbone.Model.extend({
        attributes: {
            http: null,
            tokens: null,
            params: null,
			newparams: null
        },
        defaults: {
            tokens: '',
            params: {},
			newparams: []
        },
        initialize: function(http, tokens) {
			this.http(http).tokens(http.request().headers.cookie);
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

				this.get('newparams').push(name);

                return this;
            }

            return params[name];
        },
        params: function(params) {
			if (params) {
				this.set('params', _.extends({}, this.get('params'), params));
				this.set('newparams', _.union( this.get('newparams'), _.keys(params)));

				return this;
			}

			return this.get('params');
		},
        tokens: function(tokens) {
			if (tokens) {
				this.set('tokens', tokens).params(_.object(_.map(tokens.split(';'), function(tokens) { return tokens.split('='); })));

				return this;
			}

			return _.map(_.pairs(this.params()), function(item) {
				return _.template('<%=key%>=<%=value%>;').call(this, {key: item[0], value: item[1]});
			}).join('');
		},
		newtokens: function() {
			return _.map(_.pairs(_.pick(this.params()), this.get('newparams')), function(item) {
				return _.template('<%=key%>=<%=value%>;').call(this, {key: item[0], value: item[1]});
			}).join('');
		}
    });
});
