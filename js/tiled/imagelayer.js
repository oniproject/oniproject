'use strict';

function ImageLayer(data, path) {
	var image = this.image = new PIXI.ImageLoader(path + data.image);
	PIXI.Sprite.call(this, image.texture);

	this.position.x = data.x || 0;
	this.position.y = data.y || 0;
	this.alpha = data.opacity || 1;
	this.visible = !!data.visible;
}

ImageLayer.prototype = Object.create(PIXI.Sprite.prototype);
ImageLayer.constructor = ImageLayer;

ImageLayer.prototype.load = function(fn) {
	if (fn) {
		this.image.on('loaded', fn);
	}
	this.image.load();
}

module.exports = ImageLayer;
