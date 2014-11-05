'use strict';

function Item(type) {
	var w = 32 * 3,
		h = 32 * 10;
	var image = new PIXI.ImageLoader('/items.png');
	this._type = type;

	var textures = this.textures = [];

	for (var y = 0; y < 10; y++) {
		for (var x = 0; x < 3; x++) {
			var rect = {
				x: x * 32,
				y: y * 32,
				width: 32,
				height: 32,
			};
			var t = new PIXI.Texture(image.texture.baseTexture, rect);
			textures.push(t);
		}
	}

	PIXI.Sprite.call(this, textures[type]);

	image.load();
	this.image = image;
}

Item.prototype = Object.create(PIXI.Sprite.prototype);
Item.prototype.constructor = Item;

Object.defineProperty(Item.prototype, 'type', {
	get: function() {
		return this._type;
	},
	set: function(type) {
		this.setTexture(this.textures[type]);
		this._type = type;
	}
});

module.exports = Item;
