define(['underscore', 'backbone', 'fs'], function (_, Backbone, fs) {
	return Backbone.Model.extend({
        attributes: {
            http: null,
			data: null
        },
        defaults: {
			data: {}
        },
        initialize: function(id, http) {
			this.http(http).initializeData();
        },
		id: function(id) {
			if (id) {
				this.setattr('id', id);

				return this;
			}

			return this.getattr('id');
		},
		set: function(name, value) {
			if (typeof name == 'object') {
				return this.setattr.apply(this, arguments);
			}

			var data = this.getattr('data');

			data[name] = value;

			return this;
		},
		get: function(name) {
			var data = this.getattr('data');

			return data[name];
		},
		http: function(http) {
			if (http) {
				this.set('http', http);

				return this;
			}

			return this.get('http');
		},
		save: function() {

		},
		destroy: function() {

		},
		setattr: function() {
			return Backbone.Model.prototype.set.apply(this, arguments);
		},
		getattr: function() {
			return Backbone.Model.prototype.get.apply(this, arguments);
		},
		initializeData: function() {

		}
    });
});
