define(['backbone', 'models/http/router/rule'], function (Backbone, Rule) {
	return Backbone.Collection.extend({
		model: Rule
    });
});
