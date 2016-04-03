define(['models/figure/behavior'], function (Behavior) {
	return Behavior.extend({
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

            return Behavior.prototype.move.call(this, row, col, options);
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
});
