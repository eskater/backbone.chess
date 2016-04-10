define(['collections/collection', 'models/http/router/rule'], function (Collection, Rule) {
	return Collection.extend({
		model: Rule
    });
});
