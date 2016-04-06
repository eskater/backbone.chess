define(['underscore', 'backbone', 'http', 'fs', 'models/http/router', 'models/http/cookie', 'models/http/session'], function (_, Backbone, http, fs, Router, Cookie, Session) {
	return Backbone.Model.extend({
        attributes: {
			get: null,
			post: null,
            port: null,
            root: null,
            index: null,
			status: null,
            router: null,
			cookie: null,
			content: null,
			request: null,
			headers: null,
            address: null,
			session: null
        },
        defaults: {
			get: {},
			post: {},
            port: 80,
			root: 'client/',
            index: 'index.html',
			status: 200,
			content: '',
			headers: {'Server': 'Node.js', 'Content-Type': 'text/html'},
            address: '127.0.0.1'
        },
        initialize: function() {
            this.router(new Router(this));
        },
		end: function() {
			this.response().writeHead(this.status(), this.headers());

			if (this.status() == 200) {
				this.response().write(this.content());
			} else {
				this.response().write(fs.readFileSync(this.path('%s.html'.replace(/%s/, this.status()))));
			}

			this.response().end();
		},
		path: function(path) {
			if (path == '/') {
				return this.get('root') + this.get('index');
			}

			return path.match(/^\//) ? path.replace(/^\//, this.get('root')) : this.get('root') + path;
		},
        start: function() {
            http.createServer((function(request, response) {
				this.request(request).response(response).handle();
            }).bind(this)).listen(this.get('port'), this.get('address'));

			return this;
        },
        router: function(router) {
            if (router) {
                this.set('router', router);

                return this;
            }

            return this.get('router');
        },
		status: function(status) {
			if (status) {
                this.set('status', status);

                return this;
            }

            return this.get('status');
		},
		handle: function() {
			if (!this.cookie()) {
				this.cookie(new Cookie(this));
			}

			this.router().handle();
		},
		cookie: function(cookie) {
			if (cookie) {
                this.set('cookie', cookie);

                return this;
            }

            return this.get('cookie');
		},
		header: function(name, value) {
			var headers = this.headers();

            if (typeof value != 'undefined') {
                headers[name] = value;

                return this;
            }

            return headers[name];
		},
        headers: function(headers) {
			if (headers) {
				this.set('headers', _.extends({}, this.get('headers'), headers));

				return this;
			}

			return this.get('headers');
		},
		session: function(session) {
			if (session) {
				this.set('session', session);

				return this;
			}

			return this.get('session');
		},
		content: function(content) {
			if (content) {
				this.set('content', content);

				return this;
			}

			return this.get('content');
		},
		request: function(request) {
			if (request) {
                this.set('request', request);

                return this;
            }

            return this.get('request');
		},
		response: function(response) {
			if (response) {
                this.set('response', response);

                return this;
            }

            return this.get('response');
		},
		getparam: function(name, value) {
			var gets = this.getparams();

			if (typeof value != 'undefined') {
				gets[name] = value;

				return this;
			}

			return gets[name];
		},
		getparams: function(gets) {
			if (gets) {
				this.set('get', _.extends({}, this.get('get'), gets));

				return this;
			}

			return this.get('get');
		},
		postparam: function(name, value) {
			var posts = this.postparams();

			if (typeof value != 'undefined') {
				posts[name] = value;

				return this;
			}

			return posts[name];
		},
		postparams: function(posts) {
			if (posts) {
				this.set('post', _.extends({}, this.get('post'), posts));

				return this;
			}

			return this.get('post');
		},
    });
});
