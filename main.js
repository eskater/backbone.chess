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
    application.http().set('root', './client/').router().push({
        url: '^/chess/$',
        get: function(params, request, response, callback) {
            return template.scheme('chess').styles([{path: '/css/normalize.css',}, {path: '/css/chess.css',}]).script({
                path: '/js/vendor/require.js',
                attributes: {
                    'data-main': '/js/main'
                }
            }).title('Chess online').render();
        }
    }).push({
        url: '^/hello/(name:\\w{4,})/(id:\\d+)/$',
        get: function(params, request, response, callback) {
            return template.scheme('hello').title('hello %s'.replace(/%s/, params.get.name)).render();
        }
    });

    application.start();
});
