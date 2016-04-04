define(['underscore', 'backbone', 'http', 'models/http/route'], function (_, Backbone, http, Route) {
	return Backbone.Model.extend({
        attributes: {
            port: null,
            route: null,
            address: null
        },
        defaults: {
            port: 80,
            address: '127.0.0.1'
        },
        initialize: function() {
            this.route(new Route({root: this.get('root')}));
        },
        route: function(route) {
            if (route) {
                this.set('route', route);

                return this;
            }

            return this.get('route');
        },
        start: function() {
            http.createServer((function(request, response) {
                this.route().handle(request, response);
            }).bind(this)).listen(_.template('<%=address%>:<%=port%>', {address: this.get('address'), port: this.get('port')}));
        }
    });
});
