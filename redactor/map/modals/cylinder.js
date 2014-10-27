var commands = require('../commands');

module.exports = {
	el: '#AddCylinderModal',
	template: require('./cylinder.html'),
	data: {
		x: 0,
		y: 0,
		z: 0,
		dx: 1,
		dy: 1,
		dz: 1,
		vertices: 30,
	},
	methods: {
		add: function(e) {
			this.$parent.run(new commands.AddCylinder(
			[+this.x, +this.y, +this.z], [+this.dx, +this.dy, +this.dz], +this.vertices
			));
		},
	},
}
