(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

console.log('start');

var Tileset = require('./tileset'),
	Tilemap = require('./tilemap'),
	WH = {
		width: 32,
		height: 32
	},
	World_A1 = new Tileset('/game/World_A1.png', 16, 12, WH),
	World_A2 = new Tileset('/game/World_A2.png', 16, 12, WH),
	World_B = new Tileset('/game/World_B.png', 16, 16, WH),

	Outside_A1 = new Tileset('/game/Outside_A1.png', 16, 12, WH), // Animation
	Outside_A2 = new Tileset('/game/Outside_A2.png', 16, 12, WH), // Ground
	Outside_A3 = new Tileset('/game/Outside_A3.png', 16, 8, WH), // Buildings
	Outside_A4 = new Tileset('/game/Outside_A4.png', 16, 15, WH), // Walls
	Outside_A5 = new Tileset('/game/Outside_A5.png', 8, 16, WH), // Normal
	Outside_B = new Tileset('/game/Outside_B.png', 16, 16, WH),
	Outside_C = new Tileset('/game/Outside_C.png', 16, 16, WH),

	nn = 31,

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
	],
	w = $('#canvas').width(),
	h = $('#canvas').height(),
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h);

stage.interactive = true;
$('#canvas').append(renderer.view);

window.Outside = [Outside_A1, Outside_A2, Outside_A3, Outside_A4, Outside_A5, Outside_B, Outside_C];

window.scene = new Tilemap(20, 20, Outside);
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

var type = new Vue({
	el: '#palete',
	data: {
		layer: 'first',
		isFill: false,
		t: 0,
		v: 0,
		auto: false,
		//{ img: "", x: 0, y:0 },
		A1: [],
		A2: [],
		A3: [],
		A4: [],
		A5: [],
		B: [],
		C: [],
		D: [],
		E: [],
	},
	methods: {
		setActive: function(a, i) {
			console.log(a, i);
			switch (a) {
				case 'A1':
					this.$data.auto = true;
					this.$data.t = 0;
					if (i % 2) {
						i -= 1;
						i *= 2;
						this.$data.v = i + 3;
						//this.$data.layer = 'second';
					} else {
						i *= 2;
						this.$data.v = [i, i + 1, i + 2];
						//this.$data.layer = 'first';
					}
					break;
				case 'A2':
					this.$data.auto = true;
					this.$data.t = 1;
					this.$data.v = i;
					//this.$data.layer = 'first';
					break;
				case 'A3':
					this.$data.auto = false;
					this.$data.t = 2;
					this.$data.v = i;
					//this.$data.layer = 'first';
					break;
				case 'A4':
					this.$data.auto = false;
					this.$data.t = 3;
					this.$data.v = i;
					//this.$data.layer = 'first';
					break;
				case 'A5':
					this.$data.auto = false;
					this.$data.t = 4;
					this.$data.v = i;
					//this.$data.layer = 'first';
					break;
				case 'B':
					this.$data.auto = false;
					this.$data.t = 5;
					this.$data.v = i;
					//this.$data.layer = 'first';
					break;
				case 'C':
					this.$data.auto = false;
					this.$data.t = 6;
					this.$data.v = i;
					//this.$data.layer = 'first';
					break;
				case 'D':
					this.$data.auto = false;
					this.$data.t = 7;
					this.$data.v = i;
					//this.$data.layer = 'first';
					break;
				case 'E':
					this.$data.auto = false;
					this.$data.t = 8;
					this.$data.v = i;
					//this.$data.layer = 'first';
					break;
			}
		},
	},
});

