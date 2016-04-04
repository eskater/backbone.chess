define(['backbone'], function (Backbone) {
	return Backbone.View.extend({
		el: '.ajax-loader',
		initialize: function () {
			this.$el.css({
				left: '%dpx'.replace(/%d/, jQuery('body').width() / 2 - this.$el.width() / 2),
				top: '%dpx'.replace(/%d/, jQuery('body').height() / 2 - this.$el.height() / 2),
			});
		},
		show: function () {
			this.$el.show();
		},
		hide: function () {
			this.$el.hide();
		}
	});
});
