define(['underscore', 'backbone'], function (_, Backbone) {
	return Backbone.Model.extend({
		attributes: {
            path: null,
            name: null,
            value: null,
			secure: null,
            domain: null,
            expires: null,
            rebuilt: null
        },
        defaults: function() {
            return {
                path: '/',
                rebuilt: false
            }
        },
        data: function() {
            var data = {};

            data[this.name()] = this.value();
            data['path'] = this.path();
            data['domain'] = this.domain();
            data['expires'] = this.expires();

            return data;
        },
        name: function(name) {
            if (typeof name != 'undefined') {
                this.set('name', name);

                return this;
            }

            return this.get('name');
        },
        path: function(path) {
            if (typeof path != 'undefined') {
                this.set('path', path);

                return this;
            }

            return this.get('path');
        },
        value: function(value) {
            if (typeof value != 'undefined') {
                this.set('value', value);

                return this;
            }

            return this.get('value');
        },
        parse: function(tokens, rebuilt) {
            this.set(_.extend({}, _.object(_.map(tokens.trim().split(';'), (function(tokens) {
                var item = tokens.trim().split('=');

                if (_.keys(this.attributes).indexOf(item[0]) > -1) {
                    return item;
                }

                this.name(item[0]).value(item[1]);

                return false;
            }).bind(this))), {rebuilt: rebuilt}));
        },
        tokens: function() {
            return _.compact(_.map(_.pairs(this.data()), function(item) {
                if (item[1]) {
                    return _.template('<%=key%>=<%=value%>').call(this, {key: item[0], value: item[1]});
                }

                return false;
            })).join(';');
        },
        secure: function(secure) {
            if (typeof secure != 'undefined') {
                this.set('secure', secure);

                return this;
            }

            return this.get('secure');
        },
        domain: function(domain) {
            if (typeof domain != 'undefined') {
                this.set('domain', domain);

                return this;
            }

            return this.get('domain');
        },
        expires: function(expires) {
            if (typeof expires != 'undefined') {
                this.set('expires', expires);

                return this;
            }

            return this.get('expires');
        },
        rebuilt: function(rebuilt) {
            if (typeof rebuilt != 'undefined') {
                this.set('rebuilt', rebuilt);

                return this;
            }

            return this.get('rebuilt');
        },
        sync: function() {
            return false;
        }
    });
});
