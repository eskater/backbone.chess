define(['collections/collection', 'models/history'], function (Collection, History) {
	return Collection.extend({
		model: History,
        initialize: function() {
            this.on('eat move queen castling', this.push, this);
        },
        push: function(type, figure, replace) {
            var last = _.last(this.models);

            var history = this.create({
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
});
