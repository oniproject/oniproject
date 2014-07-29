'use strict';

function Tileset(url, w, h, size) {
	this.width = w;
	this.height = h;
	this.size = size;

	var image = new PIXI.ImageLoader(url);
	var tiles = [];
	for(var y=0; y<h; y++) {
		for(var x=0; x<w; x++) {
			var rect = {
				x:  x*size.width, y:   y*size.height,
				width:size.width, height:size.height,};
			tiles.push(new PIXI.Texture(image.texture.baseTexture, rect));
		}
	}

	this.tiles = tiles;
	image.load();
}

// x and y for subtile
Tileset.prototype.at = function(i, x, y) {
	if(x === undefined && y === undefined) {
		return this.tiles[i];
	} else {
		// FIXME maybe memory leaks
		var t = this.tiles[i];
		var rect = {
			x: t.frame.x + x*this.size.width/2,
			y: t.frame.y + y*this.size.height/2,
			width:this.size.width/2, height:this.size.height/2,};
		return new PIXI.Texture(t, rect);
	}
}

module.exports = Tileset;
