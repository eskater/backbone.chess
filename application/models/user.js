define(['models/model'], function (Model) {
	return Model.extend({
		table: 'users',
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
		idAttribute: '_id'
        initialize: function() {

        }
    });
});
