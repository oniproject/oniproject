'use strict';

console.log("fuck");
var Net = require('./net');
var net = new Net('ws://localhost:2000/');
net.on('message', function(obj) {
	console.log('message', obj);
});

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

var iso = new Isomer(renderer.view);
iso.lightColor = new Isomer.Color(0xFF, 0xCC, 0xCC);
iso.colorDifference = 0.2;
iso.canvas = graphics;

var avatars = {4661: new Avatar()};
var player = 4661;
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
	iso.reorigin(avatars[player].position);
}

var listener = new window.keypress.Listener();

var dir=[' ', ' '];

var move_combos = [
	{keys:'w', on_keydown: function() { dir[0]='N'; }, on_keyup: function() { dir[0]=' '; }, },
	{keys:'a', on_keydown: function() { dir[1]='W'; }, on_keyup: function() { dir[1]=' '; }, },
	{keys:'s', on_keydown: function() { dir[0]='S'; }, on_keyup: function() { dir[0]=' '; }, },
	{keys:'d', on_keydown: function() { dir[1]='E'; }, on_keyup: function() { dir[1]=' '; }, },

	{keys:'e', on_keydown: function() { avatars[player].velocity.z=1; }, on_keyup: function() { avatars[player].velocity.z=0; }, },
	{keys:'q', on_keydown: function() { avatars[player].velocity.z=-1; }, on_keyup: function() { avatars[player].velocity.z=0; }, },
];

listener.register_many(move_combos);

requestAnimFrame(render);
function render() {
	requestAnimFrame(render);
	graphics.clear();

	map.render(iso);

	iso.add(Stairs(new Point(-1, 0, 0)));
	iso.add(Stairs(new Point(0, 3, 1)).rotateZ(new Point(0.5, 3.5, 1), -Math.PI / 2));
	iso.add(Stairs(new Point(2, 0, 2)).rotateZ(new Point(2.5, 0.5, 0), -Math.PI / 2));

	for(var i in avatars) {
		avatars[i].draw(iso);
	}

	renderer.render(stage);
}

setInterval(animate, 1000.0 / 30);
function animate() {
	avatars[player].move(dir.join(''));
	//net.send(new Float32Array([avatars[player].velocity.x, avatars[player].velocity.y]));
	net.send([avatars[player].velocity.x, avatars[player].velocity.y]);
	//net.send(avatars[player].velocity);


	for(var i in avatars) {
		avatars[i].update(1.0/30);
	}

	iso.reorigin(avatars[player].position);
}

