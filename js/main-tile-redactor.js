'use strict';

console.log('start');

var Tileset = require('./tileset');
var Tilemap = require('./tilemap');



var WH = {width:32, height:32};
var World_A1 = new Tileset('/game/World_A1.png', 16, 12, WH);
var World_A2 = new Tileset('/game/World_A2.png', 16, 12, WH);
var World_B = new Tileset('/game/World_B.png', 16, 16, WH);

var Outside_A1 = new Tileset('/game/Outside_A1.png', 16, 12, WH); // Animation
var Outside_A2 = new Tileset('/game/Outside_A2.png', 16, 12, WH); // Ground
var Outside_A3 = new Tileset('/game/Outside_A3.png', 16, 8, WH);  // Buildings
var Outside_A4 = new Tileset('/game/Outside_A4.png', 16, 15, WH); // Walls
var Outside_A5 = new Tileset('/game/Outside_A5.png', 8, 16, WH);  // Normal
var Outside_B =  new Tileset('/game/Outside_B.png', 16, 16, WH);
var Outside_C =  new Tileset('/game/Outside_C.png', 16, 16, WH);

var nn = 31;

var data = [
	[0,0,0,0,0,0,0],
	[0,nn,0,nn,nn,nn,0],
	[0,nn,0,nn,0,0,0],
	[0,nn,0,nn,0,0,0],
	[0,nn,nn,nn,nn,nn,0],
	[0,0,0,nn,0,nn,0],
	[0,0,0,nn,0,nn,0],
	[0,nn,nn,nn,0,nn,0],
	[0,0,0,0,0,0,0],
	[0,nn,nn,nn,0,0,0],
	[0,nn,0,nn,0,0,0],
	[0,nn,nn,nn,0,0,0],
	[0,0,nn,nn,nn,0,0],
	[0,0,0,nn,nn,0,0],
	[0,0,0,nn,nn,0,0],
	[0,0,0,0,0,0,0],
];

//var amap = new AutoTilemap(amap, World_A2);







var w = $('#canvas').width(),
	h = $('#canvas').height(),
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h);

stage.interactive = true;
$('#canvas').append(renderer.view);

window.Outside = [Outside_A1, Outside_A2, Outside_A3, Outside_A4, Outside_A5, Outside_B, Outside_C];

window.scene = new Tilemap(20, 20, Outside);
for(var y=0, ml=data.length; y<ml; y++) {
	var line = data[y];
	for(var x=0, ll=line.length;x<ll; x++) {
		var nnn = data[y][x];
		if(nnn) {
			scene.setAt(x, y, 'second', 0, [0,1,2], true);
			scene.setAt(x, y, 'third', 0, 3, true);
		} else {
			scene.setAt(x, y, 'second', 0, [0,1,2], true);
		}
	}
}

stage.click = function(event) {
	var loc = event.getLocalPosition(scene);
	var x = loc.x/32|0;
	var y = loc.y/32|0;
	scene.setAt(x, y, 'second', 5, 5);
	console.log(x, y);
}

stage.addChild(scene);



var originX=32*10, originY=32*2, moveSpeed=32;
var keyCodes = {
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
