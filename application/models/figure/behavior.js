define(['models/model'], function (Model) {
	return Model.extend({
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
});
