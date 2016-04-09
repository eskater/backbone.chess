define(['models/model'], function (Model) {
	if (!GLOBAL._utils) {
		var Utils = Model.extend({
            compact: function(object) {
    			var data = {};

    			for (var i in object) {
    				if (typeof object[i] != 'undefined') {
    					data[i] = object[i];
    				}
    			}

    			return data;
    		}
		});

		GLOBAL._utils = new Utils();
	}

	return GLOBAL._utils;
});
