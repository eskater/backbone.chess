define(['querystring', 'underscore', 'models/model', 'fs', 'url', 'mime', 'collections/http/router/rules'], function (querystring, _, Model, fs, url, mime, Rules) {
	return Model.extend({
        attributes: {
			http: null,
            rules: null
        },
        defaults: function() {
            return {
				rules: new Rules()
			}
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
            this.rules().create(rule);

			return this;
        },
		rules: function(rules) {
			if (rules) {
				this.set('rules', rules);

				return this;
			}

			return this.get('rules');
		},
        handle: function(params, method) {
			var http = this.http(),
				request = http.request();

			var urlpath = url.parse(request.url),
				databuffer = '';

			var method = method || request.method.toLowerCase(),
				content = null;

			http.header('Content-Type', 'text/html');

			_.each(this.rules().where(params), function(rule) {
				var urltokens = rule.url().replace(/\(\w+\:(.+?)\)/g, '($1)'),
					urlmatches = rule.url().match(/(?!=\()(\w+)(?=\:.+?\))/g);

				var urlvalues = urlpath.pathname.match(new RegExp(urltokens));

				if (params || urlvalues) {
					if (urlmatches) {
						urlvalues = urlvalues.slice(1, urlmatches.length + 1);

						for (var i in urlmatches) {
							http.get(urlmatches[i], urlvalues[i]);
						}
					}

					if (urlpath.query) {
						http.gets(_.extend({}, http.gets(), _.object(_.map(urlpath.query.split('&'), function(tokens) { return tokens.split('='); }))));
					}

					http.params(http.gets());

					if (!(content = rule.get(method)) && rule.get('all')) {
						content = rule.get('all');
					}
				}
			});

			var end = (function() {
				if (content) {
					switch (typeof content) {
						case 'function':
							var result = content.call(this, http, (function(content) {
								http.content(content).end();
							}).bind(this));

							if (result) {
								http.content(result).end();
							}

							break;
						default:
							http.content(content).end();
					}
	            } else {
					try {
						http.header('Content-Type', mime.lookup(http.path(request.url))).content(fs.readFileSync(http.path(request.url))).end();
	                } catch (error) {
						http.header('Content-Type', 'text/html');

	                    http.status(404).end();
	                }
				}
			}).bind(this);

			if (method == 'get') {
				end.call(this);
			} else {
				request.on('data', function(data) {
					databuffer += data;
				});

				request.on('end', (function() {
					http.posts(querystring.parse(databuffer));
					http.params(http.posts());

					end.call(this);
				}).bind(this));
			}
        }
    });
});
