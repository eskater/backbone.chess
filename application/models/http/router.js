define(['underscore', 'backbone', 'fs', 'url', 'mime'], function (_, Backbone, fs, url, mime) {
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
        handle: function(request, response) {
			var status = 200,
                header = {'Content-Type': 'text/html'};

            var content = null,
                rules = this.get('rules');

            for (var i in rules) {
                var urlpath = url.parse(request.url);

				console.log(request);

				if (urlpath.pathname.match(new RegExp(rules[i].url))) {
					var method = request.method.toLowerCase();

					switch (rules[i].type) {
                        case 'file':
                            try {
                                header['Content-Type'] = mime.lookup(this.path(rules[i].file));

                                content = fs.readFileSync(this.path(rules[i].file));
                            } catch (error) {
                                status = 404;
                            }

                            break;
						default:
							if ((content = rules[i][method])) {
								var params = {};

								if (urlpath.query) {
									params = _.object(_.map(urlpath.query.split('&'), function(tokens) { return tokens.split('='); }));
								}
							}
                    }
                }
            }

            if (content) {
				switch (typeof content) {
					case 'function':
						var result = content.call(this, params, request, response, (function(content, restatus, reheader) {
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
        },
		response: function(response, content, status, header) {
			response.writeHead(status, header);
			response.write(content ? content : fs.readFileSync(this.path('404.html')));
			response.end();
		}
    });
});
