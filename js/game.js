'use strict';

var EventEmitter = require('events').EventEmitter,
	Actor = require('CharRedactor'),
	Howl = require('howler').Howl,
	Howler = require('howler').Howler,
	GameObject = require('./gameobject'),
	Net = require('./net'),
	//Suika = require('./suika'),
	Bat = require('./bat'),
	Item = require('./item'),
	Tiled = require('tiled.js');

function Game(renderer, stage) {
	this.container = new PIXI.DisplayObjectContainer();
	stage.addChild(this.container);

	var loader = new PIXI.AssetLoader(['/suika.json']);
	loader.load();
	this.suika_anim = require('../public/animations.json');
	console.log(this.suika_anim);

	this.sounds = {
		pickup: new Howl({
			urls: ['/sounds/pickup.mp3', '/sounds/pickup.ogg', '/sounds/pickup.wav'],
		}),
		bg: new Howl({
			urls: ['/sounds/music/No More Magic.mp3', '/sounds/music/No More Magic.ogg'],
			loop: true,
		}),
	};
	this.sounds.bg.play();

	this.container.click = this.container.tap = function(event) {
		console.log('TAPPED', event);
		var p1 = event.getLocalPosition(this.container);
		var player = this.avatars[this.player];
		if (player) {
			var p2 = player.container.position;
			var v = {
				x: p1.x - p2.x,
				y: p1.y - p2.y
			};
			this.inputAxesVector.x = 0;
			this.inputAxesVector.y = 0;
			if (v.x !== 0) {
				this.inputAxesVector.x = v.x < 0 ? -1 : 1;
			}
			if (v.y !== 0) {
				this.inputAxesVector.y = v.y < 0 ? -1 : 1;
			}
		}
	}.bind(this);
	this.container.hitArea = new PIXI.Rectangle(-99999, -99999, 999999, 999999);
	this.container.interactive = true;

	this.initKeyboard();

	this.renderer = renderer;
	this.stage = stage;
	this.inputAxesVector = {
		x: 0,
		y: 0,
	};
	this.player = 0;
	this.target = 0;
	this.avatars = {};

	var net = this.net = new Net();

	net.on('close', (function() {
		if (this.map) {
			this.container.removeChild(this.map);
			// TODO remove all avatars
			for (var k in this.avatars) {
				this.destroyAvatar(k);
			}
		}
	}).bind(this));
	net.on('message', this.onmessage.bind(this));
	//net.on('close', alert.bind(null, 'close WS'));
	net.on('event', this.onevent.bind(this));
	net.on('FireMsg', this.onfire.bind(this));
	net.on('DestroyMsg', this.ondestroy.bind(this));
	net.on('SetTargetMsg', this.ontarget.bind(this));

	net.on('AddMsg', (function(value) {
		this.createAvatar(value);
		var avatar = this.avatars[value.Id];
		avatar.visible = 1;
		avatar.addState(value);
		console.log('add', value);
	}).bind(this));

	net.on('RemoveMsg', (function(value) {
		this.destroyAvatar(value.Id);
		console.log('rm', value);
	}).bind(this));

	net.on('UpdateMsg', (function(value) {
		this.avatars[value.Id].addState(value);
		//console.log('upd', value);
	}).bind(this));


	net.on('ReplicaMsg', (function(value) {
		var tick = value.Tick;

		for (var i = 0, l = value.Added.length; i < l; i++) {
			var msg = value.Added[i];
			this.createAvatar(msg);
			var avatar = this.avatars[msg.Id];
			avatar.visible = 1;
			avatar.addState(msg);
		}

		for (var i = 0, l = value.Removed.length; i < l; i++) {
			var id = value.Removed[i];
			this.destroyAvatar(id);
		}

		for (var i = 0, l = value.Updated.length; i < l; i++) {
			var msg = value.Updated[i];
			this.avatars[msg.Id].addState(msg);
		}
		console.log('replica');




		/*
		var states = value.States;

		var states_hash = {};

		for (var i = 0, len = states.length; i < len; i++) {
			var state = states[i];
			states_hash[state.Id] = state;
			if (!this.avatars.hasOwnProperty(state.Id)) {
				this.createAvatar(state);
			}
			this.avatars[state.Id].addState(state);
		}

		var ids = Object.keys(this.avatars);
		for (var k in this.avatars) {
			var avatar = this.avatars[k];
			avatar.container.visible = 1;
			if (avatar.rm_timer) {
				clearTimeout(avatar.rm_timer);
			}
			if (!states_hash.hasOwnProperty(k)) {
				avatar.container.visible = 0;
				avatar.rm_timer = setTimeout(this.destroyAvatar.bind(this, k), 3000);
			}
		}
		*/
	}).bind(this));
}

