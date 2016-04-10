define(['backbone'], function (Backbone) {
	return Backbone.Model.extend({
		attributes: {
            db: null,
            port: null,
            address: null
        },
        defaults: {
            port: 3306,
            address: 'mongodb://localhost/chess'
        },
        db: function(db) {
            if (db) {
                this.set('db', db);

                return this;
            }

            return this.get('db');
        },
        add: function(data) {

        },
        start: function() {

        },
        table: function(name) {

        },
        address: function(address) {
            if (address) {
                this.set('address', address);

                return this;
            }

            return this.get('address');
        }
    });
});
