define(['underscore', 'backbone'], function (_, Backbone) {
	return Backbone.Model.extend({
		attributes: {
            url: null,
        },
        url: function(url) {
            if (typeof url != 'undefined') {
                this.set('url', url);

                return this;
            }

            return this.get('url');
        },
        sync: function() {
            return false;
        }
    });
});
