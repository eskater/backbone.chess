define(['views/fen', 'views/game/blitz', 'views/board', 'views/history', 'views/players'], function (Fen, Game, Board, History, Players) {
	return Backbone.View.extend({
		el: '#chess',
		initialize: function () {
            this.model.viewFen = new Fen({el: this.el, model: this.model.fen()});
            this.model.viewGame = new Game({el: this.el, model: this.model.game()});
            this.model.viewBoard = new Board({el: this.el, model: this.model});
            this.model.viewHistory = new History({el: this.el, model: this.model});
            this.model.viewPlayers = new Players({el: this.el, collection: this.model.players()});
		}
	});
});
