module.exports = {
	el: '#obj-list',
	template: require('./template.html'),
	data: {
		list: [],
	},
	methods: {
		setActiveClick: function(id) {
			this.$parent.active = id;
			this.$parent.setActive(id);
			this.$emit('setActive', id);
		},
	},
}
