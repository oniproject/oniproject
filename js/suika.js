'use strict';

var suikaImage;

function Suika() {
	var w = 880,
		h = 720;
	if (!suikaImage) {
		suikaImage = new PIXI.ImageLoader('/suika.png');
	}
	var image = suikaImage;


	var a = this._anim = {};

	var keys = [
		'walk ↖',
		'walk ↑',
		'walk ↗',
		'walk →',
		'walk ↘',
		'walk ↓',
		'walk ↙',
		'walk ←',
		'death'
	];

	var t, k, rect;

	for (var x = 0, l = keys.length; x < l; x++) {
		k = keys[x];
		this._anim[k] = [];
		var aa = [0, 1, 2, 1];
		for (var j = 0, ll = aa.length; j < ll; j++) {
			var y = aa[j];
			rect = {
				x: x * 96 + 4,
				y: y * 96 + 4,
				width: 96,
				height: 96,
			};
			t = new PIXI.Texture(image.texture.baseTexture, rect);
			a[k].push(t);
		}
	}

	a['idle ↖'] = [a['walk ↖'][1]];
	a['idle ↑'] = [a['walk ↑'][1]];
	a['idle ↗'] = [a['walk ↗'][1]];
	a['idle →'] = [a['walk →'][1]];
	a['idle ↘'] = [a['walk ↘'][1]];
	a['idle ↓'] = [a['walk ↓'][1]];
	a['idle ↙'] = [a['walk ↙'][1]];
	a['idle ←'] = [a['walk ←'][1]];

	keys = [
		'boom ↙',
		'boom ↓',
		'boom ↘',

		'boom ↖',
		'boom ↑',
		'boom ↗',

		'boom →',
		'boom ←',
	];

	rect = {
		/*x: x* 96 -3,*/
		y: 96 * 3 + 4,
		width: 96,
		height: 124,
	};

	w = 96;
	k = 'boom ↙';
	a[k] = [];
	for (x = 0; x < 3; x++) {
		rect.x = x * w - 3;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}
	k = 'boom ↓';
	a[k] = [];
	for (x = 0; x < 3; x++) {
		rect.x = (x + 3) * w - 3;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}
	k = 'boom ↘';
	a[k] = [];
	for (x = 0; x < 3; x++) {
		rect.x = (x + 6) * w - 3;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}

	rect.y += 124;
	rect.height = 104;
	k = 'boom ↖';
	a[k] = [];
	for (x = 0; x < 3; x++) {
		rect.x = x * w;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}
	k = 'boom ↓';
	a[k] = [];
	for (x = 0; x < 3; x++) {
		rect.x = (x + 3) * w;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}
	k = 'boom ↗';
	a[k] = [];
	for (x = 0; x < 3; x++) {
		rect.x = (x + 6) * w;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}

	rect.y += 104;

	/*k = 'boom →';
	rect.x = (x +6)*w -3;
	t = new PIXI.Texture(image.texture.baseTexture, rect);
	a[k].push(t);
	k = 'boom ←';*/



	this._animation = 'idle';
	this._direction = '↓';

	this.currentFrame = 0;
	this.animationSpeed = 0.3;

	PIXI.Sprite.call(this, a['idle ↓'][0]);
	this.scale.x = this.scale.y = 0.5;
	this.anchor.x = 0.5;
	this.anchor.y = 1;

	image.load();
	this.image = image;
}

Suika.prototype = Object.create(PIXI.Sprite.prototype);
Suika.prototype.constructor = Suika;

Object.defineProperty(Suika.prototype, 'direction', {
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
		this._direction = v;
	},
});

Object.defineProperty(Suika.prototype, 'animation', {
	get: function() {
		return this._animation;
	},
	set: function(v) {
		this._animation = v;
	},
});

Suika.prototype.updateTransform = function() {
	PIXI.Sprite.prototype.updateTransform.call(this);

	var anim;
	switch (this._animation) {
		case 'death':
			anim = this._anim.death;
			break;
		case 'walk':
		case 'idle':
		case 'boom':
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

module.exports = Suika;
