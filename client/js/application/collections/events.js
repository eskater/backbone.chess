define(['models/event'], function (Event) {
	return Backbone.Collection.extend({
		model: Event,
        check: function() {
            _.each(this.models, (function(event) {
                if (event.get('handler')) {
                    this.trigger(event.get('name'), event);
                }
            }).bind(this));
        },
        event: function(name) {
            return this.findWhere({
                name: name
            });
        }
    });
});
