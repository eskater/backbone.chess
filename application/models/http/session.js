define(['underscore', 'backbone', 'collections/http/item/sessions', 'fs'], function (_, Backbone, Sessions, fs) {
	return Backbone.Model.extend({
        attributes: {
            http: null,
			sessid: null,
			savepath: null,
			sessions: null,
        },
        defaults: function() {
			return {
				savepath: './sessions/',
				sessions: new Sessions()
	        }
		},
		id: function(id) {
			if (id) {
				this.setattr('sessid', id).initializedata();

				return this;
			}

			return this.getattr('sessid');
		},
		get: function(name) {
			return this.sessions().findWhere({name: name});
		},
		set: function(name, value, expires, path, domain, rebuilt) {
			if (typeof name != 'string') {
				return this.setattr.apply(this, arguments);
			}

			var data = {name: name, value: value, expires: expires, path: path, domain: domain, rebuilt: rebuilt},
				session = this.sessions().findWhere(_.omit(data, 'rebuilt'));

			if (!session) {
				this.sessions().create(data);
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
		path: function(path) {
			return this.getattr('savepath') + path;
		},
		save: function() {
			if (this.sessions().length > 0) {
				try {
					fs.writeFileSync(this.path('%s.dat'.replace(/%s/, this.id())), this.tokens());
				} catch (error) { }
			}

			return this;
		},
        tokens: function(tokens, rebuilt) {
			if (typeof tokens != 'undefined') {
				if (tokens) {
					this.sessions().parse(tokens, rebuilt);
				}

				return this;
			}

			return this.sessions().tokens();
		},
		destroy: function() {

		},
		setattr: function() {
			return Backbone.Model.prototype.set.apply(this, arguments);
		},
		getattr: function() {
			return Backbone.Model.prototype.get.apply(this, arguments);
		},
		headers: function() {

		},
		sessions: function(sessions) {
			if (sessions) {
				this.setattr('sessions', sessions);

				return this;
			}

			return this.getattr('sessions');
		},
		buildheaders: function() {

		},
		initializedata: function() {
			try {
				this.tokens(fs.readFileSync(this.path('%s.dat'.replace(/%s/, this.id()))).toString(), true);
			} catch (error) { }
		}
    });
});
