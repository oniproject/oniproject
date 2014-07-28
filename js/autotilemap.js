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

			var textures = this.atAutoTile(tileset, id, neighbors);

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

/*
 * get
 *  [bool, bool, bool]
 *  [bool, xxxx, bool]
 *  [bool, bool, bool]
 * return
 *  [n, n]
 *  [n, n]
 */

AutoTilemap.prototype.atAutoTile = function(tileset, id, neighbors) {
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
	var w = tileset.width>>>1;
	var x = (id%w) *2;
	var y = (id - id%w)/w *3
	var map =  [
		(y +0)*tileset.width + x +0, (y +0)*tileset.width + x +1,
		(y +1)*tileset.width + x +0, (y +1)*tileset.width + x +1,
		(y +2)*tileset.width + x +0, (y +2)*tileset.width + x +1,
	];

	var one, two, three;

	// 2 3
	// 1 x
	one   = neighbors[1][0];
	two   = neighbors[0][0];
	three = neighbors[0][1];

	// 1↘  2↖ 3↑ 4← 5*
	var tleft = 2;
	if(one && !two && three) { tleft = 1; }
	if(one && two && three)  { tleft = 5; }
	if(!one && three)        { tleft = 4; }
	if(one && !three)        { tleft = 3; }

	// 1 2
	// x 3
	one   = neighbors[0][1];
	two   = neighbors[0][2];
	three = neighbors[1][2];

	// 1↙ 2↑ 3↗ 4* 5→
	var tright = 3;
	if(one && !two && three) { tright = 1; }
	if(one && two && three)  { tright = 4; }
	if(!one && three)        { tright = 2; }
	if(one && !three)        { tright = 5; }

	// 1 x
	// 2 3
	one   = neighbors[1][0];
	two   = neighbors[2][0];
	three = neighbors[2][1];

	// 1↗ 2← 3* 4↙ 5↓
	var dleft =4;
	if(one && !two && three) { dleft = 1; }
	if(one && two && three)  { dleft = 3; }
	if(!one && three)        { dleft = 2; }
	if(one && !three)        { dleft = 5; }

	// x 1
	// 3 2
	one   = neighbors[1][2];
	two   = neighbors[2][2];
	three = neighbors[2][1];
	// 1↖ 2* 3→ 4↓ 5↘
	var drigth=5;
	if(one && !two && three) { drigth = 1; }
	if(one && two && three)  { drigth = 2; }
	if(!one && three)        { drigth = 3; }
	if(one && !three)        { drigth = 4; }

	return [
		tileset.at(map[tleft], 0, 0),
		tileset.at(map[tright], 1, 0),
		tileset.at(map[dleft], 0, 1),
		tileset.at(map[drigth], 1, 1),
	];
}

module.exports = AutoTilemap;
