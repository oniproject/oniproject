'use strict';
require('less').render(require('./style.css'), function (e, css) {
	require('insert-css')(css)
});

module.exports = {
	id: 'tools',
	template: require('./template.html'),
	data: {
		msg: 'I am component tools!'
	}
}
