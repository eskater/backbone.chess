define(['underscore', 'backbone', 'fs', 'application'], function (_, Backbone, fs, application) {
    if (!GLOBAL._template) {
        var Template = Backbone.Model.extend({
    		attributes: {
                title: null,
                metas: null,
                scheme: null,
                styles: null,
                content: null,
                scripts: null,
                template: null,
                components: null
            },
            defaults: {
                title: 'Page',
                metas: [],
                scheme: 'index',
                styles: [],
                content: '',
                scripts: [],
                template: 'template',
                components: {}
            },
            initialize: function(template) {
                this.template(template);
            },
            title: function(title) {
                if (title) {
                    this.set('title', title);

                    return this;
                }

                return this.get('title');
            },
            scheme: function(scheme) {
                if (scheme) {
                    this.set('scheme', scheme);

                    return this;
                }

                return this.get('scheme');
            },
            meta: function(meta) {
                this.metas().push(meta);

                return this;
            },
            metas: function(metas) {
                if (metas) {
                    this.set('metas', metas);

                    return this;
                }

                return this.get('metas');
            },
            style: function(style) {
                this.styles().push(style);


                return this;
            },
            styles: function(styles) {
                if (styles) {
                    this.set('styles', styles);

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
                    this.set('scripts', scripts);

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
                return this.htmlmetas() + this.htmlstyles() + this.htmlscripts();
            },
            htmlmetas: function() {
                var metas = '';

                _.each(this.metas(), function(meta) {
                    metas += _.template('<meta<%=_.map(_.pairs(data.attributes || {}), function(item) { return \' \'+item[0]+\'="\'+item[1]+\'"\'; }).join(\' \')%>/>\n').call(this, {data: meta});
                });

                return metas;
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
            render: function(params) {
                if (this.scheme()) {
                    this.content(_.template(fs.readFileSync(application.path('application/templates/%s.html'.replace(/%s/, this.scheme()))).toString()).call(this, {template: this, data: params}));
                }

                var result = _.template(fs.readFileSync(application.path('application/templates/%s.html'.replace(/%s/, this.template()))).toString()).call(this, {template: this});

                this.reset();

                return result;
            },
            reset: function() {
                this.set({
                    title: 'Page',
                    metas: [],
                    scheme: 'index',
                    styles: [],
                    content: '',
                    scripts: [],
                });

                return this;
            }
        });

        GLOBAL._template = new Template();
	}

	return GLOBAL._template;
});
