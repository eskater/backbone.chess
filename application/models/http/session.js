define(['backbone'], function (Backbone) {
	return Backbone.Model.extend({
        attributes: {
            http: null
        },
        defaults: {

        },
        initialize: function(http) {
			this.http(http);
        },
		http: function(http) {
			if (http) {
				this.set('http', http);

				return this;
			}

			return this.get('http');
		},
    });
});
