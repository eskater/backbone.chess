define(['models/model', 'models/figure/behavior/bishop', 'models/figure/behavior/king', 'models/figure/behavior/knight', 'models/figure/behavior/pawn', 'models/figure/behavior/queen', 'models/figure/behavior/rook'], function (Model, Bishop, King, Knight, Pawn, Queen, Rook) {
	return Model.extend({
		attributes: {
            row: null,
            col: null,
            type: null,
            board: null,
            moves: null,
            color: null,
            active: null,
            select: null,
            player: null,
            position: null,
            behavior: null,
            allowable: null
        },
        defaults: {
            moves: 0,
            active: false,
            select: false,
            allowable: []
        },
        initialize: function() {
            this.set({
                position: [this.row(), this.col()],
                behavior: this.instanceBehaviorByType(this.get('type')),
            });
        },
        eat: function(figure, options) {
            if (this.active() && this.behavior().eat(figure, options)) {

                return true;
            }

            return false;
        },
        row: function() {
            return this.get('row');
        },
        col: function() {
            return this.get('col');
        },
        ray: function(row, col, options) {
            return this.behavior().ray(row, col, options);
        },
        move: function(row, col, options) {
            if (this.active() && this.behavior().move(row, col, options)) {

                return true;
            }

            return false;
        },
        type: function(type) {
            if (type) {
                this.set({
                    type: type,
                    behavior: this.instanceBehaviorByType(type),
                });

                return this;
            }

            return this.get('type');
        },
        board: function() {
            return this.get('board');
        },
        color: function(color) {
            if (color) {
                this.set('color', color);

                return this;
            }

            return this.get('color');
        },
        moves: function(moves, increment) {
            if (moves) {
                this.set('moves', increment ? this.moves() + moves : moves);

                return this;
            }

            return this.get('moves');
        },
        invert: function(invert) {
            var enemy = this.color() == 'white' ? 'black' : 'white';

            if (invert) {
                this.color(enemy);

                return this;
            }

            return enemy;
        },
        active: function(active) {
            if (active) {
                this.set('active', active);

                return this;
            }

            return this.get('active');
        },
        opposed: function(figure) {
            return this.color() != figure.color();
        },
        friendly: function(figure) {
            return this.color() == figure.color();
        },
        behavior: function(behavior) {
            if (behavior) {
                this.set('behavior', this.instanceBehaviorByType(behavior));

                return this;
            }

            return this.get('behavior');
        },
        waypoint: function(row, col, options) {
            return this.behavior().waypoint(row, col, options);
        },
        previous: function() {
            var previous = this.previousAttributes();

            return [previous.row, previous.col];
        },
        waypoints: function(options) {
            return this.behavior().waypoints(options);
        },
        position: function(row, col, options) {
            if (row && col) {
                this.set({
                    row: row,
                    col: col,
                    position: [row, col]
                }, options);

                return this;
            } else {
                return this.get('position');
            }
        },
        canEat: function(figure, options) {
            return this.behavior().canEat(figure, options);
        },
        canMove: function(row, col, options) {
            return this.behavior().canMove(row, col, options);
        },
		instanceBehaviorByType: function(type) {
			var classMap = {
				bishop: Bishop,
				king: King,
				knight: Knight,
				pawn: Pawn,
				queen: Queen,
				rook: Rook,
			};

			return new classMap[type]({figure: this});
		},
        sync: function() {
            return false;
        },
    });
});
