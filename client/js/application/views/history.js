define(['backbone', 'requiretext!templates/history.html', 'requiretext!templates/history/item.html'], function (Backbone, History, Item) {
	return Backbone.View.extend({
        initialize: function(attributes, arguments) {
			this.board = arguments.board;

			this.setElement(this.$('.history'));

            this.history = this.model.board().history();

            this.listenTo(this.history, 'reset', this.render);
            this.listenTo(this.history, 'pushed', this.pushed);
        },
        render: function() {
            this.$el.html(
                _.template(History)({
                    player: this.model.players().findWhere({current: true}),
                    history: this.history.models.reverse()
                })
            );

            return this;
        },
        pushed: function(history) {
            this.$el.prepend(
                jQuery(
                    _.template(Item)({
                        player: this.model.players().findWhere({current: true}),
                        history: history
                    })
                ).slideDown(300)
            );

            this.show(false, history.cid);
        },
        events: {
            'click .history__row': 'detail',
            'mouseover .history__row': 'show',
            'mouseout .history__row': 'hideHistory',
        },
        show: function(event, cid) {
            this.hideHistory();

            var row = this.history.get({
                cid: cid ? cid : jQuery(event.currentTarget).data('cid')
            });

            var previous = row.get('previous'),
                current = row.get('current');

            if (previous.length > 0) {
                this.board.cell(previous[0], previous[1]).addClass('board__field-history board__field-history_previous');
                this.board.cell(current[0], current[1]).addClass('board__field-history board__field-history_current');
            }
        },
        detail: function(event) {
            this.hideHistory();

            var that = this,
                row = this.history.get({cid: jQuery(event.currentTarget).data('cid')});

            var previous = null,
                current = null;

            var way = 1,
                delay = 1;

            _.each(this.history.where({
                fid: row.get('fid')
            }), function(history) {
                setTimeout(function() {
                    previous = history.get('previous');
                    current = history.get('current');

                    if (previous.length > 0) {
                        var field = that.board.cell(previous[0], previous[1]);

                        if (field) {
                            if (field.hasClass('board__field-history')) {
                                field.find('.board__history-move').html(way);
                            } else {
                                field.addClass('board__field-history').prepend(
                                    this.$('<div class="board__history-move">%d</div>'.replace(/%d/, way))
                                );
                            }
                        }

                        way++;
                    }
                }, 70 * delay);

                delay++;
            });
        },
        getByCid: function(cid) {
            return this.$('[data-cid=%d]'.replace(/%d/, cid));
        },
        hideHistory: function(event) {
            this.board.$('.board__history-move').remove();
            this.board.$('.board__field-history').removeClass('board__field-history board__field-history_previous board__field-history_current');
        },
    });
});
