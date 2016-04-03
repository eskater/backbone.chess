define(function () {
	return Backbone.Model.extend({
        initialize: function(route) {

        },
        data: function() {
            this.trigger('sent', this);
        },
        parse: function(data) {
            this.trigger('parsed', this);
        },
        stop: function() {
            this.trigger('stop', this);
        },
        start: function() {
            this.trigger('start', this);
        },
        pause: function() {
            this.trigger('pause', this);
        }
    });
});
