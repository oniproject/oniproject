'use strict';

var Isomer = require('isomer');

/* Some convenient renames */
var Path = Isomer.Path;
var Shape = Isomer.Shape;

/**
 * Draws an octahedron contained in a 1x1 cube location at origin
 */
function Octahedron(origin) {
	/* Declare the center of the shape to make rotations easy */
	var center = origin.translate(0.5, 0.5, 0.5);
	var faces = [];

	/* Draw the upper triangle /\ and rotate it */
	var upperTriangle = new Path([
	origin.translate(0, 0, 0.5),
	origin.translate(0.5, 0.5, 1),
	origin.translate(0, 1, 0.5)]);

	var lowerTriangle = new Path([
	origin.translate(0, 0, 0.5),
	origin.translate(0, 1, 0.5),
	origin.translate(0.5, 0.5, 0)]);

	for (var i = 0; i < 4; i++) {
		faces.push(upperTriangle.rotateZ(center, i * Math.PI / 2));
		faces.push(lowerTriangle.rotateZ(center, i * Math.PI / 2));
	}

	/* We need to scale the shape along the x & y directions to make the
	 * sides equilateral triangles */
	return new Shape(faces).scale(center, Math.sqrt(2) / 2, Math.sqrt(2) / 2, 1);
}

module.exports = Octahedron;
