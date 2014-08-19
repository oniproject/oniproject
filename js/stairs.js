'use strict';

var Isomer = require('isomer'),
	/* Some convenient renames */
	Path = Isomer.Path,
	Shape = Isomer.Shape;

/* Draws some stars at a given point */
function Stairs(origin) {
	var STEP_COUNT = 10,
		/* Create a zig-zag */
		zigzag = new Path(origin),
		steps = [],
		i,
		/* Shape to return */
		stairs = new Shape();

	for (i = 0; i < STEP_COUNT; i++) {
		/**
		 *  2
		 * __
		 *   | 1
		 */

		var stepCorner = origin.translate(0, i / STEP_COUNT, (i + 1) / STEP_COUNT);
		/* Draw two planes */
		steps.push(new Path([
			stepCorner,
			stepCorner.translate(0, 0, -1 / STEP_COUNT),
			stepCorner.translate(1, 0, -1 / STEP_COUNT),
			stepCorner.translate(1, 0, 0)
		]));

		steps.push(new Path([
			stepCorner,
			stepCorner.translate(1, 0, 0),
			stepCorner.translate(1, 1 / STEP_COUNT, 0),
			stepCorner.translate(0, 1 / STEP_COUNT, 0)
		]));

		zigzag.push(stepCorner);
		zigzag.push(stepCorner.translate(0, 1 / STEP_COUNT, 0));
	}

	zigzag.push(origin.translate(0, 1, 0));

	for (i = 0; i < steps.length; i++) {
		stairs.push(steps[i]);
	}
	stairs.push(zigzag);
	stairs.push(zigzag.reverse().translate(1, 0, 0));

	return stairs;
}

module.exports = Stairs;
