define(['underscore', 'backbone', 'models/http/item/cookie'], function (_, Backbone, Cookie) {
	return Backbone.Collection.extend({
		model: Cookie,
        parse: function(tokens, rebuilt) {
            _.map(tokens.split(';'), (function(tokens) { this.create().parse(tokens, rebuilt); }).bind(this));

            return this;
        },
        tokens: function(params) {
            var tokens = [];

            _.each(this.where(params), function(item) {
                tokens.push(item.tokens());
            });

            return tokens;
        }
    });
});
