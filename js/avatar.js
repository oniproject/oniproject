'use strict';

var Isomer = require('isomer');

var Octahedron = require('./octahedron');
var Knot = require('./knot');

/* Some convenient renames */
var Point = Isomer.Point;
var Path = Isomer.Path;
var Shape = Isomer.Shape;
var Color = Isomer.Color;

function Avatar() {
	this.position = new Point(0, 0, 0);
	this.velocity = new Point(0, 0, 0);
	this.speed = 1.0;
	this.angle = 0;
	var c = new Color();
	c.h = Math.random();
	c.s = 0.8;
	c.l = 0.3;
	c.loadRGB();
	this.color = c;
}

Avatar.prototype.draw = function(iso) {
	var pos = this.position;
	//iso.add(Knot(new Point(pos.x-0.5, pos.y-0.5)), this.color);
	iso.add(Octahedron(new Point(pos.x-0.5, pos.y-0.5, pos.z))
		.rotateZ(new Point(pos.x, pos.y, pos.z+0.5), this.angle), this.color);
}

Avatar.prototype.update = function(time) {
	this.angle += 1 * Math.PI * time;
	this.position.x += this.velocity.x * time;
	this.position.y += this.velocity.y * time;
	this.position.z += this.velocity.z * time;
}

Avatar.prototype.move = function(dir) {
	this.velocity.x = 0;
	this.velocity.y = 0;
	for(var i=0, l=dir.length; i<l; i++) {
		var to = dir[i];
		switch(to) {
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
