'use strict';

var Isomer = require('isomer'),
	/* Some convenient renames */
	Path = Isomer.Path,
	Point = Isomer.Point,
	Shape = Isomer.Shape;

/* Draws an impossible MC Escher style knot */
function Knot(origin) {
	var knot = new Shape();

	knot.paths = knot.paths.concat(Shape.Prism(Point.ORIGIN, 5, 1, 1).paths);
	knot.paths = knot.paths.concat(Shape.Prism(new Point(4, 1, 0), 1, 4, 1).paths);
	knot.paths = knot.paths.concat(Shape.Prism(new Point(4, 4, -2), 1, 1, 3).paths);

	knot.push(new Path([
		new Point(0, 0, 2),
		new Point(0, 0, 1),
		new Point(1, 0, 1),
		new Point(1, 0, 2)
	]));

	knot.push(new Path([
		new Point(0, 0, 2),
		new Point(0, 1, 2),
		new Point(0, 1, 1),
		new Point(0, 0, 1)
	]));

	return knot.scale(Point.ORIGIN, 1 / 5).translate(-0.1, 0.15, 0.4).translate(origin.x, origin.y, origin.z);
}

module.exports = Knot;
