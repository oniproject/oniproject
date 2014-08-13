'use strict';

console.log('start');

var AutoTilemap = require('./autotilemap');
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

var World_A2 = new Tileset('/game/World_A2.png', 16, 12, WH);
var World_B = new Tileset('/game/World_B.png', 16, 16, WH);

var map = [
	[1,2,3,4],
	[3,1,4,1],
	[3,0,9,10],
	[3,1,4,1],
];
var tilemap = new Tilemap(map, World_B);

var nn = 31;

var amap = [
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

var amap = new AutoTilemap(amap, World_A2);




var TileScene = function(w, h, tilesets) {
	PIXI.DisplayObjectContainer.call(this);

	this.w = w;
	this.h = h;
	this.tilesets = tilesets;

	this.step = 0;

	var data = {
		first: [],
		second: [],
		//objects: [],
		third: [],
	};
	this.data = data;

	this.first = new PIXI.SpriteBatch();
	this.second = new PIXI.SpriteBatch();
	this.third = new PIXI.SpriteBatch();
	this.objects = new PIXI.DisplayObjectContainer();
	this.addChild(this.first);
	this.addChild(this.second);
	this.addChild(this.objects);
	this.addChild(this.third);
	this.third.alpha = 0.1;

	for (var y=0; y<h; y++) {
		data.first.push(new Array(w));
		data.second.push(new Array(w));
		//data.objects.push(new Array(w));
		data.third.push(new Array(w));
		for (var x=0; x<w; x++) {
			// t is a tileset
			// v is a tile number
			// if v is array it animated tile
			data.first[y][x] = {t:0, v:0};
			data.second[y][x] = {t:0, v:0};
			//data.objects[y][x] = 0;
			data.third[y][x] = {t:0, v:0};
			this.setAt(x, y, 'first', 0, [1, 3, 5]);
			this.setAt(x, y, 'second', 0, 31, true);
			this.setAt(x, y, 'third', 0, [0, 1, 2], true);
		}
	}
}

TileScene.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
TileScene.constructor = TileScene;

function cleanLastSprites(layer, tile) {
	if(tile.hasOwnProperty('s')) {
		if(tile.s instanceof Array) {
			for(var i=0, l=tile.s.length; i<l; i++) {
				layer.removeChild(tile.s[i]);
			}
		} else {
			layer.removeChild(tile.s);
		}
	}
}

function _line(line, id, x) {
	if(line === undefined) return [true, true, true];

	var x1 = line[x-1];
	var x3 = line[x+1];
	x1 = (x1 === undefined)? true: x1===id;
	x3 = (x3 === undefined)? true: x3===id;
	return [x1, line[x] === id, x3];
}

function _addAuto(layer, tileset, id, x, y, frame) {
	var w = tileset.size.width;
	var h = tileset.size.height;

	var neighbors = [];
	neighbors.push(_line(layer[y-1], id, x));
	neighbors.push(_line(layer[y+0], id, x));
	neighbors.push(_line(layer[y+1], id, x));

	var textures = AutoTilemap.prototype.atAutoTile.call(null, tileset, id, neighbors);

	var s0 = new PIXI.Sprite(textures[0]);
	s0.position.x = x*w+0;
	s0.position.y = y*h+0;
	s0.frame = frame;
	var s1 = new PIXI.Sprite(textures[1]);
	s1.position.x = x*w+w/2;
	s1.position.y = y*h+0;
	s1.frame = frame;
	var s2 = new PIXI.Sprite(textures[2]);
	s2.position.x = x*w+0;
	s2.position.y = y*h+h/2;
	s2.frame = frame;
	var s3 = new PIXI.Sprite(textures[3]);
	s3.position.x = x*w+w/2;
	s3.position.y = y*h+h/2;
	s3.frame = frame;

	layer.addChild(s0);
	layer.addChild(s1);
	layer.addChild(s2);
	layer.addChild(s3);
	return [s0, s1, s2, s3];
}

TileScene.prototype.setAt = function(x, y, layer, t, v, auto) {
	if(x<0 || x>this.w) { throw 'Fail X'; }
	if(y<0 || y>this.h) { throw 'Fail Y'; }

	if(!this.data.hasOwnProperty(layer) || layer === 'objects') { throw 'Fail Layer'; }

	var tile = this.data[layer][y][x];
	tile.t = t;
	tile.v = v;
	tile.auto = auto;

	cleanLastSprites(this[layer], tile);

	var tileset = this.tilesets[t];

	// TODO autotiles

	if(typeof v === 'number') {
		if(tile.auto) {
			tile.s = _addAuto(this[layer], tileset, tile.v, x, y);
		} else {
			var s = new PIXI.Sprite(tileset.at(v));
			s.position.x = x * tileset.size.width;
			s.position.y = y * tileset.size.height;
			this[layer].addChild(s);
			tile.s = s;
		}
	} else if(v instanceof Array) {
		tile.s = [];
		for (var i=0, l=v.length; i<l; i++) {
			if(tile.auto) {
				var s = _addAuto(this[layer], tileset, tile.v[i], x, y, i);
				tile.s = tile.s.concat(s);
			} else {
				var s = new PIXI.Sprite(tileset.at(v[i]));
				s.position.x = x * tileset.size.width;
				s.position.y = y * tileset.size.height;
				s.frame = i; // for animation
				this[layer].addChild(s);
				tile.s.push(s);
			}
		}
	}

}

TileScene.prototype.updateTransform = function() {
	PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);

	var frame = this.step + 0.05;
	var round = (frame) |0;
	if(round === 3) { round = 0; }
	this.step = frame % 3;

	var data = this.data,
		w = this.w,
		h = this.h;

	if(round == this.lastRount) return;
	this.lastRount = round;

	for (var y=0; y<h; y++) {
		for (var x=0; x<w; x++) {
			var tile = data.first[y][x];
			if(tile.v instanceof Array && tile.s) {
				for (var i=0, l=tile.s.length; i<l; i++) {
					var s = tile.s[i];
					s.visible = s.frame === round;
				}
			}
			var tile = data.second[y][x];
			if(tile.v instanceof Array && tile.s) {
				for (var i=0, l=tile.s.length; i<l; i++) {
					var s = tile.s[i];
					s.visible = s.frame === round;
				}
			}
			var tile = data.third[y][x];
			if(tile.v instanceof Array && tile.s) {
				for (var i=0, l=tile.s.length; i<l; i++) {
					var s = tile.s[i];
					s.visible = s.frame === round;
				}
			}
		}
	}
}



var w = $('#canvas').width(),
	h = $('#canvas').height(),
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h);

$('#canvas').append(renderer.view);



stage.addChild(tilemap.container);
stage.addChild(amap.container);

var Outside = [Outside_A1, Outside_A2, Outside_A3, Outside_A4, Outside_A5, Outside_B, Outside_C];

window.scene = new TileScene(20, 20, Outside);

stage.addChild(scene);




window.onresize = resize;
resize();
function resize() {
	w = $('#canvas').width();
	h = $('#canvas').height();

	renderer.resize(w, h);
	//iso.canvas._width = w;
	//iso.canvas._height = h;
	//iso.originX = w / 2 + originX;
	//iso.originY = h * 0.9 + originY;
}

requestAnimFrame(animate);

function animate() {
	//redactor.render();

	renderer.render(stage);
	requestAnimFrame(animate);
}
