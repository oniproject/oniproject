'use strict';
require('insert-css')(require('./style.css'))

module.exports = {
	id: 'animations',
	template: require('./template.html'),
	data: {
		msg: 'I am component Animations!'
	}
}
