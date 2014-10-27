'use strict';

console.log('start');

var Vue = require('vue');
var app = new Vue(require('./index'));




//window.Outside = [tilemaps.Outside_A1, tilemaps.Outside_A2, tilemaps.Outside_A3, tilemaps.Outside_A4, tilemaps.Outside_A5, tilemaps.Outside_B, tilemaps.Outside_C];

window.scene = app.$options.scene;

var nn = 31,
	data = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, nn, 0, nn, nn, nn, 0],
		[0, nn, 0, nn, 0, 0, 0],
		[0, nn, 0, nn, 0, 0, 0],
		[0, nn, nn, nn, nn, nn, 0],
		[0, 0, 0, nn, 0, nn, 0],
		[0, 0, 0, nn, 0, nn, 0],
		[0, nn, nn, nn, 0, nn, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, nn, nn, nn, 0, 0, 0],
		[0, nn, 0, nn, 0, 0, 0],
		[0, nn, nn, nn, 0, 0, 0],
		[0, 0, nn, nn, nn, 0, 0],
		[0, 0, 0, nn, nn, 0, 0],
		[0, 0, 0, nn, nn, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
	];
for (var y = 0, ml = data.length; y < ml; y++) {
	var line = data[y];
	for (var x = 0, ll = line.length; x < ll; x++) {
		var nnn = data[y][x];
		if (nnn) {
			scene.setAt(x, y, 'first', 0, [0, 1, 2], true);
			scene.setAt(x, y, 'second', 0, 3, true);
		} else {
			scene.setAt(x, y, 'first', 0, [0, 1, 2], true);
		}
	}
}

var w = $('#canvas').width(),
	h = $('#canvas').height(),
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h);

stage.interactive = true;
$('#canvas').append(renderer.view);
stage.addChild(scene);

var originX = 32 * 10,
	originY = 32 * 2,
	moveSpeed = 32,
	keyCodes = {
		37: function(event) {
			originX += moveSpeed;
			resize();
		},
		38: function(event) {
			originY += moveSpeed;
			resize();
		},
		39: function(event) {
			originX -= moveSpeed;
			resize();
		},
		40: function(event) {
			originY -= moveSpeed;
			resize();
		},
	}
document.onkeydown = function(event) {
	var f = keyCodes[event.keyCode];
	if (f) {
		event.preventDefault();
		f(event);
	}
}

window.onresize = resize;
resize();

function resize() {
	w = $('#canvas').width();
	h = $('#canvas').height();

	scene.position.x = originX;
	scene.position.y = originY;

	renderer.resize(w, h);
}

requestAnimFrame(animate);

function animate() {
	renderer.render(stage);
	requestAnimFrame(animate);
}

var type = app.$.palete;

stage.click = function(event) {
	var loc = event.getLocalPosition(scene),
		x = loc.x / 32 | 0,
		y = loc.y / 32 | 0;
	if (type.$data.isFill) {
		scene.Fill(x, y, type.$data.layer, type.$data.t, type.$data.v, type.$data.auto);
	} else {
		scene.setAt(x, y, type.$data.layer, type.$data.t, type.$data.v, type.$data.auto);
	}
	console.log(x, y, type.$data);
}
