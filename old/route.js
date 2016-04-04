var fs = require('fs'),
	mime = require('mime');

function Route(root){
	this.root = root;
	this.index = 'index.html';
	
	this.routes = [];
	
	this.path = 
		function(path){
			if(path == '/'){
				return this.root + this.index;
			}
		
			return path.match(/^\//) ? path.replace(/^\//, this.root) : this.root + path;
		}
	
	this.push = 
		function(route){
			this.routes.push(route);
		}
		
	this.handle = 
		function(request, response){
			var status = 200,
				header = 'text/html';
			
			var content = '';
			
			for(var i in this.routes){
				var keys = this.routes[i].url.match(/#(.+?)=#/g),
					tokens = this.routes[i].url.replace(/#.+?=#/g, '');
				
				if(request.url.match(new RegExp(tokens)) && this.routes[i].method.toUpperCase() == request.method){
					switch(this.routes[i].type){
						case 'file':
							try{
								header = mime.lookup(this.path(this.routes[i].file));
							
								content = fs.readFileSync(this.path(this.routes[i].file));
								
								console.log(content);
							}catch(error){
								status = 404;
							}
							
							break;
					}
					
					if(this.routes[i].handle){	
						var params = {},
							values = request.url.match(tokens);
						
						if(values){
							values = values.slice(1);
							
							for(var k in keys){
								params[keys[k].replace(/[\#\=]/g, '')] = values[k];
							}
						}
						
						this.routes[i].handle.call(this, request, response, params);
					}
					
					break;
				}
			}
			
			if(content){
			
			}else{
				try{
					header['Content-Type'] = mime.lookup(this.path(request.url));
					
					content = fs.readFileSync(this.path(request.url));
				}catch(error){
					status = 404;
				}
			}
			
			response.writeHead(status, header);
			response.write(content);
			response.end();
		}
}

module.exports = Route;