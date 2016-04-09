define(['underscore', 'models/model', 'collections/http/item/sessions', 'fs', 'models/utils'], function (_, Model, Sessions, fs, utils) {
	return Model.extend({
		idAttribute: 'sessid',
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
		get: function(name) {
			return this.sessions().findWhere({name: name});
		},
		set: function(name, value, expires, path, domain, secure, rebuilt) {
			if (typeof name != 'string') {
				return this.setattr.apply(this, arguments);
			}

			var data = utils.compact({name: name, value: value, expires: expires, path: path, domain: domain, secure: secure, rebuilt: rebuilt}),
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
					fs.writeFileSync(this.path('%s.dat'.replace(/%s/, this.sessid())), this.tokens());
				} catch (error) { }
			}

			return this;
		},
		sessid: function(sessid) {
			if (sessid) {
				this.setattr('sessid', sessid).initializedata();

				return this;
			}

			return this.getattr('sessid');
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
			return Model.prototype.set.apply(this, arguments);
		},
		getattr: function() {
			return Model.prototype.get.apply(this, arguments);
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
				this.tokens(fs.readFileSync(this.path('%s.dat'.replace(/%s/, this.sessid()))).toString(), true);
			} catch (error) { }
		},
		sync: function() {
			return false;
		}
    });
});
