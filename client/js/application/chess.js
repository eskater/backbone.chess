define(['backbone', 'locale', 'views/messenger'], function (Backbone, LOCALE, Messenger) {
	if (!application) {
		var Application = Backbone.Model.extend({
			attributes: {
				root: null,
				router: null,
				request: null,
				language: null,
				messenger: null,
			},
			initialize: function () {
				this.set('messenger', new Messenger());
			},
			start: function () {
				require(['routers/global'], (function (Global) {
					this.set('router', new Global());

					Backbone.history.start({root: this.get('root'), pushState: true});
				}).bind(this));
			},
			getpath: function () {
				return location.pathname.slice(this.get('root').length).replace(/^\/*(.+?)\/*$/, '$1');
			},
			urlpath: function (path) {
				return _.template('<%=root%><%=path%>').call(this, {root: this.get('root'), path: path.replace(/^\/*(.+?)\/*$/, '$1/')});
			},
			gettext: function (text) {
				var language = this.get('language');

				try {
					return typeof LOCALE[language][text] != 'undefined' ? LOCALE[language][text] : text;
				} catch(error) {
					return text;
				}
			},
			showtext: function (text, timeout) {
				this.get('messenger').show(this.gettext(text), timeout || 3000);
			},
			truncatetext: function (text, size) {
				return text.length > size ? '%s...'.replace(/%s/, text.slice(0, size)) : text;
			},
			showerror: function (message, timeout) {
				this.get('messenger').show(this.gettext(message), timeout || 3000);
			},
			isrequesterror: function (response) {
				return _.keys(response).indexOf('error') > -1;
			},
			isrequestsuccess: function (response) {
				return _.keys(response).indexOf('error') < 0;
			}
		});

		application = new Application();
	}

	return application;
});
