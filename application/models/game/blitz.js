define(['models/game'], function (Game) {
	return Game.extend({
        attributes: {
            stop: null,
            start: null,
            pause: null,
            white: null,
            black: null,
            color: null,
            interval: null
        },
        defaults: {
            stop: false,
            start: false,
            pause: false,
            white: 60 * 5,
            black: 60 * 5,
            color: 'white'
        },
        initialize: function() {
            Game.prototype.initialize.apply(this, arguments);

            this.on('stop', this.stop, this);
            this.on('timeout', this.timeout, this);
            this.on('change:color', this.interval, this);

            this.listenTo(this.chess().events(), 'pat', this.pat);
            this.listenTo(this.chess().events(), 'shah', this.shah);
            this.listenTo(this.chess().events(), 'checkmate', this.checkmate);

            this.listenTo(this.chess().board(), 'change:position', this.position);
        },
        data: function() {
			Game.prototype.data.call(this);

            return {
                stop: this.get('stop'),
                start: this.get('start'),
                pause: this.get('pause'),
                white: this.get('white'),
                black: this.get('black'),
                color: this.get('color'),
            };
        },
        parse: function(data) {
            this.set(data);

            if (data.start) {
                this.interval(this);
            }

            Game.prototype.parse.call(this);
        },
        position: function(figure) {
            if (!this.get('stop') && !this.get('pause')) {
				this.chess().players().color(figure.invert());

                this.set({start: true, color: this.chess().players().color()});
            }
        },
        pat: function(event) {
            var colors = event.get('color');

            this.trigger('stop', colors[0]);
        },
        shah: function() {

        },
        checkmate: function(event) {
            var king = event.get('king');

            this.trigger('stop', king.color());
        },
        stop: function() {
            this.set({stop: true, start: false});

            _.invoke(this.chess().board().models, 'set', {active: false});

            clearInterval(this.get('interval'));

            Game.prototype.stop.call(this);
        },
        start: function() {
            if (this.chess().ready()) {
                this.set({stop: false, pause: false, start: true});

                _.invoke(this.chess().board().models, 'set', {active: true});

                this.interval(this);

                Game.prototype.start.call(this);
            }
        },
        pause: function() {
            this.set({pause: true, start: false});

            _.invoke(this.chess().board().models, 'set', {active: false});

            clearInterval(this.get('interval'));

            Game.prototype.pause.call(this);
        },
        timeout: function() {
            this.set({stop: true, start: false});

            _.invoke(this.chess().board().models, 'set', {active: false});

            clearInterval(this.get('interval'));
        },
        time: function(color) {
            return this.get(color);
        },
        interval: function(model) {
            try {
                clearInterval(model.get('interval'));
            } catch (error) {}

            model.set('interval', setInterval(
                function() {
                    var time = model.get(model.get('color')) - 1;

                    if (time < 1) {
                        model.trigger('timeout', model.get('color'));

                        clearInterval(model.get('interval'));
                    }

                    model.set(model.get('color'), time < 0 ? 0 : time);
                }, 1000
            ));
        }
    });
});
