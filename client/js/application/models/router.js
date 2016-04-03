define(function () {
	return Backbone.Model.extend({
		constructor: function () {
			jQuery(window).on('hashchange', (function() {
				this.hashchange();
			}).bind(this));

			this.initialize();
			this.hashchange();
		},
		hashchange: function () {
			var hash = location.hash.slice(1);

			for (var rule in this.routes) {
				var method = this[this.routes[rule]],
					matches = hash.match(new RegExp(rule, 'i'));

				if (matches) {
					method.apply(this, matches.slice(1));
				}
			}
		}
	});
});
