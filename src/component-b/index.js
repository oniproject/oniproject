require('insert-css')(require('./style.css'))

module.exports = {
	id: 'b',
	template: require('./template.html'),
	data: {
		msg: 'I am component B!'
	}
}
