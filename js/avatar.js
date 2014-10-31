'use strict';

function Avatar(obj) {
	PIXI.DisplayObjectContainer.call(this);

	this.velocity = {
		x: 0,
		y: 0
	};

	this.speed = 1.0;
	this.angle = 0;
	this.rot = 1;

	this.obj = obj;
	obj.buttonMode = true;
	obj.interactive = true;
	obj.click = obj.tap = function(event) {
		console.info("tapped");
	};
}

Avatar.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Avatar.constructor = Avatar;

Avatar.prototype.draw = function() {
	return;
	var pos = this.position;

	if (this.hasOwnProperty('state')) {
		// is avatar or monster
		if (this.state.Id > -10000) {
		}
		// is avatar or item
		if (this.state.Id < -10000 || this.state.Id > 0) {
		}
	}
}

Avatar.prototype.isAvatar = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id > 0;
	}
}
Avatar.prototype.isMonster = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id < 0 && this.state.Id > -10000;
	}
}
Avatar.prototype.isItem = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id < -10000;
	}
}

Avatar.prototype.update = function(time) {
	this.angle += this.rot * Math.PI * time;
	this.position.x += this.velocity.x * time;
	this.position.y += this.velocity.y * time;

	if (this.obj) {
		var obj = this.obj;
		obj.position.x = this.position.x * 32;
		obj.position.y = this.position.y * 32;

		if (this.velocity.x !== 0 || this.velocity.y !== 0) {
			var d = Math.atan2(this.velocity.x || 0, this.velocity.y || 0);
			var dd = -d / Math.PI * 180 + 180;
			obj.direction = dd;
			obj.animation = 'walk';
		} else if (this.lastvel !== undefined) {
			var d = Math.atan2(this.lastvel.x || 0, this.lastvel.y || 0);
			var dd = -d / Math.PI * 180 + 180;
			obj.direction = dd;
			obj.animation = 'walk';
		} else {
			obj.animation = 'idle';
		}
	}
}

Avatar.prototype.move = function(dir) {
	this.velocity.x = 0;
	this.velocity.y = 0;
	for (var i = 0, l = dir.length; i < l; i++) {
		var to = dir[i];
		switch (to) {
			case 'N':
				this.velocity.y -= this.speed;
				break;
			case 'W':
				this.velocity.x -= this.speed;
				break;
			case 'S':
				this.velocity.y += this.speed;
				break;
			case 'E':
				this.velocity.x += this.speed;
				break;
		}
	}
}

module.exports = Avatar;
