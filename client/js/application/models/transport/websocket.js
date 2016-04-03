define(['models/transport'], function (Transport) {
	return Transport.extend({
        initialize: function(address) {
			this.set('transport', new WebSocket('ws://%s'.replace(/%s/, address)));

			this.transport().onopen = (function(message) {
		        this.handle({
		            _event_name: 'server',
		            _event_type: 'connect'
		        });
		    }).bind(this);

		    this.transport().onclose = (function(message) {
		        this.handle({
		            _event_name: 'server',
		            _event_type: 'disconnect'
		        });
		    }).bind(this);

		    this.transport().onmessage = (function(message) {
		        this.handle(message.data);
		    }).bind(this);

			Transport.prototype.initialize.call(this);
        },
    });
});