Game.prototype = Object.create(EventEmitter.prototype);
Game.prototype.constructor = Game;

Game.prototype.run = function(player, host, mapName) {
	if (this.map) {
		this.container.removeChild(this.map);
		// TODO remove all avatars
		for (var k in this.avatars) {
			this.destroyAvatar(k);
		}
	}

	var map = this.map = new Tiled('/maps/', mapName + '.json');
	var that = this;
	map.load(function() {
		that.player = player;
		that.net.connecTo('ws://' + host + '/ws');
	});
	this.container.addChild(map);
};

Game.prototype.createAvatar = function(state) {
	// create Avatar
	var obj;
	if (state.Id > 0) {
		//obj = new Suika();
		obj = new Actor(this.suika_anim);
		obj.scale.x = obj.scale.y = 0.5;
	} else if (state.Id > -20000) {
		obj = new Bat();
	} else {
		obj = new Item(13);
	}
	var avatar = this.avatars[state.Id] = new GameObject(obj, state);
	avatar.on('tapped', (function(id) {
		console.info('tapped', id);
		this.net.SetTargetMsg(id);
		if (this.target == id) {
			var obj = this.avatars[id];
			if (obj.isItem()) {
				this.net.PickupItemMsg();
				this.sounds.pickup.play();
			}
		}
		this.target = id;
	}).bind(this));

	this.map.AVATARS.addChild(avatar.container);
};

Game.prototype.destroyAvatar = function(id) {
	var a = this.avatars[id];
	if (a) {
		this.map.AVATARS.removeChild(a.container);
		delete this.avatars[id];
	}
};

Game.prototype.initKeyboard = function() {
	var listener = new window.keypress.Listener();
	this.listener = listener;

	var move_combos = [
		{
			keys: 'w',
			on_keydown: function() {
				//this.dir[0] = 'N';
				this.inputAxesVector.y = -1;
			},
			on_keyup: function() {
				//this.dir[0] = ' ';
				this.inputAxesVector.y = 0;
			},
		},
		{
			keys: 'a',
			on_keydown: function() {
				//this.dir[1] = 'W';
				this.inputAxesVector.x = -1;
			},
			on_keyup: function() {
				//this.dir[1] = ' ';
				this.inputAxesVector.x = 0;
			},
		},
		{
			keys: 's',
			on_keydown: function() {
				//this.dir[0] = 'S';
				this.inputAxesVector.y = 1;
			},
			on_keyup: function() {
				//this.dir[0] = ' ';
				this.inputAxesVector.y = 0;
			},
		},
		{
			keys: 'd',
			on_keydown: function() {
				this.inputAxesVector.x = 1;
				//this.dir[1] = 'E';
			},
			on_keyup: function() {
				this.inputAxesVector.x = 0;
				//this.dir[1] = ' ';
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
};

Game.prototype.update = function() {
	if (this.avatars.hasOwnProperty(this.player)) {
		var player = this.avatars[this.player];
		/*var v = {
			x: 0,
			y: 0
		};
		//player.move(this.dir.join(''));
		//
		for (var i = 0, l = this.dir.length; i < l; i++) {
			var to = this.dir[i];
			switch (to) {
				case 'N':
					v.y -= 1;
					break;
				case 'W':
					v.x -= 1;
					break;
				case 'S':
					v.y += 1;
					break;
				case 'E':
					v.x += 1;
					break;
			}
		}*/
		this.net.SetVelocityMsg(this.inputAxesVector);
	}
	for (var i in this.avatars) {
		this.avatars[i].update(0.05);
	}
};

Game.prototype.render = function() {
	if (this.avatars.hasOwnProperty(this.player)) {
		var player = this.avatars[this.player];

		var x = -player.container.position.x + window.innerWidth / 2;
		var y = -player.container.position.y + window.innerHeight / 2;

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
};

Game.prototype.onmessage = function(message) {
	console.warn('message', message);
};

Game.prototype.onevent = function(type, message) {
	console.log('event', type, message);
};

Game.prototype.ontarget = function(message) {
	console.log('target', message);
	this.target = message.Target;
};

Game.prototype.onfire = function(message) {
	console.log('fire', message);
};
Game.prototype.ondestroy = function(message) {
	delete this.avatars[message.Id];
};

module.exports = Game;
