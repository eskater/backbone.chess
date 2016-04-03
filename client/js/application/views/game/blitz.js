define(function () {
	return Backbone.View.extend({
        initialize: function() {
            this.setElement(this.$('.players'));

            this.listenTo(this.model, 'stop', this.timeout);
            this.listenTo(this.model, 'parsed', this.render);
            this.listenTo(this.model, 'timeout', this.timeout);
            this.listenTo(this.model, 'change:white', this.white);
            this.listenTo(this.model, 'change:black', this.black);
            this.listenTo(this.model, 'change:color', this.color);

            this.render(this.model);
        },
        white: function(model) {
            if (model.time('white') < 1) {
                this.timeout('white');
            } else {
                this.player('white').find('.player__time').text(this.format('white'));
            }
        },
        black: function(model) {
            if (model.time('black') < 1) {
                this.timeout('black');
            } else {
                this.player('black').find('.player__time').text(this.format('black'));
            }
        },
        color: function(model) {
            this.$('.player__time').removeClass('player__time_current');

            this.player(model.get('color')).find('.player__time').addClass('player__time_current');
        },
        render: function(model) {
            this.white(model);
            this.black(model);

            return this;
        },
        format: function(color) {
            var time = parseFloat(
                (this.model.time(color) / 60).toFixed(2).replace(/(\d+)$/, function(seconds) {
                    var seconds = Math.round(parseInt(seconds) / 100 * 60);

                    return seconds < 10 ? '0%d'.replace(/%d/, seconds) : seconds;
                })
            );

            return time.toFixed(2).replace(/\./, ':');
        },
        stop: function(color) {
            this.player(color).find('.player__time').addClass('player__time_miss').text(this.format(color));
        },
        timeout: function(color) {
            this.player(color).find('.player__time').addClass('player__time_timeout').text(this.format(color));
        },
        player: function(color) {
            return this.$('.players__player_%s'.replace(/%s/, color));
        }
    });
});
