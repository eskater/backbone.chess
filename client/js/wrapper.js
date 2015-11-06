function BackboneApplication(name, request){
	this.classes = {
		collections: {},
		models: {},
		routes: {},
		views: {}
	};
	
	this.instances = {
		collections: {},
		models: {},
		routes: {},
		views: {}
	};
	
	this.setName = 
		function(name){
			this.name = name;
		}
		
	this.getName = 
		function(){
			return this.name;
		}
	
	this.setRequest = 
		function(request){
			this.request = request;
			
			return this;
		}
	
	this.getRequest = 
		function(params){
			var uri = '';

			for(var i in params){
				uri += _.template('<%=chain%><%=key%>=<%=value%>')({key: i, value: params[i], chain: uri ? '&' : '?'});
			}
			
			return this.request + uri;
		}
		
	this.isSuccessRequest = 
		function(data){
			if (!data || typeof data == 'string') {
				return false;
			}
			
			return typeof data['error'] == 'undefined';
		}
		
	this.gettext = 
		function(message){
			return message;
		}
		
	this.showerror = 
		function(error){
			alert(this.gettext(error));
		}
	
	this.setCollection = 
		function(name, attributes){
			this.classes.collections[name] = Backbone.Collection.extend(attributes);
			
			return this;
		}
		
	this.getCollection = 
		function(name){
			return this.classes.collections[name];
		}
		
	this.instanceCollection = 
		function(name, attributes){
			return (this.instances.collections[name] = new this.classes.collections[name](attributes));
		}
		
	this.isInstanceCollection = 
		function(name){
			return typeof this.instances.collections[name] != 'undefined';
		}
		
	this.getInstanceCollection = 
		function(name, attributes){
			if(!this.instances.collections[name] || attributes){
				return this.instanceCollection(name, attributes);
			}
			
			return this.instances.collections[name];
		}
	
	this.setModel = 
		function(name, attributes){
			this.classes.models[name] = Backbone.Model.extend(attributes);
			
			return this;
		}
		
	this.getModel = 
		function(name){
			return this.classes.models[name];
		}
		
	this.extendModel = 
		function(model, name, attributes){
			return (this.classes.models[name] = this.classes.models[model].extend(attributes));
		}
		
	this.instanceModel = 
		function(name, attributes){
			return (this.instances.models[name] = new this.classes.models[name](attributes));
		}
		
	this.isInstanceModel = 
		function(name){
			return typeof this.instances.models[name] != 'undefined';
		}
		
	this.getInstanceModel = 
		function(name, attributes){
			if(!this.instances.models[name] || attributes){
				return this.instanceModel(name, attributes);
			}
			
			return this.instances.models[name];
		}
		
	this.setView = 
		function(name, attributes){
			this.classes.views[name] = Backbone.View.extend(attributes);
			
			return this;
		}
		
	this.getView = 
		function(name){
			return this.classes.views[name];
		}
	
	this.instanceView = 
		function(name, attributes){
			return (this.instances.views[name] = new this.classes.views[name](attributes));
		}
		
	this.isInstanceView = 
		function(name){
			return typeof this.instances.views[name] != 'undefined';
		}
		
	this.getInstanceView = 
		function(name, attributes){
			if(!this.instances.views[name] || attributes){
				return this.instanceView(name, attributes);
			}
			
			return this.instances.views[name];
		}
		
	this.setRoute = 
		function(name, attributes){
			this.classes.routes[name] = Backbone.Router.extend(attributes);
			
			return this;
		}
		
	this.getRoute = 
		function(name){
			return this.classes.routes[name];
		}
	
	this.instanceRoute = 
		function(name, attributes){
			return (this.instances.routes[name] = new this.classes.routes[name](attributes));
		}
		
	this.isInstanceRoute = 
		function(name){
			return typeof this.instances.routes[name] != 'undefined';
		}
		
	this.getInstanceRoute = 
		function(name, attributes){
			if(!this.instances.routes[name] || attributes){
				return this.instanceRoute(name, attributes);
			}
			
			return this.instances.routes[name];
		}
		
	this.historyStart = 
		function(params){
			try{
				Backbone.history.start(params);
			}catch(e){}
			
			return this;
		}
		
	this.setName(name);
	this.setRequest(request);
}