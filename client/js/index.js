(function(dom, ws){
	var chess = new BackboneChess(new WebSocketEvents(new WebSocket('ws://%s'.replace(/%s/, ws)))), 
		application = new BackboneApplication();
	
	application.setModel('fen', {
		attributes: {
			notation: null
		},
		defaults: {
			notation: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
		},
		notation:
			function(notation){
				if(notation){
					this.set('notation', notation);
					
					return this;
				}
				
				return this.get('notation');
			}
	});
	
	application.setModel('game', {
		initialize: 
			function(route){
				
			},
		data:
			function(){
				this.trigger('sent', this);
			},
		parse:
			function(data){
				this.trigger('parsed', this);
			},
		stop:
			function(){
				this.trigger('stop', this);
			},
		start:
			function(){
				this.trigger('start', this);
			},
		pause:
			function(){
				this.trigger('pause', this);
			}
	});
	
	application.extendModel('game', 'game-blitz', {
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
		initialize: 
			function(route){
				this.route = route;
				
				this.on('stop', this.stop, this);
				this.on('timeout', this.timeout, this);
				this.on('change:color', this.interval, this);
			
				this.listenTo(route.events(), 'pat', this.pat);
				this.listenTo(route.events(), 'shah', this.shah);
				this.listenTo(route.events(), 'checkmate', this.checkmate);
				
				this.listenTo(route.board(), 'change:position', this.position);
			},
		data:
			function(){
				return {
					stop: this.get('stop'),
					start: this.get('start'),
					pause: this.get('pause'),
					white: this.get('white'),
					black: this.get('black'),
					color: this.get('color'),
				};
				
				application.getModel('game').prototype.data(this);
			},
		parse:
			function(data){
				this.set(data);
				
				if(data.start){
					this.interval(this);
				}
				
				application.getModel('game').prototype.parse(this);
			},
		position:
			function(route){
				if(!this.get('stop') && !this.get('pause')){
					this.set({start: true, color: this.route.players().color()});
				}
			},
		pat:
			function(event){
				var colors = event.get('color');
			
				this.trigger('stop', colors[0]);
			},
		shah:
			function(){
				
			},
		checkmate:
			function(event){
				var king = event.get('king');
			
				this.trigger('stop', king.color());
			},
		stop:
			function(){
				this.set({stop: true, start: false});
				
				_.invoke(this.route.board().models, 'set', {active: false});
				
				clearInterval(this.get('interval'));
				
				application.getModel('game').prototype.stop(this);
			},
		start:
			function(){
				if(this.route.ready()){
					this.set({stop: false, pause: false, start: true});
				
					_.invoke(this.route.board().models, 'set', {active: true});
					
					this.interval(this);
					
					application.getModel('game').prototype.start(this);
				}
			},
		pause:
			function(){
				this.set({pause: true, start: false});
				
				_.invoke(this.route.board().models, 'set', {active: false});
				
				clearInterval(this.get('interval'));
				
				application.getModel('game').prototype.pause(this);
			},
		timeout:
			function(){
				this.set({stop: true, start: false});
			
				_.invoke(this.route.board().models, 'set', {active: false});
				
				clearInterval(this.get('interval'));
			},
		time:
			function(color){
				return this.get(color);
			},
		interval:
			function(model){
				try{
					clearInterval(model.get('interval'));
				}catch(error){}
				
				model.set('interval', setInterval(
					function(){
						var time = model.get(model.get('color')) - 1;
						
						if(time < 1){
							model.trigger('timeout', model.get('color'));
							
							clearInterval(model.get('interval'));
						}
						
						model.set(model.get('color'), time < 0 ? 0 : time);
					}, 1000
				));
			}
	});
	
	application.setModel('player', {
		attributes: {
			id: null,
			name: null,
			walk: null,
			color: null,
			online: null,
			current: null
		},
		defaults: {
			id: false,
			name: 'Unknown',
			walk: false,
			online: false,
			current: false
		},
		initialize:
			function(){
				
			},
		color:
			function(){
				return this.get('color');
			}
	});
	
	application.setCollection('players', {
		model: application.getModel('player'),
		walk:
			function(color){
				var current = this.findWhere({walk: true});
				
				if(current){
					current.set('walk', false);
				}
				
				var player = this.findWhere({color: color});
				
				if(player){
					player.set('walk', true);
				}
			}
	});
	
	application.setView('players', {
		initialize:
			function(){
				this.setElement(this.$('.players'));
			
				this.listenTo(this.collection, 'reset', this.render)			
				this.listenTo(this.collection, 'change:name', this.name);
				this.listenTo(this.collection, 'change:walk', this.walk);
				this.listenTo(this.collection, 'change:online', this.online);
				
				this.render();
			},
		render:
			function(){
				var that = this;
				
				_.each(this.collection.models, function(player){
					if(that.player(player.color())[0]){
						that.name(player);
						that.walk(player);
						that.online(player);
					}else{
						that.$el.append(_.template(jQuery('#template-player').html())({player: player}));
					}
				});
			
				return this;
			},
		name:
			function(model){
				this.player(model.color()).find('.player__name').text(model.get('name'));
			},
		walk:
			function(model){
				var view = this.player(model.color()).find('.player__walk');
				
				if(model.get('walk')){
					view.show();
				}else{
					view.hide();
				}
			},
		online:
			function(model){
				this.player(model.color()).removeClass('players__player_online players__player_offline').addClass(
					'players__player_%s'.replace(/%s/, model.get('online') ? 'online' : 'offline')
				);
			},
		player:
			function(color){
				return this.$('.players__player_%s'.replace(/%s/, color));;
			}
	});
	
	application.setView('game-blitz', {
		initialize: 
			function(){
				this.setElement(this.$('.players'));
			
				this.listenTo(this.model, 'stop', this.timeout);
				this.listenTo(this.model, 'parsed', this.render);
				this.listenTo(this.model, 'timeout', this.timeout);
				this.listenTo(this.model, 'change:white', this.white);
				this.listenTo(this.model, 'change:black', this.black);
				this.listenTo(this.model, 'change:color', this.color);
				
				this.render(this.model);
			},
		white:
			function(model){
				if(model.time('white') < 1){
					this.timeout('white');
				}else{
					this.player('white').find('.player__time').text(this.formate('white'));
				}
			},
		black:
			function(model){
				if(model.time('black') < 1){
					this.timeout('black');
				}else{
					this.player('black').find('.player__time').text(this.formate('black'));
				}
			},
		color:
			function(model){
				this.$('.player__time').removeClass('player__time_current');
				
				this.player(model.get('color')).find('.player__time').addClass('player__time_current');
			},
		render:
			function(model){
				this.white(model);
				this.black(model);
				
				return this;
			},
		formate:
			function(color){
				var time = parseFloat(
					(this.model.time(color) / 60).toFixed(2).replace(/(\d+)$/, function(seconds){
						var seconds = Math.round(parseInt(seconds) / 100 * 60);
						
						return seconds < 10 ? '0%d'.replace(/%d/, seconds) : seconds; 
					})
				);
				
				return time.toFixed(2).replace(/\./, ':');
			},
		stop:
			function(color){
				this.player(color).find('.player__time').addClass('player__time_miss').text(this.formate(color));
			},
		timeout:
			function(color){
				this.player(color).find('.player__time').addClass('player__time_timeout').text(this.formate(color));
			},
		player:
			function(color){
				return this.$('.players__player_%s'.replace(/%s/, color));
			}
	});
	
	application.setView('fen', {
		initialize: 
			function(){
				this.listenTo(this.model, 'change:notation', this.notation);
			},
		notation:
			function(fen){
				document.location.hash = fen.notation();
			}
	});
	
	application.setView('history', {
		initialize:
			function(){
				this.setElement(this.$('.history'));
				
				this.history = this.model.board().history();
				
				this.listenTo(this.history, 'reset', this.render);
				this.listenTo(this.history, 'pushed', this.pushed);
			},
		render:
			function(){
				this.$el.html(
					_.template(jQuery('#template-history').html())({
						player: this.model.players().findWhere({current: true}),
						history: this.history.models.reverse()
					})
				);
				
				return this;
			},
		pushed:
			function(history){
				this.$el.prepend(
					jQuery(
						_.template(jQuery('#template-history-item').html())({
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
		show:
			function(event, cid){
				this.hideHistory();
				
				var row = this.history.get({cid: cid ? cid : jQuery(event.currentTarget).data('cid')});
				
				var previous = row.get('previous'),
					current = row.get('current');
					
				if(previous.length > 0){
					this.model.viewBoard.cell(previous[0], previous[1]).addClass('board__field-history board__field-history_previous');
					this.model.viewBoard.cell(current[0], current[1]).addClass('board__field-history board__field-history_current');
				}
			},
		detail:
			function(event){
				this.hideHistory();
				
				var that = this,
					row = this.history.get({cid: jQuery(event.currentTarget).data('cid')});
					
				var previous = null,
					current = null;
				
				var way = 1,
					delay = 1;
				
				_.each(this.history.where({fid: row.get('fid')}), function(history){
					setTimeout(function(){
						previous = history.get('previous');
						current = history.get('current');
						
						if(previous.length > 0){
							var field = that.model.viewBoard.cell(previous[0], previous[1]);
							
							if(field){
								if(field.hasClass('board__field-history')){
									field.find('.board__history-move').html(way);
								}else{
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
		getByCid:
			function(cid){
				return this.$('[data-cid=%d]'.replace(/%d/, cid));
			},
		hideHistory:
			function(event){
				this.model.viewBoard.$('.board__history-move').remove();
				this.model.viewBoard.$('.board__field-history').removeClass('board__field-history board__field-history_previous board__field-history_current');
			},
	});

	application.setView('board', {
		initialize:
			function(){
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
		pat:
			function(event){
				
			},
		cell:
			function(row, col){
				return this.$(_.template('[data-row=<%=row%>][data-col=<%=col%>]')({row: row, col: col}));
			},
		hide:
			function(){
				this.$('.board__field_waypoint').removeClass('board__field_waypoint board__field_waypoint_enemy board__field_waypoint_passant board__field_waypoint_castling');
			},
		shah:
			function(event){
				this.cell(event.get('king').row(), event.get('king').col()).addClass('board__field_shah');
			},
		type:
			function(figure){
				var that = this;
				
				setTimeout(function(){
					that.cell(figure.row(), figure.col()).find('.board__figure').attr('src', _.template('/img/figures/<%=color%>-<%=type%>.png')({color: figure.color(), type: figure.type()}));
				}, 600);
			},
		render:
			function(){
				var color = 'white',
					player = this.model.players().current();
					
				if(player){
					color = player.color();
				}
			
				this.$el.html(
					_.template(jQuery('#template-board-%s'.replace(/%s/, color)).html())({
						board: this.model.board()
					})
				);
				
				return this;
			},
		remove:
			function(figure){
				this.cell(figure.row(), figure.col()).find('.board__figure:eq(0)').fadeOut(500, function(){
					jQuery(this).remove();
				});
			},
		select:
			function(figure){
				var that = this;
				
				_.each(figure.waypoints(), function(point){
					var field = that.cell(point[0], point[1]);
					
					field.addClass('board__field_waypoint');
					
					if(point[3].type){
						field.addClass('board__field_waypoint_%s'.replace(/%s/, point[3].type));
					}
				});
			
				this.cell(figure.row(), figure.col()).addClass('board__field_select');
			},
		position:
			function(figure){
				if(!this.model.setshah){
					this.$('.board__field_shah').removeClass('board__field_shah');
				}
				
				var previous = figure.previous();
				
				var current = this.cell(figure.row(), figure.col()),
					previous = this.cell(previous[0], previous[1]).find('.board__figure');
					
				previous.css({top: '%dpx'.replace(/%d/, previous.position().top), left: '%dpx'.replace(/%d/, previous.position().left)});
					
				previous.animate({top: '%dpx'.replace(/%d/, current.position().top), left: '%dpx'.replace(/%d/, current.position().left)}, 500, function(){
					previous.appendTo(current);
				});
			},
		checkmate:
			function(event){
				var that = this;
				
				_.each(event.get('enemies').concat(event.get('insurers')), function(figure){
					that.cell(figure.row(), figure.col()).addClass('board__field_checkmate');
				});
			},
		events: {
			'click .board__field': 'choose',
		},
		choose:
			function(event){
				this.hide();
			
				if(this.currentField){
					jQuery(this.currentField).removeClass('board__field_select');
					
					this.lastField = this.currentField;
				}
			
				this.currentField = event.currentTarget;
				
				this.row = jQuery(this.currentField).data('row');
				this.col = jQuery(this.currentField).data('col');
				
				if((this.lastFigure = this.model.board().selected())){
					this.lastFigure.set({select: false}, {silent: true});
				}
				
				if((this.currentFigure = this.model.board().getByRowCol(this.row, this.col))){
					if(this.currentFigure.color() == this.model.players().color()){
						var player = this.model.players().current();
						
						if(player){
							if(this.currentFigure.active() && this.currentFigure.color() == player.get('color')){
								this.currentFigure.set({select: true});
							}
						}
					}
				}
				
				if(this.lastFigure && this.lastFigure.active() && !this.currentFigure){
					this.lastFigure.move(this.row, this.col);
				}
				
				if(this.lastFigure && this.lastFigure.active() && this.currentFigure && this.lastFigure != this.currentFigure){
					this.lastFigure.eat(this.currentFigure);
				}
			}
	});
	
	chess.transport(
		function(transport, route){
			var type = 'blitz';
				
			var fen = application.instanceModel('fen'),
				game = application.instanceModel('game-%s'.replace(/%s/, type), route),
				players = application.instanceCollection('players');
		
			players.add([{
				color: 'white'
			}, {
				color: 'black'
			}]);
			
			application.instanceView('players', {el: dom, collection: players});
		
			route.viewFen = application.instanceView('fen', {model: fen});
			route.viewGame = application.instanceView('game-%s'.replace(/%s/, type), {el: dom, model: game});
			route.viewBoard = application.instanceView('board', {el: dom, model: route});
			route.viewHistory = application.instanceView('history', {el: dom, model: route});
		
			transport.push({
				name: 'client',
				type: 'initialize',
				handle:
					function(data){
						
					}
			});
			
			transport.push({
				name: 'board',
				type: 'initialize',
				handle:
					function(data){
						route.fen().fen(data);
					}
			});
			
			transport.push({
				name: 'history',
				type: 'initialize',
				handle:
					function(data){
						_.each(data, function(history){
							var item = route.board().history().create(history);
							
							if(history.replace){
								item.set('replace', history.replace);
							}
							
							route.board().history().trigger('pushed', item);
						});
						
						route.events().check();
					}
			});
			
			transport.push({
				name: 'players',
				type: 'initialize',
				handle:
					function(data){
						players.reset(data);
					}
			});
			
			transport.push({
				name: 'player',
				type: 'initialize',
				handle:
					function(data){
						route.players().findWhere({color: data}).set('current', true);
					}
			});
			
			transport.push({
				name: 'player',
				type: 'enter',
				handle:
					function(data){
						players.findWhere({color: data.color}).set(data);
					}
			});
			
			transport.push({
				name: 'player',
				type: 'returned',
				handle:
					function(data){
						var player = players.findWhere({id: data.toString()});
						
						if(player){
							player.set('online', true);
						}
					}
			});
			
			transport.push({
				name: 'player',
				type: 'exit',
				handle:
					function(data){
						var player = players.findWhere({id: data.toString()});
						
						if(player){
							player.set('online', false);
						}
					}
			});
			
			transport.push({
				name: 'game',
				type: 'start',
				handle:
					function(data){
						game.start();
					}
			});
			
			transport.push({
				name: 'game',
				type: 'pause',
				handle:
					function(data){
						game.pause();
					}
			});
			
			transport.push({
				name: 'game',
				type: 'data',
				handle:
					function(data){
						game.parse(data);
					}
			});
			
			transport.push({
				name: 'position',
				type: 'change',
				handle:
					function(data){
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
			});
			
			route.listenTo(route.board(), 'change:position', function(figure){
				players.walk(figure.invert());
			
				transport.send('position', 'change', {previous: figure.previous(), current: figure.position()});
				
				fen.notation(route.fen().generate());
			});
			
		}
	);
}).call(this, '#chess', 'localhost:1337');