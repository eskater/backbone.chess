define(['models/model'], function (Model) {
	return Model.extend({
		name: 'User',
		fields: {
            login: String,
            email: String,
			password: String
        },
		attributes: {
            login: null,
            email: null,
			password: null
        },
        initialize: function() {

        }
    });
});
