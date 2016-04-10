define(['collections/collection', 'models/figure', 'collections/history'], function (Collection, Figure, History) {
	return Collection.extend({
		model: Figure,
        initialize: function() {
            this.collectionHistory = new History();
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
});
