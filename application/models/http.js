define(['underscore', 'backbone', 'http', 'fs', 'models/http/router', 'models/http/cookie', 'models/http/session'], function (_, Backbone, http, fs, Router, Cookie, Session) {
	return Backbone.Model.extend({
        attributes: {
            port: null,
            root: null,
            index: null,
            router: null,
			cookie: null,
            address: null,
			session: null
        },
        defaults: {
            port: 80,
			root: 'client/',
            index: 'index.html',
            address: '127.0.0.1'
        },
        initialize: function() {
            this.router(new Router(this)).cookie(new Cookie(this)).session(new Session(this));
        },
		path: function(path) {
			if (path == '/') {
				return this.get('root') + this.get('index');
			}

			return path.match(/^\//) ? path.replace(/^\//, this.get('root')) : this.get('root') + path;
		},
        router: function(router) {
            if (router) {
                this.set('router', router);

                return this;
            }

            return this.get('router');
        },
		handle: function(request, response) {
			this.router().handle(request, response, (function(content, status, headers) {
				headers = _.extend({}, this.headers(request), headers);

				this.response(response, content, status, headers);
			}).bind(this));
		},
		cookie: function(headers) {
			if (cookie) {
                this.set('cookie', cookie);

                return this;
            }

            return this.get('cookie');
		},
		session: function() {
			if (session) {
				this.set('session', session);

				return this;
			}

			return this.get('session');
		},
		headers: function(request) {
			var cookie,
				headers = {
					'Server': 'Node.js',
					'Content-Type': 'text/html'
				};

			if ((cookie = this.cookie(request.headers))) {
				headers['Set-Cookie'] = cookie;
			}

			return headers;
		},
		response: function(response, content, status, headers) {
			response.writeHead(status, headers);

			if (status == 200) {
				response.write(content);
			} else {
				response.write(fs.readFileSync(this.path('%s.html'.replace(/%s/, status))));
			}

			response.end();
		},
        start: function() {
            http.createServer((function(request, response) {
				this.handle(request, response);
            }).bind(this)).listen(this.get('port'), this.get('address'));

			return this;
        }
    });
});
