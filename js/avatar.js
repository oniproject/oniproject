'use strict';

var Isomer = require('isomer'),
	Octahedron = require('./octahedron'),
	Knot = require('./knot'),
	/* Some convenient renames */
	Point = Isomer.Point,
	Path = Isomer.Path,
	Shape = Isomer.Shape,
	Color = Isomer.Color;

function Avatar() {
	this.position = new Point(0, 0, 0);
	this.velocity = new Point(0, 0, 0);
	this.speed = 1.0;
	this.angle = 0;
	this.rot = 1;
	var c = new Color();
	c.h = Math.random();
	c.s = 0.8;
	c.l = 0.3;
	c.loadRGB();
	this.color = c;
}

Avatar.prototype.draw = function(iso) {
	var pos = this.position;

	if (this.hasOwnProperty('state')) {
		// is avatar or monster
		if (this.state.Id > -10000) {
			iso.add(Octahedron(new Point(pos.x - 0.5, pos.y - 0.5, pos.z))
				.rotateZ(new Point(pos.x, pos.y, pos.z + 0.5), this.angle)
				.scale(new Point(pos.x, pos.y, pos.z), 0.7, 0.7, 0.7), this.color);
		}
		// is avatar or item
		if (this.state.Id < -10000 || this.state.Id > 0) {
			iso.add(Knot(new Point(pos.x - 0.5, pos.y - 0.5)).scale(new Point(pos.x, pos.y), 0.2, 0.2, 0.2), this.color);
		}
	}
}

Avatar.prototype.isAvatar = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id > 0;
	}
}
Avatar.prototype.isMonster = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id < 0 && this.state.Id > -10000;
	}
}
Avatar.prototype.isItem = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id < -10000;
	}
}

Avatar.prototype.update = function(time) {
	this.angle += this.rot * Math.PI * time;
	this.position.x += this.velocity.x * time;
	this.position.y += this.velocity.y * time;
	this.position.z += this.velocity.z * time;
}

Avatar.prototype.move = function(dir) {
	this.velocity.x = 0;
	this.velocity.y = 0;
	for (var i = 0, l = dir.length; i < l; i++) {
		var to = dir[i];
		switch (to) {
			case 'N':
				this.velocity.x += this.speed;
				break;
			case 'W':
				this.velocity.y += this.speed;
				break;
			case 'S':
				this.velocity.x -= this.speed;
				break;
			case 'E':
				this.velocity.y -= this.speed;
				break;
		}
	}
}

module.exports = Avatar;
