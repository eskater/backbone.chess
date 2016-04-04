define(['backbone', 'views/fen', 'views/game/blitz', 'views/board', 'views/history', 'views/players'], function (Backbone, Fen, Game, Board, History, Players) {
	return Backbone.View.extend({
		el: '#chess',
		initialize: function () {
        	this.fen = new Fen({el: this.el, model: this.model.fen()});
            this.game = new Game({el: this.el, model: this.model.game()});
            this.board = new Board({el: this.el, model: this.model});
            this.history = new History({el: this.el, model: this.model}, {board: this.board});
            this.players = new Players({el: this.el, collection: this.model.players()});
		}
	});
});
