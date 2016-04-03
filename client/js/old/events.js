function WebSocketEvents(websocket) {
    var that = this;

    this.events = [];
    this.websocket = websocket;

    this.push = function(event) {
        this.events.push(event);
    }

    this.send = function(name, type, data) {
        this.websocket.send(JSON.stringify({
            _data: JSON.stringify(data),
            _event_name: name,
            _event_type: type
        }));
    }

    this.handle = function(event) {
        if (typeof event == 'string') {
            event = JSON.parse(event);
        }

        if (typeof event._data == 'string') {
            try {
                event._data = JSON.parse(event._data);
            } catch (error) {}
        }

        for (var i in this.events) {
            if (this.events[i].type == event._event_type && this.events[i].name == event._event_name) {
                this.events[i].handle(event._data);

                break;
            }
        }
    }

    this.identify = function() {
        this.id = Math.random().toString().substr(10);

        if (document.cookie.match(/client_identify/)) {
            this.id = document.cookie.replace(/.*?client_identify\=([\d\.]+).*/, '$1')
        } else {
            document.cookie = 'client_identify=%d;'.replace(/%d/, this.id);
        }

        return this.id;
    }

    this.websocket.onopen = function(message) {
        that.handle({
            _event_name: 'server',
            _event_type: 'connect'
        });
    }

    this.websocket.onclose = function(message) {
        that.handle({
            _event_name: 'server',
            _event_type: 'disconnect'
        });
    }

    this.websocket.onmessage = function(message) {
        that.handle(message.data);
    }

    this.push({
        name: 'client',
        type: 'identify',
        handle: function(data) {
            that.send('client', 'identify', that.identify());
        }
    });

    this.push({
        name: 'client',
        type: 'identificated',
        handle: function(data) {
            that.send('client', 'initialize');
        }
    });
}
