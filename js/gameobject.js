'use strict';

var EventEmitter = require('events').EventEmitter;

function GameObject(obj, state) {
	this.state = state;

	this.lastvel = {
		x: 0,
		y: 0
	};

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
	switch (state.Type) {
		//case 2: // destroy
		//case 1: // create
		case 3: // move
			var x = this.state.Velocity.X;
			var y = this.state.Velocity.Y;
			if (x !== NaN && y !== NaN) {
				if (!!x || !!y) {
					this.lastvel.x = this.state.Velocity.X;
					this.lastvel.y = this.state.Velocity.Y;
				}
		}

		case 0: // idle
			if (state.Position && state.Position.X !== NaN && state.Position.Y !== NaN) {
				this.container.position.x = state.Position.X * 32 | 0;
				this.container.position.y = state.Position.Y * 32 | 0;
			}

			break;
	}

	this.state = state;
}

GameObject.prototype.update = function(time) {
	var state = this.state;

	if (this.obj) {
		var obj = this.obj;

		if (!obj.animation) return;

		obj.animation = 'idle';
		var x = state.Velocity.X;
		var y = state.Velocity.Y;
		if (x !== NaN && y !== NaN) {
			if (!!x || !!y) {
				var d = Math.atan2(x, y);
				var dd = -d / Math.PI * 180 + 180;
				obj.direction = dd;
				obj.animation = 'walk';
			}
		} else {
			var d = Math.atan2(this.lastvel.x, this.lastvel.y);
			var dd = -d / Math.PI * 180 + 180;
			obj.direction = dd;
		}
	}
}

module.exports = GameObject;
