define(['models/figure/behavior'], function (Behavior) {
	return Behavior.extend({
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
});
