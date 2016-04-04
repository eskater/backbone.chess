define(['backbone'], function (Backbone) {
	return Backbone.Model.extend({
		attributes: {
			id: null,
			events: null,
			transport: null,
        },
		defaults: {
			events: [],
		},
        initialize: function() {
		    this.push({
		        name: 'client',
		        type: 'identify',
		        handle: (function(data) {
		            this.send('client', 'identify', this.identify());
		        }).bind(this)
		    });

		    this.push({
		        name: 'client',
		        type: 'identificated',
		        handle: (function(data) {
		            this.send('client', 'initialize');
		        }).bind(this)
		    });
        },
		push: function(event) {
	        this.get('events').push(event);
	    },
		send: function(name, type, data) {
	        this.transport().send(this.data.apply(this, arguments));
	    },
        data: function(name, type, data) {
            return JSON.stringify({
	            _data: JSON.stringify(data),
	            _event_name: name,
	            _event_type: type
	        });
        },
		handle: function(event) {
	        if (typeof event == 'string') {
	            event = JSON.parse(event);
	        }

	        if (typeof event._data == 'string') {
	            try {
	                event._data = JSON.parse(event._data);
	            } catch (error) {}
	        }

			var events = this.get('events');

	        for (var i in events) {
	            if (events[i].type == event._event_type && events[i].name == event._event_name) {
	                events[i].handle(event._data);

	                break;
	            }
	        }
	    },
		identify: function() {
	        this.set('id', Math.random().toString().substr(10));

	        if (document.cookie.match(/client_identify/)) {
				this.set('id', document.cookie.replace(/.*?client_identify\=([\d\.]+).*/, '$1'));
	        } else {
	            document.cookie = 'client_identify=%d;'.replace(/%d/, this.id);
	        }

	        return this.get('id');
	    },
		transport: function() {
			return this.get('transport');
		}
    });
});
