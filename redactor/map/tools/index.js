var commands = require('../commands');

module.exports = {
	el: '#Tools',
	template: require('./template.html'),
	data: {
		isPos: true,
		isSize: true,
		isVertices: true,
		isRotate: true,
		isColor: true,
		color: '#000000',
		alpha: 0,
		text: 'Select any object',
		pos: {
			x: 0,
			y: 0,
			z: 0,
		},
		size: {
			x: 0,
			y: 0,
			z: 0,
			v: 0,
		},
		rotate: {
			z: 0,
		}
	},
	methods: {
		SetColor: function(e) {
			var c = parseInt(this.color.slice(1), 16),
				r = (c >> 16) & 0xff,
				g = (c >> 8) & 0xff,
				b = c & 0xff;
			this.$parent.run(new commands.SetColor(this.$parent.active, [r, g, b, +this.alpha]));
		},
		Move: function(e) {
			this.$parent.run(new commands.Move(
			this.$parent.active, [+this.pos.x, +this.pos.y, +this.pos.z]
			));
		},
		Resize: function(e) {
			this.$parent.run(new commands.Resize(
			this.$parent.active, [+this.size.x, +this.size.y, +this.size.z], +this.size.v
			));
		},
		Rotate: function(e) {
			this.$parent.run(new commands.Rotate(
			this.$parent.active, +this.rotate.z
			));
		},
	},
}
