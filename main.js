var requirejs = require('requirejs');

requirejs.config({
    config: {
        text: {
            env: 'node'
        }
    },
    paths: {
        text: '../node_modules/text/text',
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

requirejs(['jquery', 'underscore', 'backbone', 'application'], function (jQuery, _, Backbone, application) {
    application.http().router().set('root', './backbone.chess/client/').push({
        url: '^/chess/$',
        get: function(params, request, response, callback) {
            requirejs(['text!templates/form.html'], function(Form) {
                callback(Form);
            });
        },
        post: function(params, request, response, callback) {
            this.get.apply(this, arguments);
        }
    });

    application.start();
});
