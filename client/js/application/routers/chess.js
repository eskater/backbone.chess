define(['models/router', 'models/fen', 'collections/board', 'collections/events', 'collections/players'], function(Router, Fen, Board, Events, Players){
	return Router.extend({
        initialize: function() {
            this.collectionBoard = new Board();
            this.collectionEvents = new Events();
            this.collectionPlayers = new Players();

            this.listenTo(this.board(), 'change:position', this.position);
            this.players().listenTo(this.board(), 'change:position', this.players().move);

            this.initializeFen();
            this.initializeEvents();
			this.initializeWebSocket();
        },
		fen: function() {
            return this.modelFen;
        },
		game: function(game) {
			if (game) {
				this.modelGame = game;

				return this;
			}

            return this.modelGame;
        },
        board: function() {
            return this.collectionBoard;
        },
        events: function() {
            return this.collectionEvents;
        },
        players: function() {
            return this.collectionPlayers;
        },
        initializeFen: function() {
            this.modelFen = new Fen({
                board: this.board(),
                players: this.players(),
                notation: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
            });
        },
        initializeEvents: function() {
            this.events().add([{
                name: 'kingdanger',
                board: this.board(),
                events: this.events(),
                handler: function(event, events) {
                    event.set({
                        enemies: [],
                        saviors: []
                    });

                    _.each(event.get('board').where({
                        type: 'king'
                    }), function(king) {
                        _.each(event.get('board').getFiguresAimByRowCol(king.row(), king.col(), {
                            overfigure: true
                        }, king.invert()), function(enemy) {
                            _.each(enemy.ray(king.row(), king.col(), {
                                overfigure: true
                            }), function(position) {
                                if (position[3].type == 'enemy') {
                                    var figure = event.get('board').getByRowCol(position[0], position[1]);

                                    if (figure.type() != 'king') {
                                        event.get('saviors').push(figure);
                                    }
                                }
                            });

                            event.get('enemies').push(enemy);
                        });
                    });

                    return event.get('enemies').length > 0;
                }
            }, {
                name: 'shah',
                board: this.board(),
                events: this.events(),
                handler: function(event, events) {
                    event.set({
                        king: null,
                        enemies: [],
                        saviors: [],
                        insurers: []
                    });

                    event.get('board').where({
                        type: 'king'
                    }).every(function(king) {
                        _.each(event.get('board').getFiguresAimByRowCol(king.row(), king.col(), false, king.invert()), function(enemy) {
                            _.each(event.get('board').getFiguresAimByRowCol(enemy.row(), enemy.col(), {
                                anyenemy: true
                            }), function(figure) {
                                if (enemy.type() != 'knight' && figure.friendly(enemy)) {
                                    event.get('insurers').push(figure);
                                } else {
                                    event.get('saviors').push(figure);
                                }
                            });

                            _.each(enemy.ray(king.row(), king.col()), function(position) {
                                _.each(event.get('board').getFiguresAimByRowCol(position[0], position[1], false, enemy.invert()), function(figure) {
                                    event.get('saviors').push(figure);
                                });
                            });

                            event.set('king', king).get('enemies').push(enemy);
                        });

                        return !event.get('king');
                    });

                    return event.get('enemies').length > 0;
                }
            }, {
                name: 'checkmate',
                board: this.board(),
                events: this.events(),
                handler: function(event, events) {
                    event.set({
                        enemies: []
                    });

                    if (events.event('shah').get('enemies').length > 0) {
                        if (events.event('shah').get('king').waypoints().length < 1) {
                            if (events.event('shah').get('saviors').length < 1) {
                                event.set({
                                    king: events.event('shah').get('king'),
                                    enemies: events.event('shah').get('enemies'),
                                    insurers: events.event('shah').get('insurers')
                                });

                                return true;
                            }
                        } else {

                            return false;
                        }
                    }
                }
            }, {
                name: 'pat',
                board: this.board(),
                events: this.events(),
                handler: function(event, events) {
                    event.set({
                        color: []
                    });

                    if (events.event('shah').get('enemies').length < 1) {
                        var pat = {
                            white: true,
                            black: true
                        };

                        for (var color in pat) {
                            event.get('board').where({
                                color: color
                            }).every(function(figure) {
                                if (figure.waypoints().length > 0) {
                                    pat[color] = false
                                }

                                return pat[color];
                            });
                        }

                        for (var color in pat) {
                            if (pat[color]) {
                                event.get('color').push(color);
                            }
                        }
                    }

                    return event.get('color').length > 0;
                }
            }]);

            this.listenTo(this.events(), 'pat', this.pat);
            this.listenTo(this.events(), 'shah', this.shah);
            this.listenTo(this.events(), 'checkmate', this.checkmate);
            this.listenTo(this.events(), 'kingdanger', this.kingdanger);

            this.events().check();

            this.events().listenTo(this.board(), 'change:position', this.events().check);
        },
		initializeWebSocket: function() {

		},
        pat: function(event) {
            _.invoke(event.get('board').models, 'set', {
                active: false
            });

            this.setpat = true;
        },
        shah: function(event) {
            var allowable = [];

            _.each(event.get('enemies'), function(figure) {
                _.each(figure.ray(event.get('king').row(), event.get('king').col()), function(position) {
                    allowable.push(position);
                });

                allowable.push(figure.position());
            });

            _.invoke(event.get('board').filter(function(figure) {
                return figure.type() != 'king' && event.get('king').friendly(figure);
            }), 'set', {
                allowable: allowable
            });

            this.setshah = true;
        },
        checkmate: function(event) {
            _.invoke(event.get('board').models, 'set', {
                active: false
            });

            this.setcheckmate = true;
        },
        position: function(figure) {
            if (this.setshah || this.kingdanger) {
                _.invoke(figure.board().models, 'set', {
                    allowable: []
                });

                this.setshah = this.kingdanger = false;
            }
        },
        kingdanger: function(event) {
            _.each(event.get('saviors'), function(savior) {
                var allowable = [];

                _.each(event.get('enemies'), function(enemy) {
                    _.each(enemy.ray(savior.row(), savior.col(), {
                        overfigure: true
                    }), function(position) {
                        allowable.push(position);
                    });

                    allowable.push(enemy.position());
                });

                savior.set('allowable', allowable);
            });

            this.kingdanger = true;
        },
        ready: function() {
            return !this.setpat && !this.setcheckmate;
        }
	});
});
