'use strict';

function TileLayer(data, tilesets, tilewidth, tileheight, renderorder) {
	PIXI.SpriteBatch.call(this);

	this.data = data;
	this.tilesets = tilesets;

	this.position.x = data.x || 0;
	this.position.y = data.y || 0;
	if (data.opacity === undefined) {
		data.opacity = 1;
	}
	this.alpha = data.opacity;
	this.visible = !!data.visible;

	this._animated = [];

	for (var y = 0; y < data.height; y++) {
		for (var x = 0; x < data.width; x++) {
			var iii = y * data.width + x;
			var id = data.data[iii];
			found:
			for (var i = 0, l = tilesets.length; i < l; i++) {
				var t = tilesets[i];
				if (id - t.data.firstgid <= 0) {
					continue found;
				}
				var sprite = t.CreateSprite(id);

				if (sprite) {
					sprite.position.x = x * tilewidth + data.x;
					sprite.position.y = y * tileheight + data.y;

					if (t.data.tileoffset) {
						sprite.position.x += t.data.tileoffset.x;
						sprite.position.y += t.data.tileoffset.y;
					}

					if (sprite.textures) {
						this._animated.push(sprite);
					}

					this.addChild(sprite);
					break found;
				}
			}
		}
	}

	this.cacheAsBitmap = this._animated.length === 0;
}

TileLayer.prototype = Object.create(PIXI.SpriteBatch.prototype);
TileLayer.constructor = TileLayer;

TileLayer.prototype.updateTransform = function() {
	var _animated = this._animated;
	for (var i = 0, l = _animated.length; i < l; i++) {
		_animated[i].updateTransform();
	}
	PIXI.SpriteBatch.prototype.updateTransform.call(this);
};

module.exports = TileLayer;
