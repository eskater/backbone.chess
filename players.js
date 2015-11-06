var _ = require('underscore'),
	Backbone = require('backbone');

var wrapper = require('./wrapper'),
	application = new wrapper();

application.setModel('player', {
	attributes: {
		id: null,
		name: null,
		walk: null,
		color: null,
		online: null
	},
	defaults: {
		id: false,
		name: 'Unknown',
		walk: false,
		online: false
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

module.exports = application;