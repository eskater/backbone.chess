requirejs.config({
    paths: {
		/** lib */
		jquery: 'vendor/jquery',
		backbone: 'vendor/backbone',
        bootstrap: 'vendor/bootstrap',
		underscore: 'vendor/underscore',
		requiretext: 'vendor/requiretext',
		/** user */
		views: 'application/views',
		models: 'application/models',
		locale: 'application/locale',
		routers: 'application/routers',
		templates: 'application/templates',
		collections: 'application/collections',
		application: 'application/chess'
    },
	shim: {
		backbone: {
			deps: ['jquery', 'underscore'],
            exports: 'Backbone'
		},
        bootstrap: {
			deps: ['jquery'],
            exports: 'Bootstrap'
		},
        underscore: {
            exports: '_'
        }
	}
});

requirejs(['jquery', 'underscore', 'backbone', 'bootstrap'], function (jQuery, _, Backbone, Bootstrap) {
    application = null;

    jQuery('document').ready(function(){
        var language = document.documentElement.lang;

        require(['application'], function (application) {
            application.set({root: '/', request: '/', language: language}).start();
        });
    });
});
