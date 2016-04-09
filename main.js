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
    application.http().root('./client/').cookieid('_chess_id').router().push({
        url: '^/auth/$',
        name: 'auth',
        get: function(http) {
            return template.scheme('auth').title('authentication').render(http);
        }
    }).push({
        url: '^/auth/singin/$',
        post: function(http) {
            return http.forward('auth', 'get');
        }
    }).push({
        url: '^/auth/singup/$',
        post: function(http) {
            return http.forward('auth', 'get');
        }
    });

    application.start();
});
