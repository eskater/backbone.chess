define(['backbone'], function (Backbone) {
	return Backbone.View.extend({
		el: '.messenger',
		timeout: null,
		centralize: function () {
			this.$el.css({
				left: '%dpx'.replace(/%d/, jQuery('body').width() / 2 - this.$el.width() / 2),
				top: '%dpx'.replace(/%d/, jQuery('body').height() / 2 - this.$el.height() / 2),
			});
		},
		show: function (text, timeout) {
			this.$el.html(text);

			this.centralize();

			this.$el.fadeIn(100);

			if(this.timeout){
				clearTimeout(this.timeout);
			}

			this.timeout = setTimeout(this.hide.bind(this), timeout || 3000);
		},
		hide: function () {
			this.$el.fadeOut(100);
		},
		events: {
			'click': 'hide'
		}
	});
});