setTimeout(function() {
	for (var y = 0; y < 10; y += 3) {
		type.$data.A1.push({
			x: 0,
			y: -y,
			img: Outside[0].image.texture.baseTexture.source.src
		});
		type.$data.A1.push({
			x: -6,
			y: -y,
			img: Outside[0].image.texture.baseTexture.source.src
		});
		type.$data.A1.push({
			x: -8,
			y: -y,
			img: Outside[0].image.texture.baseTexture.source.src
		});
		type.$data.A1.push({
			x: 2,
			y: -y,
			img: Outside[0].image.texture.baseTexture.source.src
		});
	}
	for (var y = 0; y < 10; y += 3) {
		type.$data.A2.push({
			x: 0,
			y: -y,
			img: Outside[1].image.texture.baseTexture.source.src
		});
		type.$data.A2.push({
			x: -2,
			y: -y,
			img: Outside[1].image.texture.baseTexture.source.src
		});
		type.$data.A2.push({
			x: -4,
			y: -y,
			img: Outside[1].image.texture.baseTexture.source.src
		});
		type.$data.A2.push({
			x: -6,
			y: -y,
			img: Outside[1].image.texture.baseTexture.source.src
		});
		type.$data.A2.push({
			x: -8,
			y: -y,
			img: Outside[1].image.texture.baseTexture.source.src
		});
		type.$data.A2.push({
			x: -10,
			y: -y,
			img: Outside[1].image.texture.baseTexture.source.src
		});
		type.$data.A2.push({
			x: -12,
			y: -y,
			img: Outside[1].image.texture.baseTexture.source.src
		});
		type.$data.A2.push({
			x: -14,
			y: -y,
			img: Outside[1].image.texture.baseTexture.source.src
		});
	}
	for (var y = 0; y < 8; y++) {
		for (var x = 0; x < 16; x++) {
			type.$data.A3.push({
				x: -x,
				y: -y,
				img: Outside[2].image.texture.baseTexture.source.src
			});
		}
	}
	for (var y = 0; y < 15; y++) {
		for (var x = 0; x < 16; x++) {
			type.$data.A4.push({
				x: -x,
				y: -y,
				img: Outside[3].image.texture.baseTexture.source.src
			});
		}
	}
	for (var y = 0; y < 16; y++) {
		for (var x = 0; x < 8; x++) {
			type.$data.A5.push({
				x: -x,
				y: -y,
				img: Outside[4].image.texture.baseTexture.source.src
			});
		}
	}
	for (var y = 0; y < 16; y++) {
		for (var x = 0; x < 16; x++) {
			type.$data.B.push({
				x: -x,
				y: -y,
				img: Outside[5].image.texture.baseTexture.source.src
			});
		}
	}
	for (var y = 0; y < 16; y++) {
		for (var x = 0; x < 16; x++) {
			type.$data.C.push({
				x: -x,
				y: -y,
				img: Outside[6].image.texture.baseTexture.source.src
			});
		}
	}
}, 3000);

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

},{"./tilemap":2,"./tileset":3}],2:[function(require,module,exports){
'use strict';

var Tilemap = function(w, h, tilesets, data) {
	PIXI.DisplayObjectContainer.call(this);

	this.w = w;
	this.h = h;
	this.tilesets = tilesets;

	this.step = 0;

	if (!data) {
		data = {
			first: [],
			second: [],
			//objects: [],
			third: [],
		};
	}

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

	for (var y = 0; y < h; y++) {
		data.first.push(new Array(w));
		data.second.push(new Array(w));
		//data.objects.push(new Array(w));
		data.third.push(new Array(w));
		for (var x = 0; x < w; x++) {
			// t is a tileset
			// v is a tile number
			// if v is array it animated tile
			data.first[y][x] = null;
			data.second[y][x] = null;
			//data.objects[y][x] = 0;
			data.third[y][x] = null;
			//this._setAt(x, y, 'first', 0, [0, 1, 2], true);
			//this._setAt(x, y, 'second', 0, 3, true);
			//this._setAt(x, y, 'first', 5, 56);
			//this._setAt(x, y, 'second', 5, 56);
			//this._setAt(x, y, 'third', 5, 56);
		}
	}
}

Tilemap.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Tilemap.constructor = Tilemap;

function cleanLastSprites(layer, tile) {
	if (!tile) { return; }
	if (tile.hasOwnProperty('s')) {
		try {
			if (tile.s instanceof Array) {
				for (var i = 0, l = tile.s.length; i < l; i++) {
					layer.removeChild(tile.s[i]);
				}
			} else {
				layer.removeChild(tile.s);
			}
		} catch (e) {
			console.error(e);
		}
		delete tile.s;
	}
}

function _line(line, id, x) {
	var def = true;
	if (line === undefined) {
		return [true, true, true];
	}

	var lines = [line[x - 1], line[x], line[x + 1]];
	for (var i = 0, l = lines.length; i < l; i++) {
		var n = lines[i];
		if (n !== undefined && n !== null) {
			if (n.v instanceof Array) {
				n = n.v[0] === id;
			} else {
				n = n.v === id;
			}
		} else if (n === null) {
			n = false;
		} else {
			n = true;
		}
		lines[i] = n;
	}
	return lines;
}

function _addAuto(layer, map, tileset, tile, x, y, frame) {
	var w = tileset.size.width,
		h = tileset.size.height,
		id = (frame !== undefined) ? tile.v[frame] : tile.v,
		zeroId = (frame !== undefined) ? tile.v[0] : tile.v,
		neighbors = [];
	neighbors.push(_line(map[y - 1], zeroId, x));
	neighbors.push(_line(map[y + 0], zeroId, x));
	neighbors.push(_line(map[y + 1], zeroId, x));

	var textures = tileset.atAutoTile(id, neighbors),
		s0 = new PIXI.Sprite(textures[0]),
		s1 = new PIXI.Sprite(textures[1]),
		s2 = new PIXI.Sprite(textures[2]),
		s3 = new PIXI.Sprite(textures[3]);

	s0.position.x = x * w + 0;
	s0.position.y = y * h + 0;
	s0.frame = frame;

	s1.position.x = x * w + w / 2;
	s1.position.y = y * h + 0;
	s1.frame = frame;

	s2.position.x = x * w + 0;
	s2.position.y = y * h + h / 2;
	s2.frame = frame;

	s3.position.x = x * w + w / 2;
	s3.position.y = y * h + h / 2;
	s3.frame = frame;

	layer.addChild(s0);
	layer.addChild(s1);
	layer.addChild(s2);
	layer.addChild(s3);
	return [s0, s1, s2, s3];
}

Tilemap.prototype.redrawAt = function(x, y, layer) {
	try {
		var tile = this.data[layer][y][x];
		this._setAt(x, y, layer, tile.t, tile.v, tile.auto);
	}
	catch (e) {}
}

Tilemap.prototype.setAt = function(x, y, layer, t, v, auto) {
	this._setAt(x, y, layer, t, v, auto);

	switch (layer) {
		case 'first':
			cleanLastSprites(this.second, this.data.second[y][x]);
			this.data.second[y][x] = null;
			cleanLastSprites(this.third, this.data.third[y][x]);
			this.data.third[y][x] = null;
			break;
		case 'second':
			cleanLastSprites(this.third, this.data.third[y][x]);
			this.data.third[y][x] = null;
			break;
	}

	this.redrawAt(x - 1, y - 1, layer);
	this.redrawAt(x - 1, y, layer);
	this.redrawAt(x - 1, y + 1, layer);

	this.redrawAt(x, y - 1, layer);
	this.redrawAt(x, y + 1, layer);

	this.redrawAt(x + 1, y - 1, layer);
	this.redrawAt(x + 1, y, layer);
	this.redrawAt(x + 1, y + 1, layer);
}

Tilemap.prototype._setAt = function(x, y, layer, t, v, auto) {
	if (x < 0 || x > this.w) {
		throw 'Fail X';
	}
	if (y < 0 || y > this.h) {
		throw 'Fail Y';
	}

	if (!this.data.hasOwnProperty(layer) || layer === 'objects') {
		throw 'Fail Layer';
	}

	if (!this.data[layer][y][x]) {
		this.data[layer][y][x] = {t: 0, v: 0};
	}

	var tile = this.data[layer][y][x];
	tile.t = t;
	tile.v = v;
	tile.auto = auto;

	cleanLastSprites(this[layer], tile);

	var tileset = this.tilesets[t];

	if (typeof v === 'number') {
		if (tile.auto) {
			tile.s = _addAuto(this[layer], this.data[layer], tileset, tile, x, y);
		} else {
			var s = new PIXI.Sprite(tileset.at(v));
			s.position.x = x * tileset.size.width;
			s.position.y = y * tileset.size.height;
			this[layer].addChild(s);
			tile.s = s;
		}
	} else if (v instanceof Array) {
		tile.s = [];
		for (var i = 0, l = v.length; i < l; i++) {
			if (tile.auto) {
				var s = _addAuto(this[layer], this.data[layer], tileset, tile, x, y, i);
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

Tilemap.prototype.updateTransform = function() {
	PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);

	var frame = this.step + 0.05,
		round = (frame) | 0;
	if (round === 3) {
		round = 0;
	}
	this.step = frame % 3;

	var data = this.data,
		w = this.w,
		h = this.h;

	if (round == this.lastRount) { return; }
	this.lastRount = round;

	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var tile = data.first[y][x];
			if (tile && tile.v instanceof Array && tile.s) {
				for (var i = 0, l = tile.s.length; i < l; i++) {
					var s = tile.s[i];
					s.visible = s.frame === round;
				}
			}
			var tile = data.second[y][x];
			if (tile && tile.v instanceof Array && tile.s) {
				for (var i = 0, l = tile.s.length; i < l; i++) {
					var s = tile.s[i];
					s.visible = s.frame === round;
				}
			}
			var tile = data.third[y][x];
			if (tile && tile.v instanceof Array && tile.s) {
				for (var i = 0, l = tile.s.length; i < l; i++) {
					var s = tile.s[i];
					s.visible = s.frame === round;
				}
			}
		}
	}
}

Tilemap.prototype.Fill = function(x, y, _layer, t, v, auto) {
	var layer = this.data[_layer],
		north,
		south,
		Q = [{x: x, y: y}],
		empty = (layer[y][x]) ? layer[y][x].v : null,
		check = function(x, y) {
			if (y < 0 || y >= layer.length) { return false; }
			if (x < 0 || x >= layer[y].length) { return false; }
			if (!layer[y][x] && !empty) { return true; }
			if (!layer[y][x]) { return false; }

			var v = layer[y][x].v;
			if (typeof v === 'number' && typeof empty === 'number') {
				return v === empty;
			} else if (typeof v !== 'number' && typeof empty !== 'number') {
				if (!empty) { return false; }
				for (var i = 0, l = v.length; i < l; i++) {
					if (v[i] !== empty[i]) {
						return false;
					}
				}
				return true;
			}
			return false;
		};

	while (Q.length) {
		var N = Q.pop();
		x = N.x;
		y = N.y;

		if (check(x, y)) {
			north = south = y;
			do {
				north--;
			} while (check(x, north) && north >= 0);
			do {
				south++;
			} while (check(x, south) && south < layer.length);

			for (var n = north + 1; n < south; n++) {
				this.setAt(x, n, _layer, t, v, auto);
				if (check(x - 1, n)) {
					Q.push({
						x: x - 1,
						y: n,
					});
				}
				if (check(x + 1, n)) {
					Q.push({
						x: x + 1,
						y: n,
					});
				}
			}
		}
	}
}

module.exports = Tilemap;

},{}],3:[function(require,module,exports){
'use strict';

function Tileset(url, w, h, size) {
	this.width = w;
	this.height = h;
	this.size = size;

	var image = new PIXI.ImageLoader(url),
		tiles = [];
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var rect = {
				x: x * size.width,
				y: y * size.height,
				width: size.width,
				height: size.height,
			};
			tiles.push(new PIXI.Texture(image.texture.baseTexture, rect));
		}
	}

	this.tiles = tiles;
	image.load();
	this.image = image;
}

// x and y for subtile
Tileset.prototype.at = function(i, x, y) {
	if (x === undefined && y === undefined) {
		return this.tiles[i];
	} else {
		// FIXME maybe memory leaks
		var t = this.tiles[i],
			rect = {
				x: t.frame.x + x * this.size.width / 2,
				y: t.frame.y + y * this.size.height / 2,
				width: this.size.width / 2,
				height: this.size.height / 2,
			};
		return new PIXI.Texture(t, rect);
	}
}

/*
 * get
 *  [bool, bool, bool]
 *  [bool, xxxx, bool]
 *  [bool, bool, bool]
 * return
 *  [n, n]
 *  [n, n]
 */

Tileset.prototype.atAutoTile = function(id, neighbors) {
	/*
	 *   |**
	 *   |**
	 * --|--
	 * ↖↑|↑↗
	 * ←4|3→
	 * --|--
	 * ←2|1→
	 * ↙↓|↓↘
	 */
	var w = this.width >>> 1,
		x = (id % w) * 2,
		y = (id - id % w) / w * 3,
		map = [
			(y + 0) * this.width + x + 0,
			(y + 0) * this.width + x + 1,
			(y + 1) * this.width + x + 0,
			(y + 1) * this.width + x + 1,
			(y + 2) * this.width + x + 0,
			(y + 2) * this.width + x + 1,
		],
		one, two, three;

	// 2 3
	// 1 x
	one = neighbors[1][0];
	two = neighbors[0][0];
	three = neighbors[0][1];

	// 1↘  2↖ 3↑ 4← 5*
	var tleft = 2;
	if (one && !two && three) {
		tleft = 1;
	}
	if (one && two && three) {
		tleft = 5;
	}
	if (!one && three) {
		tleft = 4;
	}
	if (one && !three) {
		tleft = 3;
	}

	// 1 2
	// x 3
	one = neighbors[0][1];
	two = neighbors[0][2];
	three = neighbors[1][2];

	// 1↙ 2↑ 3↗ 4* 5→
	var tright = 3;
	if (one && !two && three) {
		tright = 1;
	}
	if (one && two && three) {
		tright = 4;
	}
	if (!one && three) {
		tright = 2;
	}
	if (one && !three) {
		tright = 5;
	}

	// 1 x
	// 2 3
	one = neighbors[1][0];
	two = neighbors[2][0];
	three = neighbors[2][1];

	// 1↗ 2← 3* 4↙ 5↓
	var dleft = 4;
	if (one && !two && three) {
		dleft = 1;
	}
	if (one && two && three) {
		dleft = 3;
	}
	if (!one && three) {
		dleft = 2;
	}
	if (one && !three) {
		dleft = 5;
	}

	// x 1
	// 3 2
	one = neighbors[1][2];
	two = neighbors[2][2];
	three = neighbors[2][1];
	// 1↖ 2* 3→ 4↓ 5↘
	var drigth = 5;
	if (one && !two && three) {
		drigth = 1;
	}
	if (one && two && three) {
		drigth = 2;
	}
	if (!one && three) {
		drigth = 3;
	}
	if (one && !three) {
		drigth = 4;
	}

	return [
		this.at(map[tleft], 0, 0),
		this.at(map[tright], 1, 0),
		this.at(map[dleft], 0, 1),
		this.at(map[drigth], 1, 1),
	];
}

module.exports = Tileset;

},{}]},{},[1])