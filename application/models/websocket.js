define(['backbone', 'ws'], function (Backbone, ws) {
	return Backbone.Model.extend({
		attributes: {
			port: null,
			events: null,
			websocket: null,
        },
		defaults: {
			port: 1337,
			events: [],
		},
        initialize: function() {
			var that = this;

            this.set('websocket', new ws.Server(this.get('port')));

            this.websocket().on('connection', function(client) {
                that.handle({_event_name: 'client', _event_type: 'connect'}, client);

                client.on('close', function(event) {
                    that.handle({_event_name: 'client', _event_type: 'disconnect'}, client);
                });

                client.on('message', function(event) {
                    that.handle(event, client);
                });
            });

            this.push({
                name: 'client',
                type: 'connect',
                handle: function(data, id, client) {
                    that.send('client', 'identify', false, client);
                }
            });

            this.push({
                name: 'client',
                type: 'identify',
                handle: function(identify, id, client) {
                    client._custom_id = identify;

                    that.send('client', 'identificated', false, client);
                }
            });
        },
		push: function(event) {
	        this.get('events').push(event);
	    },
		send: function(name, type, data, client) {
            var event = {
                _data: data,
                _event_name: name,
                _event_type: type
            }

            if (typeof event._data != 'string') {
                event._data = JSON.stringify(event._data);
            }

			var tokens = JSON.stringify(event);

            if (client) {
                client.send(tokens);
            } else {
				var clients = this.clients();

                for (var i in clients) {
                    clients[i].send(tokens);
                }
            }
        },
		handle: function(event, client) {
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
                    events[i].handle(event._data, client._custom_id, client);

                    break;
                }
            }
        },
		clients: function() {
	        return this.websocket().clients;
	    },
		websocket: function() {
			return this.get('websocket');
		}
    });
});
