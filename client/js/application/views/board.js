define(['backbone', 'requiretext!templates/board/white.html', 'requiretext!templates/board/black.html'], function (Backbone, White, Black) {
	return Backbone.View.extend({
        initialize: function() {
            this.setElement(this.$('.board'));

            this.listenTo(this.model.fen(), 'parsed', this.render);

            this.listenTo(this.model.board(), 'remove', this.remove);
            this.listenTo(this.model.board(), 'change:type', this.type);
            this.listenTo(this.model.board(), 'change:select', this.select);
            this.listenTo(this.model.board(), 'change:position', this.position);

            this.listenTo(this.model.events(), 'pat', this.pat);
            this.listenTo(this.model.events(), 'shah', this.shah);
            this.listenTo(this.model.events(), 'checkmate', this.checkmate);

            this.listenTo(this.model.players(), 'change:current', this.render);
        },
        pat: function(event) {

        },
        cell: function(row, col) {
            return this.$(_.template('[data-row=<%=row%>][data-col=<%=col%>]')({
                row: row,
                col: col
            }));
        },
        hide: function() {
            this.$('.board__field_waypoint').removeClass('board__field_waypoint board__field_waypoint_enemy board__field_waypoint_passant board__field_waypoint_castling');
        },
        shah: function(event) {
            this.cell(event.get('king').row(), event.get('king').col()).addClass('board__field_shah');
        },
        type: function(figure) {
            var that = this;

            setTimeout(function() {
                that.cell(figure.row(), figure.col()).find('.board__figure').attr('src', _.template('/img/figures/<%=color%>-<%=type%>.png')({
                    color: figure.color(),
                    type: figure.type()
                }));
            }, 600);
        },
        render: function() {
            var color = 'white',
                player = this.model.players().current();

            if (player) {
                color = player.color();
            }

            this.$el.html(
                _.template(color == 'white' ? White : Black)({
                    board: this.model.board()
                })
            );

            return this;
        },
        remove: function(figure) {
            this.cell(figure.row(), figure.col()).find('.board__figure:eq(0)').fadeOut(500, function() {
                jQuery(this).remove();
            });
        },
        select: function(figure) {
            var that = this;

            _.each(figure.waypoints(), function(point) {
                var field = that.cell(point[0], point[1]);

                field.addClass('board__field_waypoint');

                if (point[3].type) {
                    field.addClass('board__field_waypoint_%s'.replace(/%s/, point[3].type));
                }
            });

            this.cell(figure.row(), figure.col()).addClass('board__field_select');
        },
        position: function(figure) {
            if (!this.model.get('shah')) {
                this.$('.board__field_shah').removeClass('board__field_shah');
            }

            var previous = figure.previous();

            var current = this.cell(figure.row(), figure.col()),
                previous = this.cell(previous[0], previous[1]).find('.board__figure');

            previous.css({
                top: '%dpx'.replace(/%d/, previous.position().top),
                left: '%dpx'.replace(/%d/, previous.position().left)
            });

            previous.animate({
                top: '%dpx'.replace(/%d/, current.position().top),
                left: '%dpx'.replace(/%d/, current.position().left)
            }, 500, function() {
                previous.appendTo(current);
            });
        },
        checkmate: function(event) {
            var that = this;

            _.each(event.get('enemies').concat(event.get('insurers')), function(figure) {
                that.cell(figure.row(), figure.col()).addClass('board__field_checkmate');
            });
        },
        events: {
            'click .board__field': 'choose',
        },
        choose: function(event) {
            this.hide();

            if (this.currentField) {
                jQuery(this.currentField).removeClass('board__field_select');

                this.lastField = this.currentField;
            }

            this.currentField = event.currentTarget;

            this.row = jQuery(this.currentField).data('row');
            this.col = jQuery(this.currentField).data('col');

            if ((this.lastFigure = this.model.board().selected())) {
                this.lastFigure.set({
                    select: false
                }, {
                    silent: true
                });
            }

            if ((this.currentFigure = this.model.board().getByRowCol(this.row, this.col))) {
                if (this.currentFigure.color() == this.model.players().color()) {
                    var player = this.model.players().current();

                    if (player) {
                        if (this.currentFigure.active() && this.currentFigure.color() == player.get('color')) {
                            this.currentFigure.set({
                                select: true
                            });
                        }
                    }
                }
            }

            if (this.lastFigure && this.lastFigure.active() && !this.currentFigure) {
                this.lastFigure.move(this.row, this.col);
            }

            if (this.lastFigure && this.lastFigure.active() && this.currentFigure && this.lastFigure != this.currentFigure) {
                this.lastFigure.eat(this.currentFigure);
            }
        }
    });
});
