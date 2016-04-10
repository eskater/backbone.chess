define(['models/db', 'mongoose'], function (Db, mongoose) {
	return Db.extend({
        add: function(name, data) {
            mongoose.model(name, mongoose.Schema(data));
        },
        start: function() {
            //mongoose.connect(this.address());
        },
        table: function(name) {
            return mongoose.models[name];
        },
    });
});
