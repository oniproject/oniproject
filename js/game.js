'use strict';

var EventEmitter = require('events').EventEmitter,
	GameObject = require('./gameobject'),
	Net = require('./net'),
	Suika = require('./suika'),
	Bat = require('./bat'),
	Item = require('./item'),
	Tiled = require('./tiled');

function Game(renderer, stage, player, url) {
	this.container = new PIXI.DisplayObjectContainer();
	stage.addChild(this.container);

	this.initKeyboard();

	this.renderer = renderer;
	this.stage = stage;
	this.dir = [' ', ' '];
	this.player = player;
	this.target = 0;
	this.avatars = {};

	var net = this.net = new Net();
	net.on('message', this.onmessage.bind(this));
	net.on('close', alert.bind(null, 'close WS'));
	net.on('event', this.onevent.bind(this));
	net.on('FireMsg', this.onfire.bind(this));
	net.on('DestroyMsg', this.ondestroy.bind(this));
	net.on('SetTargetMsg', this.ontarget.bind(this));
}

Game.prototype = Object.create(EventEmitter.prototype);
Game.prototype.constructor = Game;

Game.prototype.run = function(player, host, mapName) {
	if (this.map) {
		this.container.removeChild(this.map);
		this.container.removeChild(this.map._maskX);
		// TODO remove all avatars
	}

	var map = this.map = new Tiled('/maps/', mapName + '.json');
	var that = this;
	map.load(function() {
		that.player = player;
		that.net.connecTo('ws://' + host + '/ws');
	});
	this.container.addChild(map);
}

Game.prototype.initKeyboard = function() {
	var listener = new window.keypress.Listener();
	this.listener = listener;

	var move_combos = [
		{
			keys: 'w',
			on_keydown: function() {
				this.dir[0] = 'N';
			},
			on_keyup: function() {
				this.dir[0] = ' ';
			},
		},
		{
			keys: 'a',
			on_keydown: function() {
				this.dir[1] = 'W';
			},
			on_keyup: function() {
				this.dir[1] = ' ';
			},
		},
		{
			keys: 's',
			on_keydown: function() {
				this.dir[0] = 'S';
			},
			on_keyup: function() {
				this.dir[0] = ' ';
			},
		},
		{
			keys: 'd',
			on_keydown: function() {
				this.dir[1] = 'E';
			},
			on_keyup: function() {
				this.dir[1] = ' ';
			},
		},

		{
			keys: 'e',
			on_keydown: function() {
				this.avatars[this.player].velocity.z = 1;
			},
			on_keyup: function() {
				this.avatars[this.player].velocity.z = 0;
			},
		},
		{
			keys: 'q',
			on_keydown: function() {
				this.avatars[this.player].velocity.z = -1;
			},
			on_keyup: function() {
				this.avatars[this.player].velocity.z = 0;
			},
		},
	];
	this.move_combos = move_combos;

	for (var i = 0, l = move_combos.length; i < l; i++) {
		var combo = move_combos[i];
		combo.on_keyup = combo.on_keyup.bind(this);
		combo.on_keydown = combo.on_keydown.bind(this);
	}

	listener.register_many(move_combos);
}

Game.prototype.update = function() {
	if (this.avatars.hasOwnProperty(this.player)) {
		var player = this.avatars[this.player];
		player.move(this.dir.join(''));
		this.net.SetVelocityMsg(player.velocity);
	}
	for (var i in this.avatars) {
		this.avatars[i].update(0.05);
	}
}

Game.prototype.render = function() {
	if (this.avatars.hasOwnProperty(this.player)) {
		var player = this.avatars[this.player];

		var x = -player.obj.position.x + window.innerWidth / 2;
		var y = -player.obj.position.y + window.innerHeight / 2;

		var w = this.map.data.width * this.map.data.tilewidth;
		var h = this.map.data.height * this.map.data.tileheight;

		if (x > 0) {
			x = 0;
		} else if (x < -w + window.innerWidth) {
			x = -w + window.innerWidth;
		}
		if (y > 0) {
			y = 0;
		} else if (y < -h + window.innerHeight) {
			y = -h + window.innerHeight;
		}

		this.container.x = Math.round(x);
		this.container.y = Math.round(y);
	}
}

Game.prototype.state_msg = function(state) {
	if (state.hasOwnProperty('Id')) {
		switch (state.Type) {
			case 2: // destroy
				var a = this.avatars[state.Id];
				if (a.obj) {
					this.map.AVATARS.removeChild(a.obj);
				}
				delete this.avatars[state.Id];
				break;
			case 1: // create
				var obj;
				if (state.Id > 0) {
					obj = new Suika();
				} else if (state.Id > -20000) {
					obj = new Bat();
				} else {
					obj = new Item(13);
				}
				if (obj) {
					this.map.AVATARS.addChild(obj);
				}
				this.avatars[state.Id] = new GameObject(obj);
				this.avatars[state.Id].on('tapped', (function(id) {
					console.info('tapped', id);
					this.net.SetTargetMsg(id);
					if (this.target == id) {
						var obj = this.avatars[id];
						if (obj.isItem()) {
							this.net.PickupItemMsg();
						}
					}
					this.target = id;
				}).bind(this));

			case 0: // idle
				if (!this.avatars.hasOwnProperty(state.Id)) {
					state.Type = 1;
					return this.state_msg(state);
				}
				var avatar = this.avatars[state.Id];
				avatar.rot = 0;
			case 3: // move
				if (!this.avatars.hasOwnProperty(state.Id)) {
					state.Type = 1;
					return this.state_msg(state);
				}
				var avatar = this.avatars[state.Id];
				if (state.Id == this.player) {
					//this.suika.animation = 'idle';
				}
				if (state.Type == 3) {
					avatar.rot = 3;
					if (state.Id == this.player) {
						//this.suika.animation = 'walk';
					}
					if (!(avatar.velocity.x == 0 && avatar.velocity.y == 0)) {
						avatar.lastvel = {
							x: avatar.velocity.x,
							y: avatar.velocity.y
						};
					}
				}

				if (avatar.rm_timer) {
					clearTimeout(avatar.rm_timer);
				}
				avatar.rm_timer = setTimeout(function() {
					if (avatar.obj !== undefined) {
						this.map.AVATARS.removeChild(avatar.obj);
					}
					delete this.avatars[state.Id];
				}.bind(this), 1000);

				avatar.state = state;
				avatar.position.x = state.Position.X;
				avatar.position.y = state.Position.Y;

				if (state.Velocity && state.Velocity.X != NaN && state.Velocity.Y != NaN) {
					avatar.velocity.x = state.Velocity.X;
					avatar.velocity.y = state.Velocity.Y;
				}
				break;
		}
		return true;
	}
	return false;
}

Game.prototype.onmessage = function(message) {
	if (Array.isArray(message)) {
		for (var i = 0, l = message.length; i < l; i++) {
			this.state_msg(message[i]);
		}
	} else {
		if (!this.state_msg(message)) {
			console.log('message', message);
		}
	}
}

Game.prototype.onevent = function(type, message) {
	console.log('event', type, message);
}

Game.prototype.ontarget = function(message) {
	console.log('target', message);
	this.target = message.Target;
}

Game.prototype.onfire = function(message) {
	console.log('fire', message);
}
Game.prototype.ondestroy = function(message) {
	delete this.avatars[message.Id];
}

module.exports = Game;
