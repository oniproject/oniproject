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
	var name = this._nameObj = new PIXI.Text('lol', {
		font: '12px Helvetica',
		fill: 'white',
		stroke: 'black',
		strokeThickness: 2,
		align: 'center',
	});
	name.anchor.x = name.anchor.y = 0.5;

	if (this.isAvatar()) {
		this.name = 'ava';
	} else if (this.isItem()) {
		this.name = 'item';
	} else if (this.isMonster()) {
		this.name = 'monster';
	}

	var graphics = this._graphics = new PIXI.Graphics();
	graphics.lineStyle(1, 0xFF0000, 0.8);
	graphics.moveTo(-16, 0);
	graphics.lineTo(16, 0);
	graphics.moveTo(0, -64);
	graphics.lineTo(0, 16);

	var hpBar = this._hpBar = new PIXI.Graphics();

	var h = this.isAvatar() ? 48 : obj.height;
	hpBar.y = -(h) | 0;
	name.y = -(h + 6) | 0;
	msg.y = -(h + 16) | 0;

	//this.container.addChild(graphics);
	this.container.addChild(obj);
	this.container.addChild(msg);
	this.container.addChild(name);
	this.container.addChild(hpBar);
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
};
GameObject.prototype.isMonster = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id < 0 && this.state.Id > -10000;
	}
};
GameObject.prototype.isItem = function() {
	if (this.hasOwnProperty('state')) {
		return this.state.Id < -10000;
	}
};

GameObject.prototype.addState = function(state) {
	switch (state.Type) {
		//case 2: // destroy
		//case 1: // create
		case 3: // move
			var x = this.state.Velocity.X;
			var y = this.state.Velocity.Y;
			if (!isNaN(x) && !isNaN(y)) {
				if (!!x || !!y) {
					this.lastvel.x = this.state.Velocity.X;
					this.lastvel.y = this.state.Velocity.Y;
				}
		}

		case 0: // idle
			if (state.Position && !isNaN(state.Position.X) && !isNaN(state.Position.Y)) {
				this.container.position.x = state.Position.X * 32 | 0;
				this.container.position.y = state.Position.Y * 32 | 0;
			}

			break;
	}

	this.state = state;
};

GameObject.prototype.update = function(time) {
	var state = this.state;

	if (state.HP) {
		var bar = state.HP / state.MHP * 32;

		var hp = this._hpBar;
		hp.clear();
		hp.lineStyle(1, 0x000000, 1);

		hp
			.beginFill(0x000000, 1)
			.drawRect(-16, 0, 32, 4)
			.endFill();

		hp
			.beginFill(0xCC0000, 1)
			.drawRect(-16, 0, bar, 4)
			.endFill();
	}

	if (this.obj) {
		var obj = this.obj;

		if (!obj.currentAnimation) return;

		obj.currentAnimation = 'idle';
		var x = state.Velocity.X;
		var y = state.Velocity.Y;
		var dir;
		if (!isNaN(x) && !isNaN(y)) {
			if (!!x || !!y) {
				dir = Math.atan2(x, y);
				obj.currentAnimation = 'walk';
			}
		} else {
			dir = Math.atan2(this.lastvel.x, this.lastvel.y);
		}
		if (dir !== undefined) {
			var dirArr = '↑↗→↘↓↙←↖';
			dir = -dir / Math.PI * 180 + 180;
			if (typeof dir == 'number') {
				var x = (dir / (360 / 8)) % 8;
				if (x < 0) {
					x = 8 + x;
				}
				dir = dirArr[x | 0];
			}
			obj.currentDirection = dir;
		}
	}
};

module.exports = GameObject;
