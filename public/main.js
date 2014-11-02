(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./js/main.js":[function(require,module,exports){
'use strict';

console.log('fuck');

var w = window.innerWidth,
	h = window.innerHeight,
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h);
document.body.appendChild(renderer.view);

window.onresize = function() {
	w = window.innerWidth;
	h = window.innerHeight;
	renderer.resize(w, h);
};
window.onresize();

var Game = require('./game');
window.game = new Game(renderer, stage);

var colorMatrixFilter = new PIXI.ColorMatrixFilter();
colorMatrixFilter.matrix = [
	0.4, 0, 0, 0,
	0, 0.4, 0, 0,
	0, 0, 0.7, 0,
	0, 0, 0, 1,
];
game.container.filters = [colorMatrixFilter];

requestAnimFrame(render);
var updateT = 1000 / 50;
var lastTime = window.performance.now();
function render() {
	requestAnimFrame(render);
	var t = window.performance.now();
	if (t - lastTime > updateT) {
		game.update(updateT);
		lastTime += updateT;
	}
	game.render();
	renderer.render(stage);
}

game.net.on('open', function() {
	game.net.RequestParametersMsg();
	game.net.RequestInventoryMsg();
});

game.net.on('TargetDataMsg', function(target) {
	console.log('TargetDataMsg');
	UI.target = target;
});
game.net.on('InventoryMsg', function(inv) {
	UI.inventory = inv.Inventory;
	UI.equip = inv.Equip
});
game.net.on('ParametersMsg', function(p) {
	UI.hp = p.Parameters.HP;
	UI.mhp = p.Parameters.MHP;
	UI.mp = p.Parameters.MP;
	UI.mmp = p.Parameters.MMP;
	UI.tp = p.Parameters.TP;
	UI.mtp = p.Parameters.MTP;
	UI.spells = p.Skills;
});

var UI = new Vue({
	el: '#ui',
	data: {
		level: 88,
		exp: 77,
		hp: 190,
		mhp: 300,
		mp: 50,
		mmp: 300,
		tp: 50,
		mtp: 100,
		equip: {},
		inventory: [
			{
				Name: '43'
			},
			{
				Name: '1k'
			},
			{
				Name: '4njki32'
			},
			{
				Name: 'PPPPvndfsj'
			},
		],
		target: {
			Race: 0,
			HP: 0,
			MHP: 0,
			Name: 'vnfdjsk'
		},
		spells: [
			{
				Icon: 'all-for-one'
			},
			{
				Icon: 'screaming'
			},
			{
				Icon: 'spiral-thrust'
			},
			{
				Icon: 'rune-sword'
			},
		],
	},
	methods: {
		cast: function(spell) {
			console.info('cast', spell);
			game.net.FireMsg({
				t: '' + spell
			});
		},
		drop: function(index) {
			game.net.DropItemMsg({
				Id: index
			});
		},
	},
});

function getConnectionData() {
	var r = new XMLHttpRequest();
	r.open('POST', '/game', true);
	r.onreadystatechange = function() {
		if (r.readyState != 4 || r.status != 200) {
			return;
		}
		var json = JSON.parse(r.responseText);
		if (json.Id !== undefined) {
			console.log('Success:', json);
			game.run(json.Id, json.Host, 'test');
		}
	};
	r.send();
}

getConnectionData();

},{"./game":"/home/lain/gocode/src/oniproject/js/game.js"}],"/home/lain/gocode/src/oniproject/js/bat.js":[function(require,module,exports){
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

},{}],"/home/lain/gocode/src/oniproject/js/game.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter,
	GameObject = require('./gameobject'),
	Net = require('./net'),
	Suika = require('./suika'),
	Bat = require('./bat'),
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

Game.prototype = EventEmitter.prototype;
Game.prototype.constructor = Game;

Game.prototype.run = function(player, host, mapName) {
	if (this.map) {
		this.container.removeChild(this.map);
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
		this.container.position.x = Math.round(-player.obj.position.x + window.innerWidth / 2);
		this.container.position.y = Math.round(-player.obj.position.y + window.innerHeight / 2);
	}
}

