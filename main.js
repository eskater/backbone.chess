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
    application.http().router().push({
        url: '^/chess/$',
        get: function(params, request, response, callback) {
            requirejs(['text!templates/form.html'], function(Form) {
                callback(_.template(Form).call(this, params));
            });
        },
        post: function(params) {
            return this.get.apply(this, arguments);
        }
    }).set('root', './backbone.chess/client/');

    application.start();
});
