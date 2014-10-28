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

	var x_start = 0,
		x_end = data.width,
		x_add = 1;
	var y_start = 0,
		y_end = data.height,
		y_add = 1;

	/*if(renderorder) {
		if(renderorder.indexOf('up') != -1) {
			y_start = data.height;
			y_end = 0;
			y_add = -1;
		}
		if(renderorder.indexOf('left') != -1) {
			x_start = data.width;
			x_end = 0;
			x_add = -1;
		}
	}*/

	this._animated = [];

	for (var y = y_start; y < y_end; y += y_add) {
		for (var x = x_start; x < x_end; x += x_add) {
			var iii = y * data.width + x;
			var id = data.data[iii];
			found:
			for (var i = 0, l = tilesets.length; i < l; i++) {
				var t = tilesets[i];
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
}

TileLayer.prototype = Object.create(PIXI.SpriteBatch.prototype);
TileLayer.constructor = TileLayer;

TileLayer.prototype.updateTransform = function() {
	var _animated = this._animated;
	for (var i = 0, l = _animated.length; i < l; i++) {
		_animated[i].updateTransform();
	}
	PIXI.SpriteBatch.prototype.updateTransform.call(this);
}


module.exports = TileLayer;
