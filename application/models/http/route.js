define(['backbone', 'fs', 'mime'], function (Backbone, fs, mime) {
	return Backbone.Model.extend({
        attributes: {
            root: null,
            index: null,
            routes: null
        },
        defaults: {
            root: '/',
            index: 'index.html',
            routes: []
        },
        initialize: function(root) {
            
        },
        path: function(path) {
            if (path == '/') {
                return this.get('root') + this.get('index');
            }

            return path.match(/^\//) ? path.replace(/^\//, this.get('root')) : this.get('root') + path;
        },
        push: function(route) {
            this.get('routes').push(route);
        },
        handle: function(request, response) {
            var status = 200,
                header = 'text/html';

            var content = null,
                routes = this.get('routes');

            for (var i in routes) {
                var keys = routes[i].url.match(/#(.+?)=#/g),
                    tokens = routes[i].url.replace(/#.+?=#/g, '');

                if (request.url.match(new RegExp(tokens)) && routes[i].method.toUpperCase() == request.method) {
                    switch (routes[i].type) {
                        case 'file':
                            try {
                                header = mime.lookup(this.path(routes[i].file));

                                content = fs.readFileSync(this.path(routes[i].file));

                                console.log(content);
                            } catch (error) {
                                status = 404;
                            }

                            break;
                    }

                    if (routes[i].handle) {
                        var params = {},
                            values = request.url.match(tokens);

                        if (values) {
                            values = values.slice(1);

                            for (var k in keys) {
                                params[keys[k].replace(/[\#\=]/g, '')] = values[k];
                            }
                        }

                        routes[i].handle.call(this, request, response, params);
                    }

                    break;
                }
            }

            if (!content) {
                try {
                    header['Content-Type'] = mime.lookup(this.path(request.url));

                    content = fs.readFileSync(this.path(request.url));
                } catch (error) {
                    status = 404;
                }
            }

            response.writeHead(status, header);
            response.write(content);
            response.end();
        }
    });
});
