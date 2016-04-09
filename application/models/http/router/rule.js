define(['models/model'], function (Model) {
	return Model.extend({
		attributes: {
            url: null,
			all: null,
			get: null,
			post: null,
			name: null
        },
		url: function(url) {
            if (typeof url != 'undefined') {
                this.set('url', url);

                return this;
            }

            return this.get('url');
        },
		name: function(name) {
            if (typeof name != 'undefined') {
                this.set('name', name);

                return this;
            }

            return this.get('name');
        },
		sync: function() {
			return false;
		}
    });
});
