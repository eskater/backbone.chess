define(['backbone', 'locale', 'models/http'], function (Backbone, LOCALE, Http) {
	if (!GLOBAL._application) {
		var Application = Backbone.Model.extend({
			attributes: {
				root: null,
				language: null,
			},
			defaults: {
				root: './',
				language: 'en'
			},
			initialize: function() {
				this.set('http', new Http());
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
				this.http().start();
			},
			route: function(route) {
				if (route) {
					this.http().route(route);

					return this;
				}

				return this.http().route();
			},
			gettext: function(text) {
				var language = this.get('language');

				try {
					return typeof LOCALE[language][text] != 'undefined' ? LOCALE[language][text] : text;
				} catch(error) {
					return text;
				}
			}
		});

		GLOBAL._application = new Application();
	}

	return GLOBAL._application;
});
