var _ = require('underscore'),
	Backbone = require('backbone');

var wrapper = require('./wrapper'),
	application = new wrapper();
	
application.setModel('game', {
	attributes: {
		stop: null,
		start: null,
		pause: null,
	},
	defaults: {
		stop: false,
		start: false,
		pause: false,
	},
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
		white: null,
		black: null,
		color: null,
		interval: null
	},
	defaults: {
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
		function(){
			this.set({start: true, color: this.route.players().color()});
		},
	pat:
		function(event){
			var colors = event.get('color');
			
			this.trigger('stop', colors[0]);
		},
	shah:
		function(event){
			
		},
	checkmate:
		function(event){
			var king = event.get('king');
			
			this.trigger('stop', king.color());
		},
	stop:
		function(){
			this.set({stop: true, start: false});
			
			clearInterval(this.get('interval'));
			
			application.getModel('game').prototype.stop(this);
		},
	start:
		function(){
			if(this.route.ready()){
				this.set({pause: false, start: true});
			
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

module.exports = application;