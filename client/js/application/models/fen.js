define(['models/model'], function (Model) {
	return Model.extend({
		dict: {
            r: 'rook',
            n: 'knight',
            b: 'bishop',
            q: 'queen',
            k: 'king',
            p: 'pawn'
        },
        count: {
            r: 4,
            n: 4,
            b: 4,
            q: 18,
            k: 2,
            p: 16
        },
        attributes: {
            board: null,
            players: null,
            notation: null
        },
        initialize: function() {
            this.on('invalid', this.invalid, this);
            this.on('change:notation', this.parse, this);

            this.parse();
        },
        parse: function() {
            if (this.isValid()) {
                this.get('board').reset();

                var parts = this.get('notation').split(' '),
                    positions = parts[0].split('/').reverse()

                for (var row = 8; row >= 1; row--) {
                    var cols = positions[row - 1].split(''),
                        space = 0;

                    for (var col = 1; col <= cols.length; col++) {
                        var token = cols[col - 1];

                        if (parseInt(token)) {
                            space += parseInt(token) - 1;
                        } else {
                            this.get('board').create({
                                row: row,
                                col: space + col,
                                type: this.dict[token.toLowerCase()],
                                board: this.get('board'),
                                color: token != token.toLowerCase() ? 'white' : 'black',
                            });
                        }
                    }
                }

                if (parts[1]) {
                    this.get('players').color(parts[1] == 'w' ? 'white' : 'black');
                }

                if (parts[2]) {
                    var castling = parts[2].split(''),
                        standart = ['K', 'Q', 'k', 'q'];

                    for (var i in standart) {
                        if (castling[i] == '-') {
                            var color = standart[i] == standart[i].toUpperCase() ? 'white' : 'black',
                                behavior = this.get('board').findWhere({
                                    type: 'king',
                                    color: color
                                }).get('behavior');

                            switch (standart[i]) {
                                case 'k':
                                    behavior.set('castling-short', true);

                                    break;
                                case 'q':
                                    behavior.set('castling-long', true);

                                    break;

                            }
                        }
                    }
                }

                this.trigger('parsed');
            }
        },
        invalid: function() {
            _.each(this.validationError, function(error) {
                console.warn(error);
            });
        },
        validate: function(attributes) {
            var errors = [];

            if (!attributes.notation) {
                return;
            }

            if (attributes.notation.match(/[^\/\drnbqkp\-w\s]/gi)) {
                errors.push('incorrect tokens');
            }

            var parts = attributes.notation.split(' ');

            if (parts.length > 6 || parts.length < 1) {
                errors.push('incorrect parts');
            }

            if (parts[0]) {
                var positions = parts[0].split('/');

                if (positions.length != 8) {
                    errors.push('incorrect positions');
                }

                var figures = {
                    white: {
                        r: 0,
                        n: 0,
                        b: 0,
                        q: 0,
                        k: 0,
                        p: 0
                    },
                    black: {
                        r: 0,
                        n: 0,
                        b: 0,
                        q: 0,
                        k: 0,
                        p: 0
                    }
                };

                _.each(positions, function(tokens) {
                    var spaces = 0;

                    _.each(tokens.split(''), function(token) {
                        if (parseInt(token)) {
                            spaces += parseInt(token);
                        } else {
                            var color = token == token.toUpperCase() ? 'white' : 'black';

                            figures[color][token.toLowerCase()] += 1;

                            spaces++;
                        }
                    });

                    if (spaces > 8) {
                        errors.push('incorrect spaces');
                    }
                });

                for (var color in figures) {
                    for (var figure in figures[color]) {
                        if (figures[color][figure] > this.count[figure] / 2) {
                            errors.push('incorrect count figures');
                        } else {
                            switch (figure) {
                                case 'k':
                                    if (figures[color][figure] < 1) {
                                        errors.push('incorrect count kings');
                                    }

                                    break;
                            }
                        }
                    }
                }
            }

            if (errors.length > 0) {
                return errors;
            }
        },
        generate: function() {
            var fen = [];

            var dict = _.invert(this.dict),
                notation = [];

            for (var row = 8; row >= 1; row--) {
                var cols = [],
                    space = 0;

                for (var col = 1; col <= 8; col++) {
                    var figure = this.get('board').getByRowCol(row, col);

                    if (figure) {
                        if (space) {
                            cols.push(space);
                        }

                        cols.push(figure.color() != 'white' ? dict[figure.type()] : dict[figure.type()].toUpperCase());

                        space = 0;
                    } else {
                        space++;
                    }
                }

                if (space) {
                    cols.push(space);
                }

                notation.push(cols.join(''))
            }

            fen.push(notation.join('/'));

            fen.push(this.get('players').color() == 'white' ? 'w' : 'b');

            var castling = [];
            _.each(this.get('board').where({
                type: 'king'
            }).reverse(), function(king) {
                var behavior = king.get('behavior');

                if (behavior.get('castling-short')) {
                    castling.push('-');
                } else {
                    castling.push(king.color() == 'white' ? 'K' : 'k');
                }

                if (behavior.get('castling-long')) {
                    castling.push('-');
                } else {
                    castling.push(king.color() == 'white' ? 'Q' : 'q');
                }
            });

            fen.push(castling.join(''));

            return fen.join(' ');
        },
		notation: function(notation) {
			if (notation) {
				this.set({
					notation: notation
				}, {
					validate: true
				});

				return this;
			}

			return this.generate();
		},
    });
});
