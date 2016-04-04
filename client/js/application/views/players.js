define(['backbone', 'requiretext!templates/player.html'], function (Backbone, Player) {
	return Backbone.View.extend({
        initialize: function() {
            this.setElement(this.$('.players'));

            this.listenTo(this.collection, 'reset', this.render)
            this.listenTo(this.collection, 'change:name', this.name);
            this.listenTo(this.collection, 'change:walk', this.walk);
            this.listenTo(this.collection, 'change:online', this.online);

            this.render();
        },
        render: function() {
            _.each(this.collection.models, (function(player) {
                if (this.player(player.color())[0]) {
                    this.name(player);
                    this.walk(player);
                    this.online(player);
                } else {
                    this.$el.append(_.template(Player)({
                        player: player
                    }));
                }
            }).bind(this));

            return this;
        },
        name: function(model) {
            this.player(model.color()).find('.player__name').text(model.get('name'));
        },
        walk: function(model) {
            var view = this.player(model.color()).find('.player__walk');

            if (model.get('walk')) {
                view.show();
            } else {
                view.hide();
            }
        },
        online: function(model) {
            this.player(model.color()).removeClass('players__player_online players__player_offline').addClass(
                'players__player_%s'.replace(/%s/, model.get('online') ? 'online' : 'offline')
            );
        },
        player: function(color) {
            return this.$('.players__player_%s'.replace(/%s/, color));;
        }
    });
});
