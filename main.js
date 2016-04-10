var requirejs = require('requirejs');

requirejs.config({
    config: {
        text: {
            env: 'node'
        }
    },
    paths: {
        text: './vendor/text',
        views: './application/views',
		models: './application/models',
		locale: './application/locale',
		routers: './application/routers',
		templates: './application/templates',
		collections: './application/collections',
        application: './application/chess'
    },
	shim: {
		backbone: {
			deps: ['underscore', 'jquery'],
            exports: 'Backbone'
		},
        underscore: {
            exports: '_'
        }
	}
});

requirejs(['jquery', 'underscore', 'backbone', 'application', 'models/template'], function (jQuery, _, Backbone, application, template) {
    application.http().router().push({
        url: '^/(language:\\w+)/?',
        solid: true,
        get: function(http) {
            if (['en', 'ru'].indexOf(http.get('language')) > -1) {
                application.language(http.get('language'));
            }
        }
    }).push({
        url: '^/\\w+/auth/?$',
        name: 'auth',
        get: function(http) {
            return template.scheme('auth').title(application.gettext('template-auth-title')).render();
        }
    }).push({
        url: '^/\\w+/auth/singin/?$',
        post: function(http) {
            template.flash('danger', 'User not found').flash('warning', 'Yes! User not found');

            http.forward('auth');
        }
    }).push({
        url: '^/\\w+/auth/singup/?$',
        post: function(http) {
            http.forward('auth');
        }
    }).push({
        url: '^/\\w+/redirect/?$',
        get: function(http) {
            http.redirect('/auth/');
        }
    });

    application.start();
});
