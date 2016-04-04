define(['backbone', 'http', 'models/http/router'], function (Backbone, http, Router) {
	return Backbone.Model.extend({
        attributes: {
            port: null,
            router: null,
            address: null
        },
        defaults: {
            port: 80,
            address: '127.0.0.1'
        },
        initialize: function() {
            this.router(new Router());
        },
        router: function(router) {
            if (router) {
                this.set('router', router);

                return this;
            }

            return this.get('router');
        },
        start: function() {
            http.createServer((function(request, response) {
				this.trigger('http.request', request);

                this.router().handle(request, response);
            }).bind(this)).listen(this.get('port'), this.get('address'));

			return this;
        }
    });
});
