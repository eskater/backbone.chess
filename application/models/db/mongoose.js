define(['models/db', 'mongoose'], function (Db, mongoose) {
	return Db.extend({
        start: function() {
            mongoose.connect(this.address());
        },
        table: function(name) {
            return mongoose.models[name];
        },
        where: function() {

        },
        create: function() {

        },
        update: function() {

        },
        delete: function() {
            
        },
        addtable: function(name, data) {
            mongoose.model(name, mongoose.Schema(data));
        },
    });
});
