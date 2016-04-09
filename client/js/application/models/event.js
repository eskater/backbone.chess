define(['models/model'], function (Model) {
	return Model.extend({
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
                    return Model.prototype.get.call(this, attribute);
            }
        },
        sync: function() {
            return false;
        }
    });
});
