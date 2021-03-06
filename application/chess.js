define(['underscore', 'models/model', 'locale', 'models/http', 'models/db/mongoose'], function (_, Model, LOCALE, Http, Mongoose) {
	if (!GLOBAL._application) {
		var Application = Model.extend({
			attributes: {
				db: null,
				root: null,
				language: null,
			},
			defaults: function() {
				return {
					db: new Mongoose(),
					root: './',
					language: 'ru'
				}
			},
			initialize: function() {
				this.set('http', new Http());
			},
	        db: function(db) {
	            if (db) {
	                this.set('db', db);

	                return this;
	            }

	            return this.get('db');
	        },
	        path: function(path) {
	            if (path == '/') {
	                return this.get('root') + this.get('index');
	            }

	            return path.match(/^\//) ? path.replace(/^\//, this.get('root')) : this.get('root') + path;
	        },
			http: function() {
				return this.get('http');
			},
			start: function() {
				this.db().start();
				this.http().start();
			},
			route: function(route) {
				if (route) {
					this.http().route(route);

					return this;
				}

				return this.http().route();
			},
			urlpath: function(path) {
				return path;
			},
			gettext: function(text) {
				var language = this.get('language');

				try {
					return typeof LOCALE[language][text] != 'undefined' ? LOCALE[language][text] : text;
				} catch(error) {
					return text;
				}
			},
			language: function(language) {
				if (language) {
					this.set('language', language);

					return this;
				}

				return this.get('language');
			}
		});

		GLOBAL._application = new Application();
	}

	return GLOBAL._application;
});
