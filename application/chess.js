define(['backbone', 'locale', 'models/http'], function (Backbone, LOCALE, Http) {
	if (!GLOBAL._application) {
		var Application = Backbone.Model.extend({
			attributes: {
				root: null,
				port: null,
				http: null,
				address: null,
				language: null,
			},
			defaults: {
				root: '/',
				port: 80,
				address: '127.0.0.1',
				language: 'en'
			},
			initialize: function() {
				this.set('http', new Http({address: this.get('address'), port: this.get('port'), root: this.get('root')}));
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
