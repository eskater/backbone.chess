define(function () {
	return Backbone.View.extend({
        initialize: function() {
            this.listenTo(this.model, 'change:notation', this.notation);
        },
        notation: function(fen) {
            // document.location.hash = fen.notation();
        }
    });
});
