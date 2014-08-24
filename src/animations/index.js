'use strict';
require('less').render(require('./style.css'), function (e, css) {
	require('insert-css')(css)
});

module.exports = {
	id: 'animations',
	template: require('./template.html'),
	components: {
		head: {template: require('./head.html')},
		ds_head: {template: require('./ds_head.html')},
		graph: {template: require('./graph.html')},
	},
	data: {
		msg: 'I am component Animations!'
	}
}
