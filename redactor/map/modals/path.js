var commands = require('../commands');

module.exports = {
	el: '#AddPathModal',
	template: require('./path.html'),
	data: {
		points: [
			{x: 0, y: 0, z: 0}
		],
	},
	methods: {
		add: function(e) {
			var path = [];
			for (var i = 0, l = this.points.length; i < l; i++) {
				var p = this.points[i];
				path.push([+p.x, +p.y, +p.z]);
			}
			this.$parent.run(new commands.AddPath(path));
		},
	},
}
