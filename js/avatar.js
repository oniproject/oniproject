var Isomer = require('isomer');

var Octahedron = require('./octahedron');
var Knot = require('./knot');

/* Some convenient renames */
var Point = Isomer.Point;
var Path = Isomer.Path;
var Shape = Isomer.Shape;
var Color = Isomer.Color;

function Avatar(iso) {
	this.position = new Point(3, 2, 3.2);
	this.velocity = 1.0;
	this.angle = 0;
}

Avatar.prototype.draw = function(iso) {
	var position = this.position;
	/* Draw a spinning octahedron as our centerpiece */
	iso.add(Octahedron(position)
		.rotateZ(new Point(position.x +0.5, position.y +0.5, position.z +0.5), this.angle), new Color(0, 180, 180));

	var pos = new Point(position.x, position.y);
	iso.add(Knot(pos), new Color(0xCC, 0, 0));

	this.angle += 1 * Math.PI / 60;
}

Avatar.prototype.move = function(dir) {
	for(var i=0, l=dir.length; i<l; i++) {
		var to = dir[i];
		switch(to) {
		case 'N':
			this.position.x += this.velocity;
			break;
		case 'W':
			this.position.y += this.velocity;
			break;
		case 'S':
			this.position.x -= this.velocity;
			break;
		case 'E':
			this.position.y -= this.velocity;
			break;
		}
	}
}

module.exports = Avatar;
