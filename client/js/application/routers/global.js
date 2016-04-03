define(function(){
	return Backbone.Router.extend({
		routes: {
			'chess/': chess
		},
		initialize: function() {
			require(['views/common'], function (Common) {
				new Common();
			});

			this.chess();
		},
		chess: function() {
			require(['routers/chess', 'models/game/blitz', 'models/transport/websocket', 'views/chess'], function (Chess, Game, Transport, View) {
				var chess = new Chess(),
					transport = new Transport('localhost:1337');

				chess.game(new Game(chess)).board().on('change:position', function(figure) {
	                chess.players().color(figure.invert());

	                transport.send('position', 'change', {previous: figure.previous(), current: figure.position()});
	            }, this);

				transport.push({
	                name: 'client',
	                type: 'initialize',
	                handle: function(data) {

	                }
	            });

	            transport.push({
	                name: 'board',
	                type: 'initialize',
	                handle: function(data) {
	                    chess.fen().notation(data);
	                }
	            });

	            transport.push({
	                name: 'history',
	                type: 'initialize',
	                handle: function(data) {
	                    _.each(data, function(history) {
	                        var item = chess.board().history().create(history);

	                        if (history.replace) {
	                            item.set('replace', history.replace);
	                        }

	                        chess.board().history().trigger('pushed', item);
	                    });

	                    chess.events().check();
	                }
	            });

	            transport.push({
	                name: 'players',
	                type: 'initialize',
	                handle: function(data) {
						chess.players().reset(data);
	                }
	            });

	            transport.push({
	                name: 'player',
	                type: 'initialize',
	                handle: function(color) {
						chess.players().findWhere({color: color}).set('current', true);
	                }
	            });

	            transport.push({
	                name: 'player',
	                type: 'enter',
	                handle: function(data) {
						chess.players().findWhere({color: data.color}).set(data);
	                }
	            });

	            transport.push({
	                name: 'player',
	                type: 'returned',
	                handle: function(id) {
	                    var player = chess.players().findWhere({id: id.toString()});

						if (player) {
							player.set('online', true);
						}
	                }
	            });

	            transport.push({
	                name: 'player',
	                type: 'exit',
	                handle: function(data) {
						var player = chess.players().findWhere({id: data.toString()});

						if (player) {
							player.set('online', false);
						}
	                }
	            });

	            transport.push({
	                name: 'game',
	                type: 'start',
	                handle: function(data) {
	                    chess.game().start();
	                }
	            });

	            transport.push({
	                name: 'game',
	                type: 'pause',
	                handle: function(data) {
	                    chess.game().pause();
	                }
	            });

	            transport.push({
	                name: 'game',
	                type: 'data',
	                handle: function(data) {
	                    chess.game().parse(data);
	                }
	            });

	            transport.push({
	                name: 'position',
	                type: 'change',
	                handle: function(data) {
	                    var current = chess.board().getByRowCol(data.current[0], data.current[1]),
	                        previous = chess.board().getByRowCol(data.previous[0], data.previous[1]);

	                    if (previous) {
	                        if (current) {
	                            previous.eat(current);
	                        } else {
	                            previous.move(data.current[0], data.current[1]);
	                        }
	                    }
	                }
	            });

				new View({model: chess});
			});
		}
	});
});
