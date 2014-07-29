'use strict';

function Tilemap(map, tileset) {
	var w = tileset.size.width;
	var h = tileset.size.height;
	var container = new PIXI.SpriteBatch();
	for(var y=0, ml=map.length; y<ml; y++) {
		var line = map[y];
		for(var x=0, ll=line.length;x<ll; x++) {
			var s = new PIXI.Sprite(tileset.at(map[y][x]));
			s.position.x = x*w;
			s.position.y = y*h;
			container.addChild(s);
		}
	}
	this.container = container;
}

module.exports = Tilemap;
