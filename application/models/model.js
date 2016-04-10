define(['backbone', 'application'], function (Backbone, application) {
	return Backbone.Model.extend({
		construct: function() {
			if (this.fields) {
				application.db().add(this.table, this.fields);

				this.db = function() {
					return application.db().table(this.table);
				};
			}

			Backbone.prototype.construct.apply(this, arguments);
		},
		save: function() {
			console.log(arguments);

			Backbone.prototype.save.apply(this, arguments);
		},
		sync: function() {
			console.log(arguments);

			Backbone.prototype.save.apply(this, arguments);
		}
    });
});
