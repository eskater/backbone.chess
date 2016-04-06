define(['querystring', 'underscore', 'backbone', 'fs', 'url', 'mime', 'application'], function (querystring, _, Backbone, fs, url, mime, application) {
	return Backbone.Model.extend({
        attributes: {
            root: null,
            index: null,
            rules: null
        },
        defaults: {
            root: 'client/',
            index: 'index.html',
            rules: []
        },
        initialize: function() {

        },
		path: function(path) {
			if (path == '/') {
				return this.get('root') + this.get('index');
			}

			return path.match(/^\//) ? path.replace(/^\//, this.get('root')) : this.get('root') + path;
		},
        push: function(rule) {
            this.rules().push(rule);

			return this;
        },
		rules: function(rules) {
			if (rules) {
				this.set('rules', rules);

				return this;
			}

			return this.get('rules');
		},
		/** stinky method */
        handle: function(request, response) {
			var status = 200,
                header = {'Content-Type': 'text/html'};

            var rules = this.get('rules'),
				content = null;

			var params = {get: {}, post: {}},
				method = request.method.toLowerCase();

			var urlpath = url.parse(request.url),
				databuffer = '';

            for (var i in rules) {
				var urltokens = rules[i].url.replace(/\(\w+\:(.+?)\)/g, '($1)'),
					urlmatches = rules[i].url.match(/(?!=\()(\w+)(?=\:.+?\))/g);

				var urlvalues = [];

				if ((urlvalues = urlpath.pathname.match(new RegExp(urltokens)))) {
					if (urlmatches) {
						urlvalues = urlvalues.slice(1, urlmatches.length + 1);

						for (var i in urlmatches) {
							params['get'][urlmatches[i]] = urlvalues[i];
						}
					}

					if (urlpath.query) {
						params['get'] = _.extend({}, params['get'], _.object(_.map(urlpath.query.split('&'), function(tokens) { return tokens.split('='); })));
					}

					if (!(content = rules[i][method]) && rules[i]['all']) {
						content = rules[i]['all'];
					}
                }
            }

			var end = (function() {
				if (content) {
					switch (typeof content) {
						case 'function':
							var result = content.call(rules[i], params, request, response, (function(content, restatus, reheader) {
								this.response(response, content,  restatus || status, reheader || header);
							}).bind(this));

							if (result) {
								this.response(response, result, status, header);
							}

							break;
						default:
							this.response(response, content, status, header);
					}
	            } else {
					try {
						header['Content-Type'] = mime.lookup(this.path(request.url));

	                    content = fs.readFileSync(this.path(request.url));
	                } catch (error) {
	                    status = 404;
	                }

					this.response(response, content, status, header);
				}
			}).bind(this);

			if (method == 'get') {
				end.call(this);
			} else {
				request.on('data', function(data) {
					databuffer += data;
				});

				request.on('end', function() {
					params[method] = querystring.parse(databuffer);
					params['request'] = _.extend({}, params['get'], params[method]);

					end.call(this);
				});
			}
        },
		response: function(response, content, status, header) {
			response.writeHead(status, header);

			if (status == 200) {
				response.write(content);
			} else {
				response.write(fs.readFileSync(this.path('%s.html'.replace(/%s/, status))));
			}

			response.end();
		}
    });
});
