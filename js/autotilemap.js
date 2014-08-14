'use strict';

function _line(line, id, x) {
	if(line === undefined) return [true, true, true];

	var x1 = line[x-1];
	var x3 = line[x+1];
	x1 = (x1 === undefined)? true: x1===id;
	x3 = (x3 === undefined)? true: x3===id;
	return [x1, line[x] === id, x3];
}

function AutoTilemap(map, tileset) {
	var w = tileset.size.width;
	var h = tileset.size.height;
	var container
	var container = new PIXI.SpriteBatch();
	for(var y=0, ml=map.length; y<ml; y++) {
		var line = map[y];
		for(var x=0, ll=line.length;x<ll; x++) {
			var id = map[y][x];

			var neighbors = [];
			neighbors.push(_line(map[y-1], id, x))
			neighbors.push(_line(map[y+0], id, x))
			neighbors.push(_line(map[y+1], id, x))

			var textures = tileset.atAutoTile(id, neighbors);

			var s0 = new PIXI.Sprite(textures[0]);
			s0.position.x = x*w+0;
			s0.position.y = y*h+0;
			var s1 = new PIXI.Sprite(textures[1]);
			s1.position.x = x*w+w/2;
			s1.position.y = y*h+0;
			var s2 = new PIXI.Sprite(textures[2]);
			s2.position.x = x*w+0;
			s2.position.y = y*h+h/2;
			var s3 = new PIXI.Sprite(textures[3]);
			s3.position.x = x*w+w/2;
			s3.position.y = y*h+h/2;

			container.addChild(s0);
			container.addChild(s1);
			container.addChild(s2);
			container.addChild(s3);
		}
	}
	this.container = container;
}
module.exports = AutoTilemap;
