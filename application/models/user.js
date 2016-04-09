define(['models/model'], function (Model) {
	return Model.extend({
		attributes: {
            id: null,
            login: null,
            email: null
        },
        defaults: {

        },
        initialize: function() {

        }
    });
});
