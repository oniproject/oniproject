'use strict';

var EventEmitter = require('events').EventEmitter;

var STATE_IDLE = 0,
	STATE_CAST = 1,
	STATE_DEAD = 2,
	STATE_MOVE = 3;

function GameObject(obj, state) {
	this.isAvatar = state.IsAvatar;
	this.isMonster = state.IsMonster;
	this.isItem = state.IsItem;

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

	if (this.isAvatar) {
		this.name = 'ava';
	} else if (this.isItem) {
		this.name = 'item';
	} else if (this.isMonster) {
		this.name = 'monster';
	}

	var graphics = this._graphics = new PIXI.Graphics();
	graphics.lineStyle(1, 0xFF0000, 0.8);
	graphics.moveTo(-16, 0);
	graphics.lineTo(16, 0);
	graphics.moveTo(0, -64);
	graphics.lineTo(0, 16);

	var hpBar = this._hpBar = new PIXI.Graphics();

	var h = this.isAvatar ? 48 : obj.height;
	hpBar.y = -(h) | 0;
	name.y = -(h + 6) | 0;
	msg.y = -(h + 16) | 0;

	//this.container.addChild(graphics);
	this.container.addChild(obj);
	this.container.addChild(msg);
	this.container.addChild(name);
	this.container.addChild(hpBar);


	var emitter = this.emitter = new Proton.BehaviourEmitter();
	emitter.rate = new Proton.Rate(new Proton.Span(1, 1), new Proton.Span(.1, .25));
	/*emitter.addInitialize(new Proton.Mass(1));
	emitter.addInitialize(new Proton.ImageTarget(texture));
    */
	emitter.addInitialize(new Proton.Life(.1, .1));
	/*
	emitter.addInitialize(new Proton.Velocity(new Proton.Span(3, 9), new Proton.Span(0, 30, true), 'polar'));
	*/

	emitter.addBehaviour(new Proton.Gravity(-3));
	//emitter.addBehaviour(new Proton.Scale(new Proton.Span(1, 3), 0.3));
	emitter.addBehaviour(new Proton.Alpha(1, 0.5));
	//emitter.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-8, 9), 'add'));
	//emitter.p.x = 1003 / 2;
	//emitter.p.y = 500;

	//emitter.addSelfBehaviour(new Proton.Gravity(5));
	//emitter.addSelfBehaviour(new Proton.RandomDrift(.1, 0, 1.1));
	//emitter.addSelfBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, 53, 10), 'bound'));
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

GameObject.prototype.addState = function(state) {
	switch (state.Type) {
		case STATE_MOVE: // move
			var x = this.state.Velocity.X;
			var y = this.state.Velocity.Y;
			if (!isNaN(x) && !isNaN(y)) {
				if (!!x || !!y) {
					this.lastvel.x = this.state.Velocity.X;
					this.lastvel.y = this.state.Velocity.Y;
				}
		}

		case STATE_IDLE:
		case STATE_CAST:
		case STATE_DEAD:
			if (state.Position && !isNaN(state.Position.X) && !isNaN(state.Position.Y)) {
				this.container.x = state.Position.X * 32 | 0;
				this.container.y = state.Position.Y * 32 | 0;
			}

			break;
	}
	if (this.obj.currentAnimation) {
		switch (state.Type) {
			case STATE_IDLE:
				this.obj.currentAnimation = 'idle';
				break;
			case STATE_CAST:
				this.obj.currentAnimation = 'boom';
				break;
			case STATE_DEAD:
				this.obj.currentAnimation = 'death';
				console.log('death');
				break;
			case STATE_MOVE:
				this.obj.currentAnimation = 'walk';
				break;
		}
	}

	if (state.hasOwnProperty('Name')) {
		this.name = state.Name;
	}

	var damage = state.HP - this.state.HP;
	if (damage != 0) {
		this.damage(damage);
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

		//obj.currentAnimation = 'idle';
		var x = state.Velocity.X;
		var y = state.Velocity.Y;
		var dir;
		if (!isNaN(x) && !isNaN(y)) {
			if (!!x || !!y) {
				dir = Math.atan2(x, y);
				//obj.currentAnimation = 'walk';
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

GameObject.prototype.damage = function(text) {
	if (text === undefined) {
		text = Math.random() * 20 - 15 | 0;
	}
	console.log('damage', text);
	this.emitter.createParticle([
		{
			life: 0.6,
			dead: false,
			target: {
				text: text,
				container: this.container
			}
		},
		new Proton.Position(new Proton.LineZone(-10, 0, 10, 0)),
	]);
};

module.exports = GameObject;
