var commands = require('../commands');

module.exports = {
	el: '#AddShapeModal',
	template: require('./shape.html'),
	data: {
		height: 1,
		points: [
			{
				x: 0,
				y: 0,
				z: 0
		}],
	},
	methods: {
		add: function(e) {
			var path = [];
			for (var i = 0, l = this.points.length; i < l; i++) {
				var p = this.points[i];
				path.push([+p.x, +p.y, +p.z]);
			}
			this.$parent.run(new commands.AddShape(path, +this.height));
		},
	},
}
