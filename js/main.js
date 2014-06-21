"use strict";

console.log("fuck");

var Isomer = require('isomer');
var Map = require('./map');
var Avatar = require('./avatar');

/* Some convenient renames */
var Point = Isomer.Point;
var Path = Isomer.Path;
var Shape = Isomer.Shape;
var Color = Isomer.Color;

var Stairs = require('./stairs');
var Octahedron = require('./octahedron');
var Knot = require('./knot');

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

var avatar = new Avatar();
var map = new Map(iso);
map.objects = require('./test-map').objects;

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
	iso.reorigin(avatar.position);
}

function move(path) {
	avatar.move(path);

	iso.reorigin(avatar.position);
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

requestAnimFrame(render);
function render() {
	renderer.render(stage);
	requestAnimFrame(render);
}

setInterval(animate, 1000.0 / 60);
function animate() {
	graphics.clear();

	map.render(iso);

	iso.add(Stairs(new Point(-1, 0, 0)));
	iso.add(Stairs(new Point(0, 3, 1)).rotateZ(new Point(0.5, 3.5, 1), -Math.PI / 2));
	iso.add(Stairs(new Point(2, 0, 2)).rotateZ(new Point(2.5, 0.5, 0), -Math.PI / 2));

	avatar.draw(iso);
}

