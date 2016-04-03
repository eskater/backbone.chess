define(['models/player'], function (Player) {
	return Backbone.Collection.extend({
		model: Player,
        initialize: function() {
            this.add([{walk: true, color: 'white'}, {walk: false, color: 'black'}]);
        },
        walk: function(color) {
			if (color) {
				var current = this.findWhere({walk: true});

	            if (current) {
	                current.set('walk', false);
	            }

	            var player = this.findWhere({color: color});

	            if (player) {
	                player.set('walk', true);
	            }
			}

            return this.findWhere({walk: true});
        },
        move: function(figure) {
            this.walk().set('walk', false);

            var player = this.findWhere({color: figure.invert()});

            if (player) {
                player.set('walk', true);
            }
        },
        color: function(color) {
            if (color) {
                this.walk().set('walk', false);

                var player = this.findWhere({color: color});

                if (player) {
                    player.set('walk', true);
                }

                return this;
            }

            return this.walk().color();
        },
        current: function() {
            return this.findWhere({current: true});
        }
    });
});
