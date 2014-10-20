'use strict';

function ObjectGroup(data, tilesets) {
	PIXI.DisplayObjectContainer.call(this);
	var graphics = this.graphics = new PIXI.Graphics();
	this.addChild(graphics);

	this.data = data;
	this.tilesets = tilesets;

	this.position.x = data.x || 0;
	this.position.y = data.y || 0;
	this.alpha = data.opacity || 1;
	this.visible = !!data.visible;

	if(data.color) {
		var c = parseInt(data.color.slice(1), 16);
		graphics.lineStyle(2, c, 1);
	}

	for(var i=0, l=data.objects.length; i<l; i++) {
		var obj = data.objects[i];
		if(!obj.visible) {
			continue;
		}

		var x = obj.x, y = obj.y, w = obj.width, h = obj.height, r = obj.rotation;
		var w2 = w/2, h2 = h/2;
		if (obj.gid) {
			for (var j=0, ll = tilesets.length; j<ll; j++) {
				var t = tilesets[j];
				var sprite = t.CreateSprite(obj.gid);

				if(sprite) {
					sprite.position.x = x;
					sprite.position.y = y - sprite.height; // XXX

					if(t.data.tileoffset) {
						sprite.position.x += t.data.tileoffset.x;
						sprite.position.y += t.data.tileoffset.y;
					}

					this.addChild(sprite);
					break;
				}
			}
		} else if (obj.polyline) {
			// TODO
		} else if (obj.ellipse) {
			// TODO
			graphics.drawEllipse(x + w2, y + h2, w2, h2);
		} else if (obj.polygon) {
			// TODO
		} else {
			// TODO rect
			graphics.drawRect(x, y, w, h);
		}
	}
}

ObjectGroup.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
ObjectGroup.constructor = ObjectGroup;

module.exports = ObjectGroup;
