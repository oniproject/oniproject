'use strict';

console.log('start');

var AutoTilemap = require('./autotilemap');
var Tileset = require('./tileset');
var Tilemap = require('./tilemap');



var WH = {width:32, height:32};
var World_A1 = new Tileset('/game/World_A1.png', 16, 12, WH);
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
			this.setAt(x, y, 'first', 0, 2);
			this.setAt(x, y, 'second', 0, 17);
			this.setAt(x, y, 'third', 0, 16);
		}
	}
}

TileScene.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
TileScene.constructor = TileScene;

TileScene.prototype.setAt = function(x, y, layer, t, v) {
	if(x<0 || x>this.w) { throw "Fail X"; }
	if(y<0 || y>this.h) { throw "Fail Y"; }

	if(!this.data.hasOwnProperty(layer) || layer === 'objects') { throw "Fail Layer"; }

	var tile = this.data[layer][y][x];
	tile.t = t;
	tile.v = v;

	var tile_img = null;
	if(typeof v === 'number') {
		tile_img = this.tilesets[t].at(v);
	} else {
		tile_img = this.tilesets[t].at(v[step]);
	}

	// TODO autotiles

	var s = new PIXI.Sprite(tile_img);
	s.position.x = x * this.w;
	s.position.y = y * this.h;

	if(tile.hasOwnProperty('s')) {
		this[layer].removeChild(tile.s);
	}
	this[layer].addChild(s);
	tile.s = s;
}



var w = $('#canvas').width(),
	h = $('#canvas').height(),
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h);

$('#canvas').append(renderer.view);



stage.addChild(tilemap.container);
stage.addChild(amap.container);

window.scene = new TileScene(20, 20, [World_B]);

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
