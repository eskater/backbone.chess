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
        handle: function() {
			var http = this.http(),
				request = http.request();

            var rules = this.get('rules'),
				content = null;

			var urlpath = url.parse(request.url),
				databuffer = '';

			var method = request.method.toLowerCase();

			http.header('Content-Type', 'text/html');

            for (var i in rules) {
				var urltokens = rules[i].url.replace(/\(\w+\:(.+?)\)/g, '($1)'),
					urlmatches = rules[i].url.match(/(?!=\()(\w+)(?=\:.+?\))/g);

				var urlvalues = [];

				if ((urlvalues = urlpath.pathname.match(new RegExp(urltokens)))) {
					if (urlmatches) {
						urlvalues = urlvalues.slice(1, urlmatches.length + 1);

						for (var i in urlmatches) {
							http.getparam(urlmatches[i], urlvalues[i]);
						}
					}

					if (urlpath.query) {
						http.getparams(_.extend({}, http.getparams(), _.object(_.map(urlpath.query.split('&'), function(tokens) { return tokens.split('='); }))));
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
							var result = content.call(rules[i], http, (function(content) {
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
					http.postparams(querystring.parse(databuffer));

					end.call(this);
				}).bind(this));
			}
        }
    });
});