Game.prototype.state_msg = function(state) {
	if (state.hasOwnProperty('Id')) {
		switch (state.Type) {
			case 2: // destroy
				var a = this.avatars[state.Id];
				if (a.obj) {
					this.container.removeChild(a.obj);
				}
				delete this.avatars[state.Id];
				break;
			case 1: // create
				var obj;
				if (state.Id > 0) {
					obj = new Suika();
				} else if (state.Id > -20000) {
					obj = new Bat();
				}
				if (obj) {
					this.container.addChild(obj);
				}
				this.avatars[state.Id] = new GameObject(obj);

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
					var a = this.avatars[state.Id];
					if (a.obj) {
						this.container.removeChild(a.obj);
					}
					delete this.avatars[state.Id];
				}.bind(this), 2000);

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

},{"./bat":"/home/lain/gocode/src/oniproject/js/bat.js","./gameobject":"/home/lain/gocode/src/oniproject/js/gameobject.js","./net":"/home/lain/gocode/src/oniproject/js/net.js","./suika":"/home/lain/gocode/src/oniproject/js/suika.js","./tiled":"/home/lain/gocode/src/oniproject/js/tiled/index.js","events":"/home/lain/gocode/src/oniproject/node_modules/browserify/node_modules/events/events.js"}],"/home/lain/gocode/src/oniproject/js/gameobject.js":[function(require,module,exports){
'use strict';

function GameObject(obj, state) {
	PIXI.DisplayObjectContainer.call(this);

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

	this.obj = obj;
	obj.buttonMode = true;
	obj.interactive = true;
	obj.click = obj.tap = function(event) {
		console.info("tapped");
	};
}

GameObject.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
GameObject.constructor = GameObject;

GameObject.prototype.isGameObject = function() {
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

GameObject.prototype.update = function(time) {
	this.angle += this.rot * Math.PI * time;
	this.position.x += this.velocity.x * time;
	this.position.y += this.velocity.y * time;

	if (this.obj) {
		var obj = this.obj;
		obj.position.x = (this.position.x * 32) | 0;
		obj.position.y = (this.position.y * 32) | 0;

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

},{}],"/home/lain/gocode/src/oniproject/js/net.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var M_SetVelocityMsg = 1,
	M_SetTargetMsg = 2,
	M_CastMsg = 3,
	M_DestroyMsg = 4,
	M_DropItem = 5,
	M_PickupItem = 6,
	M_RequestInventory = 7,
	M_Inventory = 8,
	M_TargetData = 9,
	M_RequestParameters = 10,
	M_Parameters = 11,
	___ = 0;

function Net(url) {
}

Net.prototype = EventEmitter.prototype;
Net.prototype.constructor = Net;

Net.prototype.connecTo = function(url) {
	if (this.ws) {
		this.ws.close();
	}

	var websocket = new WebSocket(url);
	this.ws = websocket;
	var that = this;
	websocket.binaryType = 'arraybuffer';
	websocket.onopen = function(event) {
		console.info('Net open', url);
		that.emit('open', event);
	};
	websocket.onerror = function(event) {
		console.info('Net error', event);
		that.emit('error', event);
	};
	websocket.onclose = function(event) {
		console.info('Net close');
		that.emit('close', event);
	};
	websocket.onmessage = function(event) {
		var message = CBOR.decode(event.data);
		switch (typeof message) {
			case 'number':
				that.emit('tick', message);
				break;
			case 'object':
				if (message.hasOwnProperty('T')) {
					that._ParseMessages(message.T | 0, message.V, event);
					break;
			}
			default:
				that.emit('message', message, event);
		}
	};
}

Net.prototype.close = function() {
	this.ws.close();
}
Net.prototype.send = function(message) {
	this.ws.send(CBOR.encode(message));
}

/*
 * MESSAGES
 */

Net.prototype._ParseMessages = function(type, value, event) {
	switch (type) {
		case M_SetVelocityMsg:
			this.emit('SetVelocityMsg', value);
			break;
		case M_SetTargetMsg:
			this.emit('SetTargetMsg', value);
			break;
		case M_CastMsg:
			this.emit('FireMsg', value);
			break;
		case M_DestroyMsg:
			this.emit('DestroyMsg', value);
			break;
		case M_TargetData:
			this.emit('TargetDataMsg', value);
			break;
		case M_Inventory:
			this.emit('InventoryMsg', value);
			break;
		case M_Parameters:
			this.emit('ParametersMsg', value);
			break;
		default:
			this.emit('event', type, value, event);
	}
}

Net.prototype.SetVelocityMsg = function(data) {
	this.send({
		T: M_SetVelocityMsg,
		V: data
	});
}
Net.prototype.SetTargetMsg = function(data) {
	this.send({
		T: M_SetTargetMsg,
		V: data
	});
}
Net.prototype.FireMsg = function(data) {
	this.send({
		T: M_CastMsg,
		V: data
	});
}
Net.prototype.RequestInventoryMsg = function() {
	this.send({
		T: M_RequestInventory,
		V: {}
	});
}
Net.prototype.RequestParametersMsg = function() {
	this.send({
		T: M_RequestParameters,
		V: {}
	});
}
Net.prototype.PickupItemMsg = function() {
	this.send({
		T: M_PickupItem,
		V: {}
	});
}
Net.prototype.DropItemMsg = function(data) {
	this.send({
		T: M_DropItem,
		V: data
	});
}

module.exports = Net;

},{"events":"/home/lain/gocode/src/oniproject/node_modules/browserify/node_modules/events/events.js"}],"/home/lain/gocode/src/oniproject/js/suika.js":[function(require,module,exports){
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

	for (var x = 0, l = keys.length; x < l; x++) {
		var k = keys[x];
		this._anim[k] = []
		var aa = [0, 1, 2, 1];
		for (var j = 0, ll = aa.length; j < ll; j++) {
			var y = aa[j];
			var rect = {
				x: x * 96 + 4,
				y: y * 96 + 4,
				width: 96,
				height: 96,
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

	var keys = [
		'boom ↙',
		'boom ↓',
		'boom ↘',

		'boom ↖',
		'boom ↑',
		'boom ↗',

		'boom →',
		'boom ←',
	];

	var rect = {
		/*x: x* 96 -3,*/
		y: 96 * 3 + 4,
		width: 96,
		height: 124,
	};

	var t, k, w;

	w = 96;
	k = 'boom ↙';
	a[k] = [];
	for (var x = 0; x < 3; x++) {
		rect.x = x * w - 3;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}
	k = 'boom ↓';
	a[k] = [];
	for (var x = 0; x < 3; x++) {
		rect.x = (x + 3) * w - 3;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}
	k = 'boom ↘';
	a[k] = [];
	for (var x = 0; x < 3; x++) {
		rect.x = (x + 6) * w - 3;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}

	rect.y += 124;
	rect.height = 104;
	k = 'boom ↖';
	a[k] = [];
	for (var x = 0; x < 3; x++) {
		rect.x = x * w;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}
	k = 'boom ↓';
	a[k] = [];
	for (var x = 0; x < 3; x++) {
		rect.x = (x + 3) * w;
		t = new PIXI.Texture(image.texture.baseTexture, rect);
		a[k].push(t);
	}
	k = 'boom ↗';
	a[k] = [];
	for (var x = 0; x < 3; x++) {
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
			anim = this._anim['death'];
		break
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

},{}],"/home/lain/gocode/src/oniproject/js/tiled/imagelayer.js":[function(require,module,exports){
'use strict';

function ImageLayer(data, path) {
	var image = this.image = new PIXI.ImageLoader(path + data.image);
	PIXI.Sprite.call(this, image.texture);

	this.position.x = data.x || 0;
	this.position.y = data.y || 0;
	this.alpha = data.opacity || 1;
	this.visible = !!data.visible;
}

ImageLayer.prototype = Object.create(PIXI.Sprite.prototype);
ImageLayer.constructor = ImageLayer;

ImageLayer.prototype.load = function(fn) {
	if (fn) {
		this.image.on('loaded', fn);
	}
	this.image.load();
}

module.exports = ImageLayer;

},{}],"/home/lain/gocode/src/oniproject/js/tiled/index.js":[function(require,module,exports){
'use strict';

var Tileset = require('./tileset');
var TileLayer = require('./tilelayer');
var ObjectGroup = require('./objectgroup');
var ImageLayer = require('./imagelayer');

function Tiled(path, uri) {
	PIXI.DisplayObjectContainer.call(this);

	this.path = path

	var loader = this.loader = new PIXI.JsonLoader(path + uri);

	this.tilesets = [];
	this.layers = [];
}

Tiled.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Tiled.constructor = Tiled;

Tiled.prototype.load = function(fn, fn2) {
	var that = this;
	this.loader.on('loaded', function() {
		var json = that.data = that.loader.json;

		var tilesets_count = json.tilesets.length;
		for (var i = 0, l = json.tilesets.length; i < l; i++) {
			var t = new Tileset(json.tilesets[i], that.path, null, null)
			that.tilesets.push(t);

			t.load(function() {
				tilesets_count--;
				if (!tilesets_count) {
					console.info('tilesets loaded');
					if (fn) {
						fn();
					}
				}
			});
		}

		for (var i = 0, l = json.layers.length; i < l; i++) {
			var layer = json.layers[i];
			var obj = undefined;
			switch (layer.type) {
				case 'tilelayer':
					obj = new TileLayer(layer, that.tilesets, json.tilewidth, json.tileheight, json.renderorder);
					break;
				case 'objectgroup':
					obj = new ObjectGroup(layer, that.tilesets);
					break;
				case 'imagelayer':
					obj = new ImageLayer(layer, that.path);
					obj.load();
					break;
			}
			if (obj !== undefined) {
				console.log('addChild', layer, obj);
				that.layers.push(obj);
				that.addChild(obj);
			}
		}
		if (fn2) {
			fn2();
		}

	});
	this.loader.load();
}

module.exports = Tiled;

},{"./imagelayer":"/home/lain/gocode/src/oniproject/js/tiled/imagelayer.js","./objectgroup":"/home/lain/gocode/src/oniproject/js/tiled/objectgroup.js","./tilelayer":"/home/lain/gocode/src/oniproject/js/tiled/tilelayer.js","./tileset":"/home/lain/gocode/src/oniproject/js/tiled/tileset.js"}],"/home/lain/gocode/src/oniproject/js/tiled/objectgroup.js":[function(require,module,exports){
'use strict';

function ObjectGroup(data, tilesets) {
	PIXI.DisplayObjectContainer.call(this);
	var graphics = this.graphics = new PIXI.Graphics();
	this.addChild(graphics);

	this.data = data;
	this.tilesets = tilesets;

	this.position.x = data.x || 0;
	this.position.y = data.y || 0;
	this.alpha = data.opacity || 1;
	this.visible = !!data.visible;

	if (data.color) {
		var c = parseInt(data.color.slice(1), 16);
		graphics.lineStyle(2, c, 1);
	}

	for (var i = 0, l = data.objects.length; i < l; i++) {
		var obj = data.objects[i];
		if (!obj.visible) {
			continue;
		}

		var x = obj.x,
			y = obj.y,
			w = obj.width,
			h = obj.height,
			r = obj.rotation;
		var w2 = w / 2,
			h2 = h / 2;
		if (obj.gid) {
			for (var j = 0, ll = tilesets.length; j < ll; j++) {
				var t = tilesets[j];
				var sprite = t.CreateSprite(obj.gid);

				if (sprite) {
					sprite.position.x = x;
					sprite.position.y = y - sprite.height; // XXX

					if (t.data.tileoffset) {
						sprite.position.x += t.data.tileoffset.x;
						sprite.position.y += t.data.tileoffset.y;
					}

					this.addChild(sprite);
					break;
				}
			}
		} else if (obj.polyline) {
		// TODO
		} else if (obj.ellipse) {
			// TODO
			graphics.drawEllipse(x + w2, y + h2, w2, h2);
		} else if (obj.polygon) {
		// TODO
		} else {
			// TODO rect
			graphics.drawRect(x, y, w, h);
		}
	}
}

ObjectGroup.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
ObjectGroup.constructor = ObjectGroup;

module.exports = ObjectGroup;

},{}],"/home/lain/gocode/src/oniproject/js/tiled/tilelayer.js":[function(require,module,exports){
'use strict';

function TileLayer(data, tilesets, tilewidth, tileheight, renderorder) {
	PIXI.SpriteBatch.call(this);

	this.data = data;
	this.tilesets = tilesets;

	this.position.x = data.x || 0;
	this.position.y = data.y || 0;
	if (data.opacity === undefined) {
		data.opacity = 1;
	}
	this.alpha = data.opacity;
	this.visible = !!data.visible;

	this._animated = [];

	for (var y = 0; y < data.height; y++) {
		for (var x = 0; x < data.width; x++) {
			var iii = y * data.width + x;
			var id = data.data[iii];
			found:
			for (var i = 0, l = tilesets.length; i < l; i++) {
				var t = tilesets[i];
				if (id - t.data.firstgid <= 0) {
					continue found;
				}
				var sprite = t.CreateSprite(id);

				if (sprite) {
					sprite.position.x = x * tilewidth + data.x;
					sprite.position.y = y * tileheight + data.y;

					if (t.data.tileoffset) {
						sprite.position.x += t.data.tileoffset.x;
						sprite.position.y += t.data.tileoffset.y;
					}

					if (sprite.textures) {
						this._animated.push(sprite);
					}

					this.addChild(sprite);
					break found;
				}
			}
		}
	}

	this.cacheAsBitmap = this._animated.length == 0;
}

TileLayer.prototype = Object.create(PIXI.SpriteBatch.prototype);
TileLayer.constructor = TileLayer;

TileLayer.prototype.updateTransform = function() {
	var _animated = this._animated;
	for (var i = 0, l = _animated.length; i < l; i++) {
		_animated[i].updateTransform();
	}
	PIXI.SpriteBatch.prototype.updateTransform.call(this);
}


module.exports = TileLayer;

},{}],"/home/lain/gocode/src/oniproject/js/tiled/tileset.js":[function(require,module,exports){
'use strict';

function Tileset(data, path, tilewidth, tileheight) {
	this.data = data;

	if (!data.tiles) {
		data.tiles = {};
	}

	if (!tilewidth) {
		tilewidth = data.tilewidth;
	}
	if (!tileheight) {
		tileheight = data.tileheight;
	}

	var image = this.image = new PIXI.ImageLoader(path + data.image);

	var tiles = this.tiles = [];

	var ww = 0,
		hh = 0;
	for (var y = data.margin; y < data.imageheight; y += tileheight + data.spacing) {
		hh++;
		for (var x = data.margin; x < data.imagewidth; x += tilewidth + data.spacing) {
			var rect = {
				x: x,
				y: y,
				width: data.tilewidth,
				height: data.tileheight,
			};
			var t = new PIXI.Texture(image.texture.baseTexture, rect);
			tiles.push(t);
		}
	}


	/*for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var rect = {
				x: x * size.width,
				y: y * size.height,
				width: size.width,
				height: size.height,
			};
			tiles.push(new PIXI.Texture(image.texture.baseTexture, rect));
		}
	}*/

	/*this.name = "nvfjdklsvnfdjkls";
	this.firstgid = 1;
	this.image = "nvjfkdls";
	this.imagewidth = 423423;
	this.imageheight = 423423;

	this.margin = 1;
	this.spacing = 1;

	this.tilewidth = 32;
	this.tileheight = 32;

	this.tiles = [];
	*/
}

Tileset.prototype.load = function(fn) {
	if (fn) {
		this.image.on('loaded', fn);
	}
	this.image.load();
}


Tileset.prototype.CreateSprite = function(id) {
	if (id == 0) {
		return;
	}

	var data = this.data;
	id -= data.firstgid;
	var texture = this.tiles[id];


	if (!texture) {
		console.error('TEXTURE FAIL', data.name, id, id + data.firstgid, data.firstgid);
		return;
	}

	var sprite = new PIXI.Sprite(texture);
	sprite.data = data.tiles[id];


	if (sprite.data && sprite.data.animation) {
		sprite.last = window.performance.now();
		sprite.currentFrame = 0;
		sprite.updateTransform = updateTransform;

		sprite.textures = [];
		for (var i = 0, l = sprite.data.animation.length; i < l; i++) {
			var t = sprite.data.animation[i];
			sprite.textures.push(this.tiles[t.tileid]);
		}
	}

	return sprite;
}

function updateTransform() {
	PIXI.Sprite.prototype.updateTransform.call(this);

	if (!this.textures) return;

	var time = window.performance.now();
	var frame = this.data.animation[this.currentFrame];

	if (time - this.last > frame.duration) {
		this.currentFrame++;
		if (this.currentFrame >= this.data.animation.length) {
			this.currentFrame = 0;
		}

		this.setTexture(this.textures[this.currentFrame]);

		this.last += frame.duration;
	}
}

module.exports = Tileset;

},{}],"/home/lain/gocode/src/oniproject/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},["./js/main.js"])


//# sourceMappingURL=main.js.map