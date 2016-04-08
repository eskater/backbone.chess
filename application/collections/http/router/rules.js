define(['backbone', 'models/http/router/rule'], function (_, Backbone, Rule) {
	return Backbone.Collection.extend({
		model: Rule
    });
});
