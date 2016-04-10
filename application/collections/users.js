define(['collections/collection', 'models/user'], function (Collection, User) {
	return Collection.extend({
		model: User
    });
});
