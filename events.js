function WebSocketEvents(websocket){
	var that = this;
	
	this.events = [];
	this.websocket = websocket;
	
	this.push = 
		function(event){
			this.events.push(event);
		}
		
	this.send = 
		function(name, type, data, client){
			var event = {
				_data: data,
				_event_name: name,
				_event_type: type
			}
			
			if(typeof event._data != 'string'){
				event._data = JSON.stringify(event._data);
			}
			
			if(client){
				client.send(JSON.stringify(event));
			}else{
				for(var i in this.websocket.clients){
					this.websocket.clients[i].send(JSON.stringify(event));
				}
			}
		}
		
	this.handle = 
		function(event, client){
			if(typeof event == 'string'){
				event = JSON.parse(event);
			}
			
			if(typeof event._data == 'string'){
				try{
					event._data = JSON.parse(event._data);
				}catch(error){}
			}
			
			for(var i in this.events){
				if(this.events[i].type == event._event_type && this.events[i].name == event._event_name){
					this.events[i].handle(event._data, client._custom_id, client);
					
					break;
				}
			}
		}
		
	this.clients = 
		function(){
			return this.websocket.clients;
		}
		
	this.websocket.on('connection', function(client){
		that.handle({_event_name: 'client', _event_type: 'connect'}, client);
	
		client.on('close', function(event){
			that.handle({_event_name: 'client', _event_type: 'disconnect'}, client);
		});
		
		client.on('message', function(event){
			that.handle(event, client);
		});
	});
	
	this.push({
		name: 'client',
		type: 'connect',
		handle: 
			function(data, id, client){
				that.send('client', 'identify', false, client);
			}
	});
		
	this.push({
		name: 'client',
		type: 'identify',
		handle: 
			function(identify, id, client){
				client._custom_id = identify;
				
				that.send('client', 'identificated', false, client);
			}
	});
}

module.exports = WebSocketEvents;