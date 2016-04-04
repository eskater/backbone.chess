define(['backbone', 'views/loader'], function (Backbone, Loader) {
	return Backbone.View.extend({
		initialize: function () {
			var loader = new Loader();

			jQuery(document).ajaxStart(function () {
				loader.show();
			});

			jQuery(document).ajaxStop(function () {
				loader.hide();
			});
		}
	});
});
