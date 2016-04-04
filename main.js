var requirejs = require('requirejs');

requirejs.config({
    paths: {
        views: './application/views',
		models: './application/models',
		locale: './application/locale',
		routers: './application/routers',
		templates: './application/templates',
		collections: './application/collections',
        application: './application/chess'
    },
	/*shim: {
		backbone: {
			deps: ['underscore', 'jquery'],
            exports: 'Backbone'
		},
        underscore: {
            exports: '_'
        }
	}*/
});

requirejs(['jquery', 'underscore', 'backbone', 'application'], function (jQuery, _, Backbone, application) {
    application.start();
});
