define(['collections/collection', 'models/event'], function (Collection, Event) {
	return Collection.extend({
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
