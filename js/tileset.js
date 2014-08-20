'use strict';

function Tileset(url, w, h, size) {
	this.width = w;
	this.height = h;
	this.size = size;

	var image = new PIXI.ImageLoader(url),
		tiles = [];
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var rect = {
				x: x * size.width,
				y: y * size.height,
				width: size.width,
				height: size.height,
			};
			tiles.push(new PIXI.Texture(image.texture.baseTexture, rect));
		}
	}

	this.tiles = tiles;
	image.load();
	this.image = image;
}

// x and y for subtile
Tileset.prototype.at = function(i, x, y) {
	if (x === undefined && y === undefined) {
		return this.tiles[i];
	} else {
		// FIXME maybe memory leaks
		var t = this.tiles[i],
			rect = {
				x: t.frame.x + x * this.size.width / 2,
				y: t.frame.y + y * this.size.height / 2,
				width: this.size.width / 2,
				height: this.size.height / 2,
			};
		return new PIXI.Texture(t, rect);
	}
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

Tileset.prototype.atAutoTile = function(id, neighbors) {
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
	var w = this.width >>> 1,
		x = (id % w) * 2,
		y = (id - id % w) / w * 3,
		map = [
			(y + 0) * this.width + x + 0,
			(y + 0) * this.width + x + 1,
			(y + 1) * this.width + x + 0,
			(y + 1) * this.width + x + 1,
			(y + 2) * this.width + x + 0,
			(y + 2) * this.width + x + 1,
		],
		one, two, three;

	// 2 3
	// 1 x
	one = neighbors[1][0];
	two = neighbors[0][0];
	three = neighbors[0][1];

	// 1↘  2↖ 3↑ 4← 5*
	var tleft = 2;
	if (one && !two && three) {
		tleft = 1;
	}
	if (one && two && three) {
		tleft = 5;
	}
	if (!one && three) {
		tleft = 4;
	}
	if (one && !three) {
		tleft = 3;
	}

	// 1 2
	// x 3
	one = neighbors[0][1];
	two = neighbors[0][2];
	three = neighbors[1][2];

	// 1↙ 2↑ 3↗ 4* 5→
	var tright = 3;
	if (one && !two && three) {
		tright = 1;
	}
	if (one && two && three) {
		tright = 4;
	}
	if (!one && three) {
		tright = 2;
	}
	if (one && !three) {
		tright = 5;
	}

	// 1 x
	// 2 3
	one = neighbors[1][0];
	two = neighbors[2][0];
	three = neighbors[2][1];

	// 1↗ 2← 3* 4↙ 5↓
	var dleft = 4;
	if (one && !two && three) {
		dleft = 1;
	}
	if (one && two && three) {
		dleft = 3;
	}
	if (!one && three) {
		dleft = 2;
	}
	if (one && !three) {
		dleft = 5;
	}

	// x 1
	// 3 2
	one = neighbors[1][2];
	two = neighbors[2][2];
	three = neighbors[2][1];
	// 1↖ 2* 3→ 4↓ 5↘
	var drigth = 5;
	if (one && !two && three) {
		drigth = 1;
	}
	if (one && two && three) {
		drigth = 2;
	}
	if (!one && three) {
		drigth = 3;
	}
	if (one && !three) {
		drigth = 4;
	}

	return [
		this.at(map[tleft], 0, 0),
		this.at(map[tright], 1, 0),
		this.at(map[dleft], 0, 1),
		this.at(map[drigth], 1, 1),
	];
}

module.exports = Tileset;
