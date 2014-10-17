'use strict';

function Suika() {
	var w = 880, h = 720;
	var image = new PIXI.ImageLoader('/suika.png');


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

	for(var x = 0, l=keys.length; x<l; x++) {
		var k = keys[x];
		this._anim[k]=[]
		var aa=[0, 1, 2, 1];
		for (var j = 0, ll=aa.length; j<ll; j++) {
			var y = aa[j];
			var rect = {
				x: x * 96, y:  y * 96,
				width: 96, height: 96,
			};
			var t = new PIXI.Texture(image.texture.baseTexture, rect);
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

	this._animation = 'idle';
	this._direction = '↓';

	this.currentFrame = 0;
	this.animationSpeed = 0.3;

	PIXI.Sprite.call(this, a['idle ↓'][0]);

	image.load();
	this.image = image;
}

Suika.prototype = Object.create(PIXI.Sprite.prototype);
Suika.prototype.constructor = Suika;

Object.defineProperty( Suika.prototype, 'direction', {
	get: function()  { return this._direction; },
	set: function(v) {
		var dir = '↑↗→↘↓↙←↖';
		if(typeof v == 'number') {
			var x = (v / (360/8)) %8;
			if(x<0) x = 8+x;
			v = dir[x|0];
		}
		this._direction = v;
	},
});

Object.defineProperty( Suika.prototype, 'animation', {
	get: function()  { return this._animation; },
	set: function(v) { this._animation = v; },
});

Suika.prototype.updateTransform = function() {
	PIXI.Sprite.prototype.updateTransform.call(this);

	var anim;
	switch(this._animation) {
	case 'death':
		anim = this._anim['death'];
		break
	case 'walk':
	case 'idle':
		anim = this._anim[this._animation +' '+ this._direction];
	}

	this.currentFrame += this.animationSpeed;

	var round = (this.currentFrame) | 0;

	this.currentFrame = this.currentFrame % anim.length;

	if(/*this.loop ||*/ round < anim.length) {
		this.setTexture(anim[round % anim.length]);
	} /*else if(round >= anim.length) {
		this.gotoAndStop(this.textures.length - 1);
	}*/
};

module.exports = Suika;
