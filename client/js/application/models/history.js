define(['models/model'], function (Model) {
	return Model.extend({
		attributes: {
            fid: null,
            type: null,
            date: null,
            index: null,
            color: null,
            figure: null,
            replace: null,
            current: null,
            previous: null
        },
        defaults: {
            current: [],
            previous: [],
        },
        initialize: function() {
            this.set('replace', {
                color: null,
                figure: null
            });
        },
        queen: function() {
            this.set({
                replace: {
                    color: this.get('color'),
                    figure: 'queen'
                },
                current: [],
                previous: []
            });
        },
        replace: function(replace) {
            this.set('replace', {
                color: replace.color(),
                figure: replace.type()
            });
        },
        time: function() {
            return _.template('<%=minutes%>:<%=seconds%>')({
                minutes: this.get('date').getMinutes(),
                seconds: this.get('date').getSeconds()
            });
        },
        index: function() {
            return this.get('index');
        },
        current: function() {
            if (this.get('current').length) {
                return _.template('<%=col%><%=row%>')({
                    col: String.fromCharCode(this.get('current')[1] + 64),
                    row: this.get('current')[0]
                });
            }
        },
        previous: function() {
            if (this.get('previous').length) {
                return _.template('<%=col%><%=row%>')({
                    col: String.fromCharCode(this.get('previous')[1] + 64),
                    row: this.get('previous')[0]
                });
            }
        },
        sync: function() {
            return false;
        }
    });
});
