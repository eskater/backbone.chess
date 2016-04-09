/** Mini implementation simple http server */
define(['underscore', 'models/model', 'http', 'fs', 'models/http/router', 'models/http/cookie'], function (_, Model, http, fs, Router, Cookie) {
	return Model.extend({
        attributes: {
			get: null,
			post: null,
            port: null,
            root: null,
            index: null,
			params: null,
			status: null,
            router: null,
			cookie: null,
			content: null,
			request: null,
			headers: null,
            address: null,
			session: null,
			cookieid: null,
        },
        defaults: {
			get: {},
			post: {},
            port: 80,
			root: 'client/',
            index: 'index.html',
			params: {},
			status: 200,
			content: '',
			headers: {'Server': 'Node.js', 'Content-Type': 'text/html'},
            address: '127.0.0.1',
			cookieid: '_cookie_id',
        },
        initialize: function() {
            this.router(new Router(this));
        },
		end: function() {
			this.cookie().buildheaders();
			this.session().buildheaders();

			this.response().writeHead(this.status(), this.headers());

			if (this.status() == 200) {
				this.response().write(this.content());
			} else {
				try {
					this.response().write(fs.readFileSync(this.path('404.html'.replace(/%s/, this.status()))));
				} catch(error) {
					this.response().write('');
				}
			}

			this.response().end();
			this.session().save();
			this.reset();
		},
		root: function(root) {
            if (root) {
                this.setattr('root', root);

                return this;
            }

            return this.getattr('root');
        },
		path: function(path) {
			if (path == '/') {
				return this.root() + this.getattr('index');
			}

			return path.match(/^\//) ? path.replace(/^\//, this.root()) : this.root() + path;
		},
        start: function() {
            http.createServer((function(request, response) {
				this.request(request).response(response).handle();
            }).bind(this)).listen(this.getattr('port'), this.getattr('address'));

			return this;
        },
		reset: function() {
			this.set(_.omit(this.defaults, 'root', 'index', 'address', 'cookieid'));

			return this;
		},
        router: function(router) {
            if (router) {
                this.setattr('router', router);

                return this;
            }

            return this.getattr('router');
        },
		status: function(status) {
			if (status) {
                this.setattr('status', status);

                return this;
            }

            return this.getattr('status');
		},
		handle: function() {
			this.cookie(new Cookie(this));

			this.router().handle();
		},
		cookie: function(cookie) {
			if (cookie) {
                this.setattr('cookie', cookie);

                return this;
            }

            return this.getattr('cookie');
		},
		header: function(name, value) {
			var headers = this.headers();

            if (typeof value != 'undefined') {
                headers[name] = value;

                return this;
            }

            return headers[name];
		},
		setattr: function() {
			return Model.prototype.set.apply(this, arguments);
		},
		getattr: function() {
			return Model.prototype.get.apply(this, arguments);
		},
		forward: function(name, method) {
			var rule = this.router().rules().findWhere({name: name}),
				method = method || 'get';

			if (rule && rule.get(method)) {
				var content = rule.get(method).call(this, this);

				if (content) {
					this.content(content).end();
				}
			}
		},
        headers: function(headers) {
			if (headers) {
				this.setattr('headers', _.extend({}, this.getattr('headers'), headers));

				return this;
			}

			return this.getattr('headers');
		},
		session: function(session) {
			if (session) {
				this.setattr('session', session);

				return this;
			}

			return this.getattr('session');
		},
		content: function(content) {
			if (content) {
				this.setattr('content', content);

				return this;
			}

			return this.getattr('content');
		},
		request: function(request) {
			if (request) {
                this.setattr('request', request);

                return this;
            }

            return this.getattr('request');
		},
		redirect: function(url) {
			this.header('Location', url).status(301).end();
		},
		response: function(response) {
			if (response) {
                this.setattr('response', response);

                return this;
            }

            return this.getattr('response');
		},
		cookieid: function(cookieid) {
			if (cookieid) {
				this.setattr('cookieid', cookieid);

				return this;
			}

			return this.getattr('cookieid');
		},
		get: function(name, value) {
			var gets = this.gets();

			if (typeof value != 'undefined') {
				gets[name] = value;

				return this;
			}

			return gets[name];
		},
		gets: function(gets) {
			if (gets) {
				this.setattr('get', _.extends({}, this.getattr('get'), gets));

				return this;
			}

			return this.getattr('get');
		},
		post: function(name, value) {
			var posts = this.posts();

			if (typeof value != 'undefined') {
				posts[name] = value;

				return this;
			}

			return posts[name];
		},
		posts: function(posts) {
			if (posts) {
				this.setattr('post', _.extend({}, this.getattr('post'), posts));

				return this;
			}

			return this.getattr('post');
		},
		param: function(name) {
			var params = this.params();

			if (typeof value != 'undefined') {
				params[name] = value;

				return this;
			}

			return params[name];
		},
		params: function(params) {
			if (params) {
				this.setattr('params', _.extend({}, this.getattr('params'), params));

				return this;
			}

			return this.getattr('params');
		}
    });
});
