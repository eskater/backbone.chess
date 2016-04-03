define(function () {
	return Backbone.Model.extend({
		attributes: {
			id: null,
            name: null,
            walk: null,
            color: null,
            online: null,
            current: null
        },
        defaults: {
			id: false,
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
        }
    });
});
