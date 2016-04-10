define(['collections/collection', 'models/player'], function (Collection, Player) {
	return Collection.extend({
		model: Player,
        initialize: function() {
            this.add([{walk: true, color: 'white'}, {walk: false, color: 'black'}]);
        },
        walk: function(player) {
			if (player) {
				var current = this.findWhere({walk: true});

	            if (current && current.color() != player.color()) {
					player.set('walk', true);
					current.set('walk', false);
	            } else {
					player.set('walk', true);
				}

				return this;
			}

            return this.findWhere({walk: true});
        },
        color: function(color) {
            if (color) {
				var walk = this.walk(),
					player = null;

				if (walk && walk.color() != color) {
		            walk.set('walk', false);

		            player = this.findWhere({color: color});
				}

				if (player) {
					player.set('walk', true);
				}

                return this;
            }

            return this.walk() ? this.walk().color() : null;
        },
        current: function() {
            return this.findWhere({current: true});
        },
		getById: function(id) {
			return this.findWhere({id: id});
		},
		getByColor: function(color) {
			return this.findWhere({color: color});
		}
    });
});
