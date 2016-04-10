var mongoose = require('mongoose'),
	schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/chess');

var Party =
		schema({
			board: String
		}),
	History =
		schema({
			party: {type: schema.Types.ObjectId, ref: 'Party'},
			type: String,
			date: Date,
			index: Number,
			color: String,
			figure: String,
			replace: {
				color: String,
				figure: String
			},
			current: [Number],
			previous: [Number]
		});

mongoose.model('Party', Party);
mongoose.model('History', History);

module.exports = mongoose.models;
