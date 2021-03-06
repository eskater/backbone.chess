define(['underscore', 'models/model', 'fs', 'models/utils', 'application'], function (_, Model, fs, utils, application) {
    if (!GLOBAL._template) {
        var Template = Model.extend({
    		attributes: {
                path: null,
                mets: null,
                title: null,
                flash: null,
                scheme: null,
                styles: null,
                content: null,
                scripts: null,
                template: null,
                components: null
            },
            defaults: function() {
                return {
                    path: './application/templates/',
                    mets: [],
                    title: 'Page',
                    flash: {},
                    scheme: 'index',
                    styles: [],
                    content: '',
                    scripts: [],
                    template: 'template',
                    components: {}
                }
            },
            initialize: function(template) {
                this.template(template);
            },
            path: function(path) {
                return this.get('path') + path;
            },
            meta: function(meta) {
                this.mets().push(meta);

                return this;
            },
            mets: function(mets) {
                if (mets) {
                    this.set('styles', _.union(this.get('mets'), mets));

                    return this;
                }

                return this.get('mets');
            },
            style: function(style) {
                this.styles().push(style);

                return this;
            },
            title: function(title) {
                if (title) {
                    this.set('title', title);

                    return this;
                }

                return this.get('title');
            },
            flash: function(type, value) {
                var flash = this.get('flash');

                if (value) {
                    if (typeof flash[type] == 'undefined') {
                        flash[type] = [];
                    }

                    flash[type].push(value);

                    return this;
                }

                return type ? flash[type] : utils.compact(flash);
            },
            reset: function() {
                this.set(_.omit(this.defaults(), 'path', 'template', 'components'));

    			return this;
            },
            scheme: function(scheme) {
                if (scheme) {
                    this.set('scheme', scheme);

                    return this;
                }

                return this.get('scheme');
            },
            styles: function(styles) {
                if (styles) {
                    this.set('styles', _.union(this.get('styles'), styles));

                    return this;
                }

                return this.get('styles');
            },
            script: function(script) {
                this.scripts().push(script);

                return this;
            },
            scripts: function(scripts) {
                if (scripts) {
                    this.set('scripts', _.union(this.get('scripts'), scripts));

                    return this;
                }

                return this.get('scripts');
            },
            content: function(content) {
                if (content) {
                    this.set('content', content);

                    return this;
                }

                return this.get('content');
            },
            include: function(scheme, data) {
                return _.template(fs.readFileSync(this.path('%s.html'.replace(/%s/, scheme))).toString()).call(this, this.dataintemplate({data: data}))
            },
            template: function(template) {
                if (template) {
                    this.set('template', template);

                    return this;
                }

                return this.get('template');
            },
            component: function(name, component) {
                var components = this.get('components');

                if (component) {
                    components[name] = component;

                    return this;
                }

                return components[name].call(this);
            },
            htmlhead: function() {
                return this.htmlmets() + this.htmlstyles() + this.htmlscripts();
            },
            htmlmets: function() {
                var mets = '';

                _.each(this.mets(), function(meta) {
                    mets += _.template('<meta<%=_.map(_.pairs(data.attributes || {}), function(item) { return \' \'+item[0]+\'="\'+item[1]+\'"\'; }).join(\' \')%>/>\n').call(this, {data: meta});
                });

                return mets;
            },
            htmlstyles: function() {
                var styles = '';

                _.each(this.styles(), function(style) {
                    styles += _.template('<link rel="stylesheet" href="<%=data.path%>" type="text/css"<%=_.map(_.pairs(data.attributes || {}), function(item) { return \' \'+item[0]+\'="\'+item[1]+\'"\'; }).join(\' \')%>/>\n').call(this, {data: style});
                });

                return styles;
            },
            htmlscripts: function() {
                var scripts = '';

                _.each(this.scripts(), function(script) {
                    scripts += _.template('<script type="text/javascript" src="<%=data.path%>"<%=_.map(_.pairs(data.attributes || {}), function(item) { return \' \'+item[0]+\'="\'+item[1]+\'"\'; }).join(\' \')%>></script>\n').call(this, {data: script});
                });

                return scripts;
            },
            render: function(data) {
                if (this.scheme()) {
                    this.content(_.template(fs.readFileSync(this.path('%s.html'.replace(/%s/, this.scheme()))).toString()).call(this, this.dataintemplate({data: data})));
                }

                var result = _.template(fs.readFileSync(this.path('%s.html'.replace(/%s/, this.template()))).toString()).call(this, this.dataintemplate({data: data}));

                this.reset();

                return result;
            },
            dataintemplate: function (data) {
                return _.extend({}, {template: this, http: application.http(), application: application}, data);
            }
        });

        GLOBAL._template = new Template();
	}

	return GLOBAL._template;
});
