'use strict';
require('insert-css')(require('./style.css'))

module.exports = {
	id: 'tools',
	template: require('./template.html'),
	data: {
		msg: 'I am component tools!'
	}
}
