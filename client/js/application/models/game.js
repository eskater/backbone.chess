define(['models/model'], function (Model) {
	return Model.extend({
		attributes: {
			chess: null
		},
        initialize: function(chess) {
			this.chess(chess);
        },
		chess: function (chess) {
			if (chess) {
				this.set('chess', chess);

				return this;
			}

			return this.get('chess');
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
