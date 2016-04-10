define(['backbone', 'application'], function (Backbone, application) {
	return Backbone.Model.extend({
		construct: function() {
			if (this.fields) {
				application.db().add(this.name, this.fields);

				this.table = function() {
					return application.db().table(this.name);
				};
			}

			Backbone.prototype.construct.apply(this, arguments);
		}
    });
});
