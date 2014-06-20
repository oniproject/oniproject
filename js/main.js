"use strict";

console.log("fuck");

var Isomer = require('isomer');
var Map = require('./map');

/* Some convenient renames */
var Point = Isomer.Point;
var Path = Isomer.Path;
var Shape = Isomer.Shape;
var Color = Isomer.Color;

var Stairs = require('./stairs');
var Octahedron = require('./octahedron');
var Knot = require('./knot');


var angle = 0;
var position = new Point(3, 2, 3.2);
var velocity = 1.0;

var w = window.innerWidth,
	h = window.innerHeight,
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h);
document.body.appendChild(renderer.view);

var graphics = new PIXI.Graphics();
stage.addChild(graphics);


graphics.path = function (points, color) {
	var c = color.r * 256 * 256 + color.g * 256 + color.b;
	this.beginFill(c, color.a);
	this.moveTo(points[0].x, points[0].y);

	for (var i = 1; i < points.length; i++) {
		this.lineTo(points[i].x, points[i].y);
	}

	this.endFill();
}
graphics.getContext = function() {
	return this;
}

var iso = new Isomer(graphics);
iso.lightColor = new Isomer.Color(0xFF, 0xCC, 0xCC);
iso.colorDifference = 0.2;
iso.canvas = graphics;

iso.reorigin = function(point) {
	var xMap = new Point(point.x * this.transformation[0][0],
					   point.x * this.transformation[0][1]);

	var yMap = new Point(point.y * this.transformation[1][0],
					   point.y * this.transformation[1][1]);

	this.originX = - xMap.x - yMap.x + (iso.canvas.width / 2.0);
	this.originY = + xMap.y + yMap.y + (point.z * this.scale) + (iso.canvas.height / 2.0);
}


window.onresize = resize;
resize();
function resize() {
	w = window.innerWidth;
	h = window.innerHeight;

	graphics.width = w;
	graphics.height = h;

	renderer.resize(w, h);
	iso.reorigin(position);
}

function move(path) {
	for(var i=0, l=path.length; i<l; i++) {
		var dir = path[i];
		switch(dir) {
		case 'N':
			position.x += velocity;
			break;
		case 'W':
			position.y += velocity;
			break;
		case 'S':
			position.x -= velocity;
			break;
		case 'E':
			position.y -= velocity;
			break;
		}
	}

	iso.reorigin(position);
}


var listener = new window.keypress.Listener();

var move_combos_view = [
	{keys:'w',   on_keyup: function() { move('NW'); }, },
	{keys:'a',   on_keyup: function() { move('SW'); }, },
	{keys:'s',   on_keyup: function() { move('SE'); }, },
	{keys:'d',   on_keyup: function() { move('NE'); }, },
	{keys:'w a', on_keyup: function() {  move('W'); }, },
	{keys:'w d', on_keyup: function() {  move('N'); }, },
	{keys:'s a', on_keyup: function() {  move('S'); }, },
	{keys:'s d', on_keyup: function() {  move('E'); }, },
];

var move_combos_iso = [
	{keys:'w',   on_keyup: function() {  move('N'); }, },
	{keys:'a',   on_keyup: function() {  move('W'); }, },
	{keys:'s',   on_keyup: function() {  move('S'); }, },
	{keys:'d',   on_keyup: function() {  move('E'); }, },
	{keys:'w a', on_keyup: function() { move('NW'); }, },
	{keys:'w d', on_keyup: function() { move('NE'); }, },
	{keys:'s a', on_keyup: function() { move('SW'); }, },
	{keys:'s d', on_keyup: function() { move('SE'); }, },
];

for(var i=0, l=move_combos_iso.length; i<l; i++) {
	var combo = move_combos_iso[i];
	combo['is_exclusive'] = true;
	combo['is_unordered'] = true;
}
for(var i=0, l=move_combos_view.length; i<l; i++) {
	var combo = move_combos_view[i];
	combo['is_exclusive'] = true;
	combo['is_unordered'] = true;
}

listener.register_many(move_combos_view);

function scene() {
	graphics.clear();

	/* Add some levels */

	iso.add(Shape.Prism(new Point(1, 0, 0), 4, 4, 2));
	iso.add(Shape.Prism(new Point(0, 0, 0), 1, 4, 1));
	iso.add(Shape.Prism(new Point(-1, 1, 0), 1, 3, 1));

	/* Some stair cases */
	iso.add(Stairs(new Point(-1, 0, 0)));

	/* Rotate this one */
	iso.add(Stairs(new Point(0, 3, 1)).rotateZ(new Point(0.5, 3.5, 1), -Math.PI / 2));

	/* Some more levels and stairs */
	iso.add(Shape.Prism(new Point(3, 0, 2), 2, 4, 1));
	iso.add(Shape.Prism(new Point(2, 1, 2), 1, 3, 1));

	iso.add(Stairs(new Point(2, 0, 2)).rotateZ(new Point(2.5, 0.5, 0), -Math.PI / 2));

	/* Add some colorful pyramids */
	iso.add(Shape.Pyramid(new Point(2, 3, 3))
		.scale(new Point(2, 4, 3), 0.5),
	new Color(180, 180, 0));
	iso.add(Shape.Pyramid(new Point(4, 3, 3))
		.scale(new Point(5, 4, 3), 0.5),
	new Color(180, 0, 180));
	iso.add(Shape.Pyramid(new Point(4, 1, 3))
		.scale(new Point(5, 1, 3), 0.5),
	new Color(0, 180, 180));
	iso.add(Shape.Pyramid(new Point(2, 1, 3))
		.scale(new Point(2, 1, 3), 0.5),
	new Color(40, 180, 40));

	/* Add a knot with a short platform */
	iso.add(Shape.Prism(new Point(3, 2, 3), 1, 1, 0.2), new Color(50, 50, 50));

	/* Draw a spinning octahedron as our centerpiece */
	iso.add(Octahedron(position)
		.rotateZ(new Point(position.x +0.5, position.y +0.5, position.z +0.5), angle), new Color(0, 180, 180));

	var pos = new Point(position.x, position.y);
	iso.add(Knot(pos), new Color(0xCC, 0, 0));

	//iso.add(Shape.Prism(new Point(0, 0, 0), 2, 1, 1), new Color(0, 0, 255));
	iso.add(Shape.Prism(new Point(0, 0, 0), 1, 2, 1), new Color(0, 0, 255));
	//iso.add(Shape.Prism(new Point(0, 0, 0), 1, 1, 2), new Color(0, 0, 255));
	iso.add(Shape.Prism(new Point(0, 0, 0), 1, 1, 1), new Color(0, 0, 255));

	angle += 2 * Math.PI / 60;
}

setInterval(scene, 100);


/*  utils end */

requestAnimFrame(animate);

function animate() {
	renderer.render(stage);
	requestAnimFrame(animate);
}
