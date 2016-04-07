define(['underscore', 'backbone', 'fs'], function (_, Backbone, fs) {
	return Backbone.Model.extend({
        attributes: {
            http: null,
			data: null,
			sessid: null,
			savepath: null
        },
        defaults: {
			data: {},
			savepath: './sessions/'
        },
        initialize: function(http, id) {
			this.http(http).id(id);
        },
		id: function(id) {
			if (id) {
				this.setattr('sessid', id).initializedata();

				return this;
			}

			return this.getattr('sessid');
		},
		set: function(name, value) {
			if (typeof name == 'object') {
				return this.setattr.apply(this, arguments);
			}

			var data = this.getattr('data');

			data[name] = value;

			return this;
		},
		get: function(name) {
			var data = this.getattr('data');

			return data[name];
		},
		data: function(data, full) {
			if (data) {
				if (full) {
					this.setattr('data', data);
				} else {
					this.setattr('data', _.extend({}, this.getattr('data'), data));
				}

				return this;
			}

			return this.getattr('data');
		},
		http: function(http) {
			if (http) {
				this.setattr('http', http);

				return this;
			}

			return this.getattr('http');
		},
		path: function(path) {
			return this.getattr('savepath') + path;
		},
		save: function() {
			var list = _.pairs(this.data());

			if (list.length > 0) {
				try {
					fs.writeFileSync(this.path('%s.dat'.replace(/%s/, this.id())),  _.map(list, function(item) {
						return _.template('<%=key%>=<%=value%>').call(this, {key: item[0], value: item[1]});
					}).join(';'));
				} catch (error) { }
			}

			return this;
		},
		destroy: function() {

		},
		setattr: function() {
			return Backbone.Model.prototype.set.apply(this, arguments);
		},
		getattr: function() {
			return Backbone.Model.prototype.get.apply(this, arguments);
		},
		headers: function() {

		},
		buildheaders: function() {

		},
		initializedata: function() {
			try {
				var data = fs.readFileSync(this.path('%s.dat'.replace(/%s/, this.id()))).toString();

				this.data(_.object(_.map(data.trim().split(';'), function(item) { return item.trim().split('='); })), true);
			} catch (error) { }
		}
    });
});
