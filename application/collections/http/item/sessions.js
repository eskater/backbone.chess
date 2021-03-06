define(['underscore', 'collections/collection', 'models/http/item/session'], function (_, Collection, Session) {
	return Collection.extend({
		model: Session,
        parse: function(tokens, rebuilt) {
            _.map(tokens.split('\n'), (function(tokens) { this.create().parse(tokens, rebuilt); }).bind(this));

            return this;
        },
        tokens: function(params) {
            var tokens = [];

            _.each(this.where(params), function(item) {
                tokens.push(item.tokens());
            });

            return tokens.join('\n');
        }
    });
});
