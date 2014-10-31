'use strict';

function Tileset(data, path, tilewidth, tileheight) {
	this.data = data;

	if (!data.tiles) {
		data.tiles = {};
	}

	if (!tilewidth) {
		tilewidth = data.tilewidth;
	}
	if (!tileheight) {
		tileheight = data.tileheight;
	}

	var image = this.image = new PIXI.ImageLoader(path + data.image);

	var tiles = this.tiles = [];

	var ww = 0,
		hh = 0;
	for (var y = data.margin; y < data.imageheight; y += tileheight + data.spacing) {
		hh++;
		for (var x = data.margin; x < data.imagewidth; x += tilewidth + data.spacing) {
			var rect = {
				x: x,
				y: y,
				width: data.tilewidth,
				height: data.tileheight,
			};
			var t = new PIXI.Texture(image.texture.baseTexture, rect);
			tiles.push(t);
		}
	}


	/*for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var rect = {
				x: x * size.width,
				y: y * size.height,
				width: size.width,
				height: size.height,
			};
			tiles.push(new PIXI.Texture(image.texture.baseTexture, rect));
		}
	}*/

	/*this.name = "nvfjdklsvnfdjkls";
	this.firstgid = 1;
	this.image = "nvjfkdls";
	this.imagewidth = 423423;
	this.imageheight = 423423;

	this.margin = 1;
	this.spacing = 1;

	this.tilewidth = 32;
	this.tileheight = 32;

	this.tiles = [];
	*/
}

Tileset.prototype.load = function(fn) {
	if (fn) {
		this.image.on('loaded', fn);
	}
	this.image.load();
}


Tileset.prototype.CreateSprite = function(id) {
	if (id == 0) {
		return;
	}

	var data = this.data;
	id -= data.firstgid;
	var texture = this.tiles[id];


	if (!texture) {
		console.error('TEXTURE FAIL', data.name, id, id + data.firstgid, data.firstgid);
		return;
	}

	var sprite = new PIXI.Sprite(texture);
	sprite.data = data.tiles[id];


	if (sprite.data && sprite.data.animation) {
		sprite.last = window.performance.now();
		sprite.currentFrame = 0;
		sprite.updateTransform = updateTransform;

		sprite.textures = [];
		for (var i = 0, l = sprite.data.animation.length; i < l; i++) {
			var t = sprite.data.animation[i];
			sprite.textures.push(this.tiles[t.tileid]);
		}
	}

	return sprite;
}

function updateTransform() {
	PIXI.Sprite.prototype.updateTransform.call(this);

	if (!this.textures) return;

	var time = window.performance.now();
	var frame = this.data.animation[this.currentFrame];

	if (time - this.last > frame.duration) {
		this.currentFrame++;
		if (this.currentFrame >= this.data.animation.length) {
			this.currentFrame = 0;
		}

		this.setTexture(this.textures[this.currentFrame]);

		this.last += frame.duration;
	}
}

module.exports = Tileset;
