var commands = require('../commands');

module.exports = {
	el: '#AddPrismModal',
	template: require('./prism.html'),
	data: {
		x: 0,
		y: 0,
		z: 0,
		dx: 1,
		dy: 1,
		dz: 1,
	},
	methods: {
		add: function(e) {
			this.$parent.run(new commands.AddPrism(
			[+this.x, +this.y, +this.z], [+this.dx, +this.dy, +this.dz]
			));
		},
	},
}
