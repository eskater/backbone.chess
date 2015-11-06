WSS = require('ws').Server;
HTTP = require('http');

DB = require('./db');
ROUTE = require('./route');

CHESS = require('./chess');
EVENT = require('./events');
	
GAMES = require('./games');
PLAYERS = require('./players');

var route = new ROUTE('client/'),
	chess = new CHESS(new EVENT(new WSS({port: 1337})));

chess.transport(
	function(transport, route){
		var type = 'blitz';
			
		var game = GAMES.instanceModel('game-%s'.replace(/%s/, type), route),
			players = PLAYERS.instanceCollection('players');
		
		players.add([{
			color: 'white'
		}, {
			color: 'black'
		}]);
		
		transport.push({
			name: 'client',
			type: 'initialize',
			handle: 
				function(data, id, client){
					transport.send('game', 'data', game.data(), client);
					transport.send('board', 'initialize', route.fen().fen(), client);
					
					var newest = false,
						player = players.findWhere({id: id});
					
					if(player){
						transport.send('player', 'returned', id);
					}else{
						player = players.findWhere({id: false});
						
						newest = true;
					}
					
					if(player){
						player.set({id: id, online: true});
					
						if(newest){
							transport.send('player', 'enter', player.toJSON());
						}
					
						transport.send('player', 'initialize', player.color(), client);
					}
					
					if(players.where({online: false}).length < 1){
						transport.send('game', 'start', game.data());
						
						if(!game.get('start')){
							game.start();
						}
					}
					
					players.findWhere({color: route.players().color()}).set('walk', true);
					
					transport.send('players', 'initialize', players.models, client);
					transport.send('history', 'initialize', route.board().history().models, client);
				}
		});
		
		transport.push({
			name: 'client',
			type: 'disconnect',
			handle: 
				function(data, id, client){
					var player = players.findWhere({id: id});
				
					if(player){
						game.pause();
					
						transport.send('game', 'pause', game.data());
						transport.send('player', 'exit', id);
						
						player.set('online', false);
					}
				}
		});

		transport.push({
			name: 'position',
			type: 'change',
			handle: 
				function(data, id, client){
					var player = players.findWhere({id: id});
				
					if(player && player.color() == route.players().color()){
						var current = route.board().getByRowCol(data.current[0], data.current[1]),
							previous = route.board().getByRowCol(data.previous[0], data.previous[1]);
					
						if(previous){
							if(current){
								previous.eat(current);
							}else{
								previous.move(data.current[0], data.current[1]);
							}
						}
					}
				}
		});
		
		route.listenTo(route.board(), 'change:position', function(figure){
			players.walk(figure.invert());
			
			transport.send('game', 'data', game.data());
			transport.send('position', 'change', {previous: figure.previous(), current: figure.position()});
		});
		
		var party = new DB.Party({board: route.fen()});
		
		route.listenTo(route.board().history(), 'pushed', function(history){
			var history = history.toJSON();
			
			history.party = party;
			
			new DB.History(history).save();
		});
		
		party.save();
	}
);

HTTP.createServer(function(request, response){
	route.handle(request, response);
}).listen(80);
