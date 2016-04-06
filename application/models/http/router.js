define(['querystring', 'underscore', 'backbone', 'fs', 'url', 'mime', 'application'], function (querystring, _, Backbone, fs, url, mime, application) {
	return Backbone.Model.extend({
        attributes: {
			http: null,
            rules: null
        },
        defaults: {
            rules: []
        },
        initialize: function(http) {
			this.http(http);
        },
		http: function(http) {
			if (http) {
				this.set('http', http);

				return this;
			}

			return this.get('http');
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
        handle: function(request, response, callback) {
			var status = 200,
                headers = {
					'Content-Type': 'text/html'
				};

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
							var result = content.call(rules[i], params, request, response, (function(content, restatus, reheaders) {
								callback.call(this, content,  restatus || status, reheaders || headers);
							}).bind(this));

							if (result) {
								callback.call(this, result, status, headers);
							}

							break;
						default:
							callback.call(this, content, status, headers);
					}
	            } else {
					try {
						headers['Content-Type'] = mime.lookup(this.http().path(request.url));

	                    content = fs.readFileSync(this.http().path(request.url));
	                } catch (error) {
	                    status = 404;
	                }

					callback.call(this, content, status, headers);
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
        }
    });
});
