var commands = require('../commands');

module.exports = {
	el: '#AddPyramidModal',
	template: require('./pyramid.html'),
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
			this.$parent.run(new commands.AddPyramid(
			[+this.x, +this.y, +this.z], [+this.dx, +this.dy, +this.dz]
			));
		},
	},
}
