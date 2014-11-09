'use strict';

var EventEmitter = require('events').EventEmitter;

function GameObject(obj, state) {
	this.state = state;

	this.position = {
		x: 0,
		y: 0
	};

	this.velocity = {
		x: 0,
		y: 0
	};

	this.lastvel = {
		x: 0,
		y: 0
	};

	this.speed = 1.0;
	this.angle = 0;
	this.rot = 1;

	this.container = new PIXI.DisplayObjectContainer();

	this.obj = obj;
	obj.buttonMode = true;
	obj.interactive = true;
	obj.click = obj.tap = (function(event) {
		this.emit('tapped', this.state.Id);
	}).bind(this);

	var msg = this._msgObj = new PIXI.Text('', {
		font: '12px Helvetica',
		fill: 'white',
		stroke: 'black',
		strokeThickness: 2,
		align: 'center',
	});
	msg.anchor.x = msg.anchor.y = 0.5;
	msg.y = -(obj.height + 16) | 0;
	var name = this._nameObj = new PIXI.Text('lol', {
		font: '12px Helvetica',
		fill: 'white',
		stroke: 'black',
		strokeThickness: 2,
		align: 'center',
	});
	name.anchor.x = name.anchor.y = 0.5;
	name.y = -(obj.height + 4) | 0;

	this.isAvatar() && (this.name = 'ava');
	this.isItem() && (this.name = 'item');
	this.isMonster() && (this.name = 'monster');

	var graphics = this._graphics = new PIXI.Graphics();
	graphics.lineStyle(1, 0xFF0000, 0.8);
	graphics.moveTo(-16, 0);
	graphics.lineTo(16, 0);
	graphics.moveTo(0, -64);
	graphics.lineTo(0, 16);

	this.container.addChild(graphics);
	this.container.addChild(obj);
	this.container.addChild(msg);
	this.container.addChild(name);
}

GameObject.prototype = Object.create(EventEmitter.prototype);
GameObject.prototype.constructor = GameObject;

Object.defineProperty(GameObject.prototype, 'msg', {
	set: function(v) {
		var obj = this._msgObj;
		obj.setText(v);
		obj.visible = 1;

		if (obj.__t) {
			clearTimeout(obj.__t);
		}
		obj.__t = setTimeout(function() {
			obj.visible = 0;
		}, 3000);
	},
});

Object.defineProperty(GameObject.prototype, 'name', {
	set: function(v) {
		this._nameObj.setText(v);
	},
});

GameObject.prototype.isAvatar = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id > 0;
	}
}
GameObject.prototype.isMonster = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id < 0 && this.state.Id > -10000;
	}
}
GameObject.prototype.isItem = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id < -10000;
	}
}

GameObject.prototype.addState = function(state) {
	this.state = state;
	switch (state.Type) {
		//case 2: // destroy
		//case 1: // create
		case 3: // move
			if (!(this.velocity.x == 0 && this.velocity.y == 0)) {
				this.lastvel.x = this.velocity.x;
				this.lastvel.y = this.velocity.y;
		}

		case 0: // idle
			this.position.x = state.Position.X;
			this.position.y = state.Position.Y;

			if (state.Velocity && state.Velocity.X != NaN && state.Velocity.Y != NaN) {
				this.velocity.x = state.Velocity.X;
				this.velocity.y = state.Velocity.Y;
			}
			break;
	}
	return true;
}

GameObject.prototype.update = function(time) {
	this.angle += this.rot * Math.PI * time;
	this.position.x += this.velocity.x * time;
	this.position.y += this.velocity.y * time;

	this.container.x = (this.position.x * 32) | 0;
	this.container.y = (this.position.y * 32) | 0;

	if (this.obj) {
		var obj = this.obj;

		if (!obj.animation) return;

		obj.animation = 'idle';
		if (this.velocity.x !== 0 || this.velocity.y !== 0) {
			var d = Math.atan2(this.velocity.x || 0, this.velocity.y || 0);
			var dd = -d / Math.PI * 180 + 180;
			obj.direction = dd;
			obj.animation = 'walk';
		} else if (this.lastvel !== undefined) {
			var d = Math.atan2(this.lastvel.x || 0, this.lastvel.y || 0);
			var dd = -d / Math.PI * 180 + 180;
			obj.direction = dd;
		}
	}
}

GameObject.prototype.move = function(dir) {
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

module.exports = GameObject;
