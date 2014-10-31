'use strict';

function Bat() {
	var w = 96,
		h = 128;
	var image = new PIXI.ImageLoader('/bat.png');

	var a = this._anim = {};

	var keys = [
		'walk ↑',
		'walk ←',
		'walk ↓',
		'walk →',

		/*'walk ↖',
		'walk ↑',
		'walk ↗',
		'walk →',
		'walk ↘',
		'walk ↓',
		'walk ↙',
		'walk ←',
		'death'*/
	];

	for (var y = 0, l = keys.length; y < l; y++) {
		var k = keys[y];
		this._anim[k] = [];
		var aa = [0, 1, 2, 1];
		for (var j = 0, ll = aa.length; j < ll; j++) {
			var x = aa[j];
			var rect = {
				x: x * (w / 3),
				y: y * (h / 4),
				width: w / 3,
				height: h / 4,
			};
			var t = new PIXI.Texture(image.texture.baseTexture, rect);
			a[k].push(t);
		}
	}

	//a['idle ↖'] = [a['walk ↖'][1]];
	a['idle ↑'] = [a['walk ↑'][1]];
	//a['idle ↗'] = [a['walk ↗'][1]];
	a['idle →'] = [a['walk →'][1]];
	//a['idle ↘'] = [a['walk ↘'][1]];
	a['idle ↓'] = [a['walk ↓'][1]];
	//a['idle ↙'] = [a['walk ↙'][1]];
	a['idle ←'] = [a['walk ←'][1]];

	this._animation = 'idle';
	this._direction = '↓';

	this.currentFrame = 0;
	this.animationSpeed = 0.3;

	PIXI.Sprite.call(this, a['idle ↓'][0]);

	this.anchor.x = 0.5;
	this.anchor.y = 1;

	image.load();
	this.image = image;
}

Bat.prototype = Object.create(PIXI.Sprite.prototype);
Bat.prototype.constructor = Bat;

Object.defineProperty(Bat.prototype, 'direction', {
	get: function() {
		return this._direction;
	},
	set: function(v) {
		var dir = '↑↗→↘↓↙←↖';
		if (typeof v == 'number') {
			var x = (v / (360 / 8)) % 8;
			if (x < 0) {
				x = 8 + x;
			}
			v = dir[x | 0];
		}
		switch (v) {
			case '↗': v = '↑';break;
			case '↘': v = '→';break;
			case '↙': v = '↓';break;
			case '↖': v = '←';break;
		}
		this._direction = v;
	},
});

Object.defineProperty(Bat.prototype, 'animation', {
	get: function() {
		return this._animation;
	},
	set: function(v) {
		this._animation = v;
	},
});

Bat.prototype.updateTransform = function() {
	PIXI.Sprite.prototype.updateTransform.call(this);

	var anim;
	switch (this._animation) {
		case 'walk':
		case 'idle':
			anim = this._anim[this._animation + ' ' + this._direction];
	}

	this.currentFrame += this.animationSpeed;

	var round = (this.currentFrame) | 0;

	this.currentFrame = this.currentFrame % anim.length;

	if ( /*this.loop ||*/ round < anim.length) {
		this.setTexture(anim[round % anim.length]);
	} /*else if(round >= anim.length) {
		this.gotoAndStop(this.textures.length - 1);
	}*/
};

module.exports = Bat;
