function BackboneChess(transport) {
    var chess = new BackboneApplication('chess');

    chess.setModel('player', {
        attributes: {
            walk: null,
            color: null,
            current: null
        },
        defaults: {
            walk: false,
            current: false
        },
        initialize: function() {

        },
        walk: function() {
            return this.get('walk');
        },
        color: function() {
            return this.get('color');
        }
    });

    chess.setModel('figure', {
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
                behavior: chess.instanceModel('behavior-%s'.replace(/%s/, this.type()), {
                    figure: this
                }),
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
                    behavior: chess.instanceModel('behavior-%s'.replace(/%s/, type), {
                        figure: this
                    })
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
                this.set('behavior', chess.instanceModel(behavior, {
                    figure: this
                }));

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
        sync: function() {
            return false;
        },
    });

    chess.setModel('behavior', {
        attributes: {
            figure: null,
            matrix: null
        },
        defaults: {
            matrix: []
        },
        initialize: function() {
            this.set('matrix', this.matrix.slice(0));
        },
        eat: function(figure, options) {
            var waypoint = this.canEat(figure, options);

            if (waypoint) {
                if (this.beforeEat(figure, waypoint, options) && this.beforeMove(figure.row(), figure.col(), waypoint, options)) {
                    this.figure().board().remove(figure);
                    this.figure().position(figure.row(), figure.col());

                    this.figure().board().history('eat', this.figure(), figure);

                    return this.afterEat(figure, waypoint, options) && this.afterMove(figure.row(), figure.col(), waypoint, options);
                }
            }

            return false;
        },
        ray: function(row, col, options) {
            options = options || {};
            options.ray = true;

            return this.getWaypoints(row, col, options);
        },
        move: function(row, col, options) {
            var waypoint = this.canMove(row, col, options);

            if (waypoint) {
                if (this.beforeMove(row, col, waypoint, options)) {
                    this.figure().moves(1, true).position(row, col);
                    this.figure().board().history('move', this.figure());

                    return this.afterMove(row, col, waypoint, options);
                }
            }

            return false;
        },
        figure: function() {
            return this.get('figure');
        },
        waypoint: function(row, col, options) {
            var waypoints = this.waypoints(options);
            for (var i in waypoints) {
                if (waypoints[i][0] == row && waypoints[i][1] == col) {
                    return waypoints[i];
                }
            }

            return false;
        },
        waypoints: function(options) {
            return this.getWaypoints(this.figure().row(), this.figure().col(), options);
        },
        condition: function(row, col, command, specific, options) {
            if (this.get(command)) {
                return false;
            }

            return this.predicate(row, col, this.figure().board().getByRowCol(row, col), command, specific, options);
        },
        predicate: function(row, col, figure, command, specific, options) {
            return true;
        },
        canEat: function(figure, options) {
            var waypoint = this.canMove(figure.row(), figure.col(), options);

            if (waypoint && this.figure().opposed(figure)) {
                return waypoint;
            }

            return false;
        },
        canMove: function(row, col, options) {
            return this.waypoint(row, col, options);
        },
        beforeEat: function(figure, waypoint, options) {
            return true;
        },
        afterEat: function(figure, waypoint, options) {
            return true;
        },
        beforeMove: function(row, col, waypoint, options) {
            return true;
        },
        afterMove: function(row, col, waypoint, options) {
            return true;
        },
        getWaypoints: function(row, col, options) {
            options = options || {};

            var begin_row = row,
                begin_col = col;

            var ray = [],
                fined = false;

            if (options.ray) {
                begin_row = this.figure().row();
                begin_col = this.figure().col();
            }

            var moves = [],
                matrix = this.get('matrix');

            for (var i in matrix) {
                var next = false;

                var overking = options.overking,
                    overfigure = options.overfigure;

                for (var k in matrix[i]) {
                    if (next) {
                        if (overking && figure.type() == 'king' && figure.opposed(this.figure())) {
                            overking = false;
                        } else if (overfigure) {
                            overfigure = false;
                        } else {
                            break;
                        }

                        next = false;
                    }

                    var vertical = matrix[i][k][0],
                        horizontal = matrix[i][k][1];

                    if (vertical == 0 && horizontal == 0) {
                        continue;
                    }

                    if (this.figure().color() == 'black') {
                        var vertical = vertical ? begin_row - vertical : begin_row + vertical;
                    } else {
                        var vertical = vertical ? begin_row + vertical : begin_row - vertical;
                    }

                    var horizontal = horizontal ? begin_col + horizontal : begin_col - horizontal;

                    if (vertical > 8 || vertical < 1 || horizontal > 8 || horizontal < 1) {
                        continue;
                    }

                    var specific = {
                        type: false
                    };

                    if (options.ray) {
                        if (row == vertical && col == horizontal) {
                            fined = true;
                        }
                    }

                    if (options.transparency) {

                    } else {
                        var figure = this.figure().board().getByRowCol(vertical, horizontal);

                        if (figure) {
                            if (options.anyenemy) {

                            } else if (this.figure().friendly(figure)) {
                                break;
                            }

                            specific.type = 'enemy';

                            next = true;
                        }
                    }

                    if (!options.noallow && this.figure().get('allowable').length > 0) {
                        var allowable = false;

                        this.figure().get('allowable').every(function(position) {
                            if (position[0] == vertical && position[1] == horizontal) {
                                allowable = true;
                            }

                            return !allowable;
                        });

                        if (!allowable) {
                            continue;
                        }
                    }

                    var valid = false;

                    var command = matrix[i][k][3],
                        predicate = matrix[i][k][2];

                    if (predicate) {
                        if (this.condition(vertical, horizontal, command, specific, options)) {
                            valid = true;
                        }
                    } else {
                        valid = true;
                    }

                    if (valid) {
                        moves.push([vertical, horizontal, command, specific]);

                        if (options.ray) {
                            ray.push([vertical, horizontal, command, specific]);
                        }
                    }
                }

                if (options.ray) {
                    if (fined) {
                        return ray;
                    }

                    ray = [];
                }
            }

            return moves;
        }
    });

    chess.extendModel('behavior', 'behavior-pawn', {
        matrix: [
            [
                [1, 0, 1, 'simple'],
                [2, 0, 1, 'forward']
            ],
            [
                [1, -1, 1, 'diagonal']
            ],
            [
                [1, 1, 1, 'diagonal']
            ],
            [
                [1, -1, 1, 'passant']
            ],
            [
                [1, 1, 1, 'passant']
            ],
        ],
        move: function(row, col, options) {
            var waypoint = this.canMove(row, col, options);

            if (waypoint && waypoint[2] == 'passant') {
                if (this.beforeMove(row, col, waypoint, options)) {
                    this.figure().moves(1, true).position(row, col);

                    return this.afterMove(row, col, waypoint, options);
                }
            }

            return chess.getModel('behavior').prototype.move.call(this, row, col, options);
        },
        predicate: function(row, col, figure, command, specific, options) {
            switch (command) {
                case 'passant':
                    var row = this.get('figure').color() == 'white' ? (row - 1) : (row + 1);

                    if (!figure && row == (this.figure().color() == 'white' ? 5 : 4)) {
                        var enemy = this.figure().board().getByRowCol(row, col);

                        if (enemy && enemy.type() == 'pawn' && enemy.opposed(this.figure())) {
                            if (enemy.moves() < 2) {
                                var history = this.figure().board().history();

                                var one = _.last(history.where({
                                        fid: enemy.cid
                                    })),
                                    two = _.last(history.where({
                                        fid: this.figure().cid
                                    }));

                                if (one && two && one.cid > two.cid) {
                                    specific.type = 'passant';

                                    return true;
                                }

                            }
                        }
                    }

                    return false;
                case 'diagonal':
                    if (options.nocondition) {
                        return true;
                    }

                    if (figure) {
                        if (figure.opposed(this.figure())) {
                            specific.type = 'enemy';

                            return true;
                        }
                    }

                    return false;
                case 'forward':
                    if ([2, 7].indexOf(this.figure().row()) < 0) {
                        this.set('forward', true);

                        return false;
                    }
                case 'simple':
                    return typeof figure == 'undefined';
            }
        },
        beforeMove: function(row, col, waypoint, options) {
            if (this.figure().moves() < 1) {
                this.set('forward', true);
            }

            return true;
        },
        afterMove: function(row, col, waypoint, options) {
            switch (waypoint[2]) {
                case 'passant':
                    var enemy_row = this.figure().color() == 'white' ? (waypoint[0] - 1) : (waypoint[0] + 1),
                        enemy_pawn = this.figure().board().getByRowCol(enemy_row, waypoint[1]);

                    this.figure().board().remove(enemy_pawn);
                    this.figure().board().history('eat', this.figure(), enemy_pawn);

                    break;
            }

            if (row > 7 || row < 2) {
                this.figure().type('queen');
            }

            return true;
        }
    });

    chess.extendModel('behavior', 'behavior-rook', {
        matrix: [
            [
                [0, 1],
                [0, 2],
                [0, 3],
                [0, 4],
                [0, 5],
                [0, 6],
                [0, 7],
                [0, 8]
            ],
            [
                [0, -1],
                [0, -2],
                [0, -3],
                [0, -4],
                [0, -5],
                [0, -6],
                [0, -7],
                [0, -8]
            ],
            [
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
                [5, 0],
                [6, 0],
                [7, 0],
                [8, 0]
            ],
            [
                [-1, 0],
                [-2, 0],
                [-3, 0],
                [-4, 0],
                [-5, 0],
                [-6, 0],
                [-7, 0],
                [-8, 0]
            ]
        ]
    });

    chess.extendModel('behavior', 'behavior-queen', {
        matrix: [
            [
                [0, 1],
                [0, 2],
                [0, 3],
                [0, 4],
                [0, 5],
                [0, 6],
                [0, 7],
                [0, 8]
            ],
            [
                [0, -1],
                [0, -2],
                [0, -3],
                [0, -4],
                [0, -5],
                [0, -6],
                [0, -7],
                [0, -8]
            ],
            [
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
                [5, 0],
                [6, 0],
                [7, 0],
                [8, 0]
            ],
            [
                [-1, 0],
                [-2, 0],
                [-3, 0],
                [-4, 0],
                [-5, 0],
                [-6, 0],
                [-7, 0],
                [-8, 0]
            ],
            [
                [1, 1],
                [2, 2],
                [3, 3],
                [4, 4],
                [5, 5],
                [6, 6],
                [7, 7],
                [8, 8]
            ],
            [
                [-1, -1],
                [-2, -2],
                [-3, -3],
                [-4, -4],
                [-5, -5],
                [-6, -6],
                [-7, -7],
                [-8, -8]
            ],
            [
                [-1, 1],
                [-2, 2],
                [-3, 3],
                [-4, 4],
                [-5, 5],
                [-6, 6],
                [-7, 7],
                [-8, 8]
            ],
            [
                [1, -1],
                [2, -2],
                [3, -3],
                [4, -4],
                [5, -5],
                [6, -6],
                [7, -7],
                [8, -8]
            ],
        ]
    });

    chess.extendModel('behavior', 'behavior-bishop', {
        matrix: [
            [
                [1, 1],
                [2, 2],
                [3, 3],
                [4, 4],
                [5, 5],
                [6, 6],
                [7, 7],
                [8, 8]
            ],
            [
                [-1, -1],
                [-2, -2],
                [-3, -3],
                [-4, -4],
                [-5, -5],
                [-6, -6],
                [-7, -7],
                [-8, -8]
            ],
            [
                [-1, 1],
                [-2, 2],
                [-3, 3],
                [-4, 4],
                [-5, 5],
                [-6, 6],
                [-7, 7],
                [-8, 8]
            ],
            [
                [1, -1],
                [2, -2],
                [3, -3],
                [4, -4],
                [5, -5],
                [6, -6],
                [7, -7],
                [8, -8]
            ],
        ]
    });

    chess.extendModel('behavior', 'behavior-king', {
        matrix: [
            [
                [1, 1, 1, 'aimed']
            ],
            [
                [1, 0, 1, 'aimed']
            ],
            [
                [1, -1, 1, 'aimed']
            ],
            [
                [0, 1, 1, 'aimed']
            ],
            [
                [0, -1, 1, 'aimed']
            ],
            [
                [-1, 1, 1, 'aimed']
            ],
            [
                [-1, 0, 1, 'aimed']
            ],
            [
                [-1, -1, 1, 'aimed']
            ],
            [
                [0, -2, 1, 'castling-long']
            ],
            [
                [0, 2, 1, 'castling-short']
            ]
        ],
        predicate: function(row, col, figure, command, specific, options) {
            if (options.nocondition) {
                return true;
            }

            switch (command) {
                case 'aimed':
                    var clear = true;

                    this.figure().board().getFiguresAimByRowCol(row, col, {
                        noallow: true,
                        anyenemy: true,
                        overking: true,
                        nocondition: true
                    }, this.figure().invert()).every(function(enemy) {
                        switch (enemy.type()) {
                            case 'pawn':
                                var waypoint = enemy.waypoint(row, col, {
                                    anyenemy: true,
                                    nocondition: true
                                });

                                if (waypoint[2] == 'diagonal') {
                                    clear = false;
                                }

                                break;
                            default:
                                clear = false;
                        }

                        return clear;
                    });

                    return clear;
                case 'castling-short':
                    if (this.figure().moves() > 0) {
                        return false;
                    }

                    for (var col = 5; col <= 7; col++) {
                        var current = this.figure().board().getByRowCol(row, col);

                        if ((current && current.type() != 'king') ||
                            this.figure().board().getFiguresAimByRowCol(row, col, {
                                noallow: true,
                                nocondition: true
                            }, this.figure().invert()).length > 0) {

                            return false;
                        }
                    }

                    var rook = this.figure().board().getByRowCol(row, 8);
                    if (rook) {
                        if (rook.moves() < 1 && this.figure().moves() < 1) {
                            specific.type = 'castling';

                            return true;
                        }
                    }

                    break;
                case 'castling-long':
                    if (this.figure().moves() > 0) {
                        return false;
                    }

                    for (var col = 5; col >= 2; col--) {
                        var current = this.figure().board().getByRowCol(row, col);

                        if ((current && current.type() != 'king') ||
                            this.figure().board().getFiguresAimByRowCol(row, col, {
                                noallow: true,
                                nocondition: true
                            }, this.figure().invert()).length > 0) {

                            return false;
                        }
                    }

                    var rook = this.figure().board().getByRowCol(row, 1);
                    if (rook) {
                        if (rook.moves() < 1 && this.figure().moves() < 1) {
                            specific.type = 'castling';

                            return true;
                        }
                    }

                    break;
            }

            return false;
        },
        afterMove: function(row, col, waypoint, options) {
            if (this.figure().moves() < 2) {
                switch (waypoint[2]) {
                    case 'castling-long':
                        this.figure().board().getByRowCol(row, 1).position(row, 4);

                        break;
                    case 'castling-short':
                        this.figure().board().getByRowCol(row, 8).position(row, 6);

                        break;
                }

                this.set({
                    'castling-short': true,
                    'castling-long': true
                });
            }

            return true;
        },
    });

    chess.extendModel('behavior', 'behavior-knight', {
        matrix: [
            [
                [-2, -1]
            ],
            [
                [-1, -2]
            ],
            [
                [2, 1]
            ],
            [
                [1, 2]
            ],
            [
                [-2, 1]
            ],
            [
                [-1, 2]
            ],
            [
                [2, -1]
            ],
            [
                [1, -2]
            ],
        ]
    });

    chess.setModel('history', {
        attributes: {
            fid: null,
            type: null,
            date: null,
            index: null,
            color: null,
            figure: null,
            replace: null,
            current: null,
            previous: null
        },
        defaults: {
            current: [],
            previous: [],
        },
        initialize: function() {
            this.set('replace', {
                color: null,
                figure: null
            });
        },
        queen: function() {
            this.set({
                replace: {
                    color: this.get('color'),
                    figure: 'queen'
                },
                current: [],
                previous: []
            });
        },
        replace: function(replace) {
            this.set('replace', {
                color: replace.color(),
                figure: replace.type()
            });
        },
        time: function() {
            return _.template('<%=minutes%>:<%=seconds%>')({
                minutes: this.get('date').getMinutes(),
                seconds: this.get('date').getSeconds()
            });
        },
        index: function() {
            return this.get('index');
        },
        current: function() {
            if (this.get('current').length) {
                return _.template('<%=col%><%=row%>')({
                    col: String.fromCharCode(this.get('current')[1] + 64),
                    row: this.get('current')[0]
                });
            }
        },
        previous: function() {
            if (this.get('previous').length) {
                return _.template('<%=col%><%=row%>')({
                    col: String.fromCharCode(this.get('previous')[1] + 64),
                    row: this.get('previous')[0]
                });
            }
        },
        sync: function() {
            return false;
        }
    });

    chess.setModel('event', {
        attributes: {
            name: null,
            board: null,
            events: null,
            handler: null
        },
        get: function(attribute) {
            switch (attribute) {
                case 'handler':
                    return this.attributes[attribute].apply(this, [this, this.get('events')]);
                default:
                    return Backbone.Model.prototype.get.call(this, attribute);
            }
        },
        sync: function() {
            return false;
        }
    });

    chess.setModel('fen', {
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
        fen: function(notation) {
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
    });

    chess.setCollection('players', {
        model: chess.getModel('player'),
        initialize: function() {
            this.add([{
                walk: true,
                color: 'white'
            }, {

                walk: false,
                color: 'black'
            }]);
        },
        walk: function() {
            return this.findWhere({
                walk: true
            });
        },
        move: function(figure) {
            this.walk().set({
                walk: false
            }, {
                silent: true
            });

            var player = this.findWhere({
                color: figure.color() == 'white' ? 'black' : 'white'
            });
            if (player) {
                player.set({
                    walk: true
                });
            }
        },
        color: function(color) {
            if (color) {
                var walk = this.walk();
                walk.set({
                    walk: false
                }, {
                    silent: true
                });

                var player = this.findWhere({
                    color: color
                });
                if (player) {
                    player.set({
                        walk: true
                    })
                }

                return this;
            }

            return this.walk().color();
        },
        current: function() {
            return this.findWhere({
                current: true
            });
        }
    });

    chess.setCollection('events', {
        model: chess.getModel('event'),
        check: function() {
            var that = this;

            _.each(this.models, function(event) {
                if (event.get('handler')) {
                    that.trigger(event.get('name'), event);
                }
            });
        },
        event: function(name) {
            return this.findWhere({
                name: name
            });
        }
    });

    chess.setCollection('history', {
        model: chess.getModel('history'),
        initialize: function() {
            this.on('eat move queen castling', this.push, this);
        },
        push: function(type, figure, replace) {
            var last = _.last(this.models);

            var history =
                this.create({
                    fid: figure.cid,
                    type: type,
                    date: new Date(),
                    index: last ? (last.index() + 1) : 1,
                    color: figure.color(),
                    figure: figure.type(),
                    current: figure.position(),
                    previous: figure.previous()
                });

            switch (type) {
                case 'eat':
                    history.replace(replace);

                    break;
                case 'queen':
                    history.queen();

                    break;
            }

            this.trigger('pushed', history);
        }
    });

    chess.setCollection('board', {
        model: chess.getModel('figure'),
        initialize: function() {
            this.collectionHistory = chess.instanceCollection('history');
        },
        history: function(type, figure, replace) {
            if (type) {
                this.collectionHistory.trigger(type, type, figure, replace);
            }

            return this.collectionHistory;
        },
        selected: function() {
            return this.findWhere({
                select: true
            });
        },
        getByRow: function(row) {
            return this.where({
                row: row
            });
        },
        getByCol: function(col) {
            return this.where({
                col: col
            });
        },
        getByRowCol: function(row, col) {
            return this.findWhere({
                row: row,
                col: col
            });
        },
        getFiguresAimByRowCol: function(row, col, options, color, exception) {
            exception = exception || [];

            var figures = [];

            _.each((color ? this.where({
                color: color
            }) : this.models), function(figure) {
                if (exception.length > 0 && exception.indexOf(figure.type()) > -1) {
                    if (figure.canMove(row, col, options)) {
                        figures.push(figure);
                    }
                } else {
                    if (figure.canMove(row, col, options)) {
                        figures.push(figure);
                    }
                }
            });

            return figures;
        }
    });

    chess.setRoute('chess', {
        initialize: function() {
            this.transport = transport;

            this.collectionBoard = chess.instanceCollection('board');
            this.collectionEvents = chess.instanceCollection('events');
            this.collectionPlayers = chess.instanceCollection('players');

            this.listenTo(this.board(), 'change:position', this.position);
            this.players().listenTo(this.board(), 'change:position', this.players().move);

            this.initializeFen();
            this.initializeEvents();
        },
        fen: function() {
            return this.modelFen;
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
        transport: function() {
            return this.transport;
        },
        initializeFen: function() {
            this.modelFen =
                chess.instanceModel('fen', {
                    board: this.board(),
                    players: this.players(),
                    //notation: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'
                    notation: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
                        //notation: '8/8/8/8/4q1k/8/8/3K w ---- - 0 1'
                        //notation: 'rnbqkbnr/8/8/8/8/8/8/RNBQKBNR b KQkq - 0 1'
                        //notation: 'k2r/8/1b/8/8/8/3Q/P2K b ---- - 0 1'
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

    var route = chess.instanceRoute('chess');
    chess.historyStart();

    this.transport =
        function(event) {
            event.call(this, route.transport, route);
        }
}
