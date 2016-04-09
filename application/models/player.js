define(['models/model'], function (Model) {
	return Model.extend({
		attributes: {
            name: null,
            walk: null,
            color: null,
            online: null,
            current: null
        },
        defaults: {
            name: 'Unknown',
            walk: false,
            online: false,
            current: false
        },
        initialize: function() {

        },
        walk: function() {
            return this.get('walk');
        },
        color: function() {
            return this.get('color');
        },
		sync: function() {
			return false;
		}
    });
});
