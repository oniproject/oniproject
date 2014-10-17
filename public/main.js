(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./js/main.js":[function(require,module,exports){
'use strict';

console.log('fuck');

var Tileset = require('./tileset'),
	Tilemap = require('./tilemap');

var Suika = require('./suika');

function run(player, host) {
	var w = window.innerWidth,
		h = window.innerHeight,
		stage = new PIXI.Stage(0xFFFFFF, true),
		renderer = PIXI.autoDetectRenderer(w, h);
	document.body.appendChild(renderer.view);

	var WH = {
		width: 32,
		height: 32
	},
	World_A1 = new Tileset('/game/World_A1.png', 16, 12, WH),
	World_A2 = new Tileset('/game/World_A2.png', 16, 12, WH),
	World_B = new Tileset('/game/World_B.png', 16, 16, WH),
	Outside_A1 = new Tileset('/game/Outside_A1.png', 16, 12, WH), // Animation
	Outside_A2 = new Tileset('/game/Outside_A2.png', 16, 12, WH), // Ground
	Outside_A3 = new Tileset('/game/Outside_A3.png', 16, 8, WH), // Buildings
	Outside_A4 = new Tileset('/game/Outside_A4.png', 16, 15, WH), // Walls
	Outside_A5 = new Tileset('/game/Outside_A5.png', 8, 16, WH), // Normal
	Outside_B = new Tileset('/game/Outside_B.png', 16, 16, WH),
	Outside_C = new Tileset('/game/Outside_C.png', 16, 16, WH),
	nn = 31,
	data = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, nn, 0, nn, nn, nn, 0],
		[0, nn, 0, nn, 0, 0, 0],
		[0, nn, 0, nn, 0, 0, 0],
		[0, nn, nn, nn, nn, nn, 0],
		[0, 0, 0, nn, 0, nn, 0],
		[0, 0, 0, nn, 0, nn, 0],
		[0, nn, nn, nn, 0, nn, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, nn, nn, nn, 0, 0, 0],
		[0, nn, 0, nn, 0, 0, 0],
		[0, nn, nn, nn, 0, 0, 0],
		[0, 0, nn, nn, nn, 0, 0],
		[0, 0, 0, nn, nn, 0, 0],
		[0, 0, 0, nn, nn, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
	];

	window.Outside = [Outside_A1, Outside_A2, Outside_A3, Outside_A4, Outside_A5, Outside_B, Outside_C];

	window.scene = new Tilemap(20, 20, Outside);
	for (var y = 0, ml = data.length; y < ml; y++) {
		var line = data[y];
		for (var x = 0, ll = line.length; x < ll; x++) {
			var nnn = data[y][x];
			if (nnn) {
				scene.setAt(x, y, 'second', 0, [0, 1, 2], true);
				scene.setAt(x, y, 'third', 0, 3, true);
			} else {
				scene.setAt(x, y, 'second', 0, [0, 1, 2], true);
			}
		}
	}

	var Game = require('./game');
	window.game = new Game(renderer, stage, player, 'ws://' + host + '/ws', require('./test-map'));
	stage.addChild(scene);

	var suika = new Suika();
	suika.position.x = 440;
	suika.position.y = 300;
	game.suika = suika;
	suika.animation = 'walk';
	stage.addChild(suika);

	window.onresize = resize;
	resize();

	function resize() {
		w = window.innerWidth;
		h = window.innerHeight;
		game.resize(w, h);

		renderer.resize(w, h);
	}

	requestAnimFrame(render);

	function render() {
		requestAnimFrame(render);
		game.render();
		renderer.render(stage);
		var a = game.avatars[game.player];
		if(a) {
			var d = Math.atan2(a.lastvel.x||0, a.lastvel.y||0);
			var dd = d/Math.PI * 180 - 45;
			suika.direction = dd;
		}
	}

	setInterval(animate, 50);
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


	function animate() {
		game.animate(0.05);
	}
}

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
			{Name: "43"},
			{Name: "1k"},
			{Name: "4njki32"},
			{Name: "PPPPvndfsj"},
		],
        target: { Race: 0, HP: 0, MHP:0, Name: "vnfdjsk" },
		spells: [
			{Icon:'all-for-one'},
			{Icon:'all-for-one'},
			{Icon:'all-for-one'},
			{Icon:'all-for-one'},
			{Icon:'all-for-one'},

			{Icon:'screaming'},
			{Icon:'screaming'},
			{Icon:'screaming'},
			{Icon:'screaming'},
			{Icon:'screaming'},

			{Icon:'spiral-thrust'},
			{Icon:'spiral-thrust'},
			{Icon:'spiral-thrust'},
			{Icon:'spiral-thrust'},
			{Icon:'spiral-thrust'},

			{Icon:'rune-sword'},
			{Icon:'rune-sword'},
			{Icon:'rune-sword'},
			{Icon:'rune-sword'},
			{Icon:'rune-sword'},
		],
	},
	methods: {
		cast: function(spell) {
			console.info('cast', spell);
			game.net.FireMsg({t: ""+spell});
		},
		drop: function(index) {
			game.net.DropItemMsg({Id:index});
		},
	},
}),

	r = new XMLHttpRequest();
r.open('POST', '/game', true);
r.onreadystatechange = function() {
	if (r.readyState != 4 || r.status != 200) { return; }
	var json = JSON.parse(r.responseText);
	if (json.Id !== undefined) {
		console.log('Success:', json);
		run(json.Id, json.Host);
	}
};
r.send();

},{"./game":"/home/lain/gocode/src/oniproject/js/game.js","./suika":"/home/lain/gocode/src/oniproject/js/suika.js","./test-map":"/home/lain/gocode/src/oniproject/js/test-map.json","./tilemap":"/home/lain/gocode/src/oniproject/js/tilemap.js","./tileset":"/home/lain/gocode/src/oniproject/js/tileset.js"}],"/home/lain/gocode/src/oniproject/js/avatar.js":[function(require,module,exports){
'use strict';

var Isomer = require('isomer'),
	Octahedron = require('./octahedron'),
	Knot = require('./knot'),
	/* Some convenient renames */
	Point = Isomer.Point,
	Path = Isomer.Path,
	Shape = Isomer.Shape,
	Color = Isomer.Color;

function Avatar() {
	this.position = new Point(0, 0, 0);
	this.velocity = new Point(0, 0, 0);
	this.speed = 1.0;
	this.angle = 0;
	this.rot = 1;
	var c = new Color();
	c.h = Math.random();
	c.s = 0.8;
	c.l = 0.3;
	c.loadRGB();
	this.color = c;
}

Avatar.prototype.draw = function(iso) {
	var pos = this.position;

	if(this.hasOwnProperty('state')) {
		// is avatar or monster
		if(this.state.Id > -10000) {
			iso.add(Octahedron(new Point(pos.x - 0.5, pos.y - 0.5, pos.z))
				.rotateZ(new Point(pos.x, pos.y, pos.z + 0.5), this.angle)
				.scale(new Point(pos.x, pos.y, pos.z), 0.7, 0.7, 0.7), this.color);
		}
		// is avatar or item
		if(this.state.Id < -10000 || this.state.Id > 0) {
			iso.add(Knot(new Point(pos.x-0.5, pos.y-0.5)).scale(new Point(pos.x, pos.y), 0.2, 0.2, 0.2), this.color);
		}
	}
}

Avatar.prototype.isAvatar = function() {
	if(this.hasOwnProperty('state')) {
		return this.state.Id > 0;
	}
}
Avatar.prototype.isMonster = function() {
	if(this.hasOwnProperty('state')) {
		return this.state.Id < 0 && this.state.Id > -10000;
	}
}
Avatar.prototype.isItem = function() {
	if(this.hasOwnProperty('state')) {
		return this.state.Id < -10000;
	}
}

Avatar.prototype.update = function(time) {
	this.angle += this.rot * Math.PI * time;
	this.position.x += this.velocity.x * time;
	this.position.y += this.velocity.y * time;
	this.position.z += this.velocity.z * time;
}

Avatar.prototype.move = function(dir) {
	this.velocity.x = 0;
	this.velocity.y = 0;
	for (var i = 0, l = dir.length; i < l; i++) {
		var to = dir[i];
		switch (to) {
			case 'N':
				this.velocity.x += this.speed;
				break;
			case 'W':
				this.velocity.y += this.speed;
				break;
			case 'S':
				this.velocity.x -= this.speed;
				break;
			case 'E':
				this.velocity.y -= this.speed;
				break;
		}
	}
}

module.exports = Avatar;

},{"./knot":"/home/lain/gocode/src/oniproject/js/knot.js","./octahedron":"/home/lain/gocode/src/oniproject/js/octahedron.js","isomer":"/home/lain/gocode/src/oniproject/node_modules/isomer/index.js"}],"/home/lain/gocode/src/oniproject/js/game.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter,
	Isomer = require('isomer');

Isomer.prototype.reorigin = function(point) {
	var xMap = new Point(point.x * this.transformation[0][0],
		point.x * this.transformation[0][1]),
		yMap = new Point(point.y * this.transformation[1][0],
		point.y * this.transformation[1][1]);

	this.originX = -xMap.x - yMap.x + (this.canvas._width / 2.0);
	this.originY = +xMap.y + yMap.y + (point.z * this.scale) + (this.canvas._height / 2.0);
}

var Point = Isomer.Point,
	Shape = Isomer.Shape,
	Stairs = require('./stairs'),
	Map = require('./map'),
	Avatar = require('./avatar'),
	Net = require('./net');

function Game(renderer, stage, player, url, map) {
	this.initKeyboard();

	this.renderer = renderer;
	this.stage = stage;
	this.dir = [' ', ' '];
	this.player = player;
	this.target = 0;
	this.avatars = {};

	var net = new Net(url);
	this.net = net;
	net.on('message', this.onmessage.bind(this));
	net.on('close', alert.bind(null, 'close WS'));
	net.on('event', this.onevent.bind(this));
	net.on('FireMsg', this.onfire.bind(this));
	net.on('DestroyMsg', this.ondestroy.bind(this));
	net.on('SetTargetMsg', this.ontarget.bind(this));

	var iso = new Isomer(renderer.view);
	this.iso = iso;
	iso.lightColor = new Isomer.Color(0xFF, 0xCC, 0xCC);
	iso.colorDifference = 0.2;
	iso.canvas = new PIXI.Graphics();
	stage.addChild(iso.canvas);
	iso.canvas.path = function(points, color) {
		var c = color.r * 256 * 256 + color.g * 256 + color.b,
			graphics = this; // for moar speed
		graphics.beginFill(c, color.a).moveTo(points[0].x, points[0].y);
		for (var i = 1; i < points.length; i++) {
			graphics.lineTo(points[i].x, points[i].y);
		}
		// XXX hack for pixi v1.6.0
		if (points.length % 2) {
			graphics.lineTo(points[0].x, points[0].y);
		}
		graphics.endFill();
	}

	var game = this;
	iso.canvas.setInteractive(true);
	iso.canvas.click = function(event) {
		for (var id in game.avatars) {
			if (game.avatars.hasOwnProperty(id)) {
				var a = game.avatars[id],
					pos = iso._translatePoint(a.position),
					x = event.global.x - pos.x,
					y = event.global.y - pos.y,
					d = Math.sqrt(x * x + y * y);
				if (d < 50) {
					net.SetTargetMsg({
						id: id
					});
				}
			}
		}
	}

	this.map = new Map(this.iso);
	this.map.objects = map.objects;
}

Game.prototype = EventEmitter.prototype;
Game.prototype.constructor = Game;

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

Game.prototype.resize = function(w, h) {
	this.iso.canvas._width = w;
	this.iso.canvas._height = h;

	this.iso.canvas.hitArea = new PIXI.Rectangle(0, 0, w, h);

	if (this.avatars.hasOwnProperty(this.player)) {
		this.iso.reorigin(this.avatars[this.player].position);
	}
}

Game.prototype.render = function(time) {
	var iso = this.iso;
	iso.canvas.clear();

	this.map.render(this.iso);

	iso.add(Stairs(new Point(-1, 0, 0)));
	iso.add(Stairs(new Point(0, 3, 1)).rotateZ(new Point(0.5, 3.5, 1), -Math.PI / 2));
	iso.add(Stairs(new Point(2, 0, 2)).rotateZ(new Point(2.5, 0.5, 0), -Math.PI / 2));

	var xx = [
		[1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 1],
		[1, 0, 0, 1, 0, 1],
		[1, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 1],
	];

	for (var y = xx.length - 1; y >= 0; y--) {
		for (var x = xx[y].length - 1; x >= 0; x--) {
			if (xx[y][x] != 0) {
				iso.add(Shape.Prism(new Point(x, y, 0), 1, 1, 0.1));
			}
		}
	}

	for (var i in this.avatars) {
		this.avatars[i].draw(iso);
	}
}

Game.prototype.animate = function(time) {
	if (this.avatars.hasOwnProperty(this.player)) {
		var player = this.avatars[this.player];
		player.move(this.dir.join(''));
		this.net.SetVelocityMsg(player.velocity);
	}
	for (var i in this.avatars) {
		this.avatars[i].update(0.05);
	}
	if (this.avatars.hasOwnProperty(this.player)) {
		this.iso.reorigin(this.avatars[this.player].position);
	}
}

Game.prototype.state_msg = function(state) {
	if (state.hasOwnProperty('Id')) {
		switch (state.Type) {
			case 2: // destroy
				delete this.avatars[state.Id];
				break;
			case 1: // create
				this.avatars[state.Id] = new Avatar(state.Position, state.Veloctity)
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
				if (state.Type == 3) {
					avatar.rot = 3;
				}
				avatar.position.x = state.Position.X;
				avatar.position.y = state.Position.Y;
				avatar.velocity.x = state.Veloctity.X;
				avatar.velocity.y = state.Veloctity.Y;
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

},{"./avatar":"/home/lain/gocode/src/oniproject/js/avatar.js","./map":"/home/lain/gocode/src/oniproject/js/map.js","./net":"/home/lain/gocode/src/oniproject/js/net.js","./stairs":"/home/lain/gocode/src/oniproject/js/stairs.js","events":"/home/lain/gocode/src/oniproject/node_modules/browserify/node_modules/events/events.js","isomer":"/home/lain/gocode/src/oniproject/node_modules/isomer/index.js"}],"/home/lain/gocode/src/oniproject/js/knot.js":[function(require,module,exports){
'use strict';

var Isomer = require('isomer'),
	/* Some convenient renames */
	Path = Isomer.Path,
	Point = Isomer.Point,
	Shape = Isomer.Shape;

/* Draws an impossible MC Escher style knot */
function Knot(origin) {
	var knot = new Shape();

	knot.paths = knot.paths.concat(Shape.Prism(Point.ORIGIN, 5, 1, 1).paths);
	knot.paths = knot.paths.concat(Shape.Prism(new Point(4, 1, 0), 1, 4, 1).paths);
	knot.paths = knot.paths.concat(Shape.Prism(new Point(4, 4, -2), 1, 1, 3).paths);

	knot.push(new Path([
		new Point(0, 0, 2),
		new Point(0, 0, 1),
		new Point(1, 0, 1),
		new Point(1, 0, 2)
	]));

	knot.push(new Path([
		new Point(0, 0, 2),
		new Point(0, 1, 2),
		new Point(0, 1, 1),
		new Point(0, 0, 1)
	]));

	return knot.scale(Point.ORIGIN, 1 / 5).translate(-0.1, 0.15, 0.4).translate(origin.x, origin.y, origin.z);
}

module.exports = Knot;

},{"isomer":"/home/lain/gocode/src/oniproject/node_modules/isomer/index.js"}],"/home/lain/gocode/src/oniproject/js/map.js":[function(require,module,exports){
'use strict';

var Isomer = require('isomer');

function Map(iso) {
	this.iso = iso;
	this.objects = [];

	var mod = function(add, obj) {
		for (var i = 0, l = obj.modificators.length; i < l; i++) {
			var mod = obj.modificators[i],
				point = Isomer.Point.apply(null, mod.point);

			switch (mod.type) {
				case 'rotateZ':
					add = add.rotateZ(point, mod.yaw);
					break;
				case 'scale':
					add = add.scale(point, mod.x, mod.y, mod.z);
					break;
				case 'translate':
					add = add.translate(mod.x, mod.y, mod.z);
					break;
				default:
					console.warn('fail mod.type', mod);
			}
		}
		return add;
	};
	this._render_one = function(obj) {
		var add = null;

		switch (obj.type) {
			case 'prism':
				var pos = obj.pos;
				//add = Isomer.Shape.Prism(Isomer.Point.ORIGIN, obj.dx, obj.dy, obj.dz);
				add = Isomer.Shape.Prism(Isomer.Point.ORIGIN, 1, 1, 1);
				//add = add.translate(pos[0], pos[1], pos[2]);
				//add = add.scale(Isomer.Point.apply(null, pos), obj.dx, obj.dy, obj.dz);
				break;
			case 'pyramid':
				var pos = obj.pos;
				add = Isomer.Shape.Pyramid(Isomer.Point.ORIGIN, 1, 1, 1);
				//add = add.translate(pos[0], pos[1], pos[2]);
				//add = add.scale(Isomer.Point.apply(null, pos), obj.dx, obj.dy, obj.dz);
				break;
			case 'cylinder':
				var pos = obj.pos;
				add = Isomer.Shape.Cylinder(Isomer.Point.ORIGIN, 1, obj.vertices, 1);
				//add = add.translate(pos[0], pos[1], pos[2]);
				break;
			case 'path':
				add = new Isomer.Path(obj.path.map(function(el) {
					return Isomer.Point.apply(null, el);
				}));
				break;
			case 'shape':
				add = Isomer.Shape.extrude(new Isomer.Path(obj.path.map(function(el) {
					return Isomer.Point.apply(null, el);
				})), obj.height);
				break;
			default:
				console.warn('fail obj.type', obj);
		}
		if (obj.pos !== undefined) {
			var pos = obj.pos,
				point = Isomer.Point.apply(null, pos);
			add = add.translate(pos[0], pos[1], pos[2]);
			if (obj.size !== undefined) {
				add = add.scale(point, obj.size[0], obj.size[1], obj.size[2]);
			}
			if (obj.yaw !== undefined) {
				add = add.rotateZ(point, obj.yaw * (Math.PI / 180));
			}
		}

		return (add && mod(add, obj)) || null;
	}

	this.render = function() {
		for (var i = 0, l = this.objects.length; i < l; i++) {
			var obj = this.objects[i],
				add = this._render_one(obj),
				color = new Isomer.Color(obj.color[0], obj.color[1], obj.color[2], obj.color[3]);
			add && this.iso.add(add, color);
		}
	};
}

module.exports = Map;

},{"isomer":"/home/lain/gocode/src/oniproject/node_modules/isomer/index.js"}],"/home/lain/gocode/src/oniproject/js/net.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var M_SetVelocityMsg   =1,
    M_SetTargetMsg     =2,
    M_CastMsg          =3,
    M_DestroyMsg       =4,
    M_DropItem         =5,
    M_PickupItem       =6,
    M_RequestInventory =7,
    M_Inventory        =8,
    M_TargetData       =9,
    M_RequestParameters=10,
    M_Parameters       =11,
    ___ =0;

function Net(url) {
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
Net.prototype = EventEmitter.prototype;
Net.prototype.constructor = Net;
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

},{"events":"/home/lain/gocode/src/oniproject/node_modules/browserify/node_modules/events/events.js"}],"/home/lain/gocode/src/oniproject/js/octahedron.js":[function(require,module,exports){
'use strict';

var Isomer = require('isomer'),
	/* Some convenient renames */
	Path = Isomer.Path,
	Shape = Isomer.Shape;

/**
 * Draws an octahedron contained in a 1x1 cube location at origin
 */
function Octahedron(origin) {
	/* Declare the center of the shape to make rotations easy */
	var center = origin.translate(0.5, 0.5, 0.5),
		faces = [],
		/* Draw the upper triangle /\ and rotate it */
		upperTriangle = new Path([
			origin.translate(0, 0, 0.5),
			origin.translate(0.5, 0.5, 1),
			origin.translate(0, 1, 0.5)
		]),
		lowerTriangle = new Path([
			origin.translate(0, 0, 0.5),
			origin.translate(0, 1, 0.5),
			origin.translate(0.5, 0.5, 0)
		]);

	for (var i = 0; i < 4; i++) {
		faces.push(upperTriangle.rotateZ(center, i * Math.PI / 2));
		faces.push(lowerTriangle.rotateZ(center, i * Math.PI / 2));
	}

	/* We need to scale the shape along the x & y directions to make the
	 * sides equilateral triangles */
	return new Shape(faces).scale(center, Math.sqrt(2) / 2, Math.sqrt(2) / 2, 1);
}

module.exports = Octahedron;

},{"isomer":"/home/lain/gocode/src/oniproject/node_modules/isomer/index.js"}],"/home/lain/gocode/src/oniproject/js/stairs.js":[function(require,module,exports){
'use strict';

var Isomer = require('isomer'),
	/* Some convenient renames */
	Path = Isomer.Path,
	Shape = Isomer.Shape;

/* Draws some stars at a given point */
function Stairs(origin) {
	var STEP_COUNT = 10,
		/* Create a zig-zag */
		zigzag = new Path(origin),
		steps = [],
		i,
		/* Shape to return */
		stairs = new Shape();

	for (i = 0; i < STEP_COUNT; i++) {
		/**
		 *  2
		 * __
		 *   | 1
		 */

		var stepCorner = origin.translate(0, i / STEP_COUNT, (i + 1) / STEP_COUNT);
		/* Draw two planes */
		steps.push(new Path([
			stepCorner,
			stepCorner.translate(0, 0, -1 / STEP_COUNT),
			stepCorner.translate(1, 0, -1 / STEP_COUNT),
			stepCorner.translate(1, 0, 0)
		]));

		steps.push(new Path([
			stepCorner,
			stepCorner.translate(1, 0, 0),
			stepCorner.translate(1, 1 / STEP_COUNT, 0),
			stepCorner.translate(0, 1 / STEP_COUNT, 0)
		]));

		zigzag.push(stepCorner);
		zigzag.push(stepCorner.translate(0, 1 / STEP_COUNT, 0));
	}

	zigzag.push(origin.translate(0, 1, 0));

	for (i = 0; i < steps.length; i++) {
		stairs.push(steps[i]);
	}
	stairs.push(zigzag);
	stairs.push(zigzag.reverse().translate(1, 0, 0));

	return stairs;
}

module.exports = Stairs;

},{"isomer":"/home/lain/gocode/src/oniproject/node_modules/isomer/index.js"}],"/home/lain/gocode/src/oniproject/js/suika.js":[function(require,module,exports){
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

},{}],"/home/lain/gocode/src/oniproject/js/test-map.json":[function(require,module,exports){
module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports={"objects":[{"type":"prism","pos":[1,0,0],"size":[4,4,2],"yaw":0,"color":[0,0,0,0],"modificators":[]},{"type":"prism","pos":[0,0,0],"size":[1,3,1],"yaw":15,"color":[0,0,0,0],"modificators":[]},{"type":"pyramid","pos":[2,3,3],"size":[0.5,0.5,0.5],"yaw":0,"color":[180,180,0,0],"modificators":[]},{"type":"pyramid","pos":[4,3,3],"size":[0.5,0.5,0.5],"yaw":0,"color":[180,0,180,0],"modificators":[]},{"type":"pyramid","pos":[4,1,3],"size":[0.5,0.5,0.5],"yaw":0,"color":[0,180,0,0],"modificators":[]},{"type":"pyramid","pos":[2,1,3],"size":[0.5,0.5,0.5],"yaw":0,"color":[40,180,40,0],"modificators":[]},{"type":"cylinder","pos":[0,2,0],"size":[1,1,2],"yaw":0,"vertices":30,"color":[0,0,0,0],"modificators":[]},{"type":"prism","pos":[0,0,0],"size":[3,3,1],"yaw":0,"color":[0,0,0,0],"modificators":[]},{"type":"path","path":[[1,1,1],[2,1,1],[2,2,1],[1,2,1]],"pos":[0,0,0],"size":[1,1,1],"yaw":0,"color":[50,160,60,0],"modificators":[]},{"type":"shape","path":[[1,1,1],[2,1,1],[2,3,1]],"height":0.3,"pos":[0,0,0],"size":[1,1,1],"yaw":0,"color":[50,160,60,0],"modificators":[]}]}
},{}],"/home/lain/gocode/src/oniproject/js/tilemap.js":[function(require,module,exports){
'use strict';

var Tilemap = function(w, h, tilesets, data) {
	PIXI.DisplayObjectContainer.call(this);

	this.w = w;
	this.h = h;
	this.tilesets = tilesets;

	this.step = 0;

	if (!data) {
		data = {
			first: [],
			second: [],
			//objects: [],
			third: [],
		};
	}

	this.data = data;

	this.first = new PIXI.SpriteBatch();
	this.second = new PIXI.SpriteBatch();
	this.third = new PIXI.SpriteBatch();
	this.objects = new PIXI.DisplayObjectContainer();
	this.addChild(this.first);
	this.addChild(this.second);
	this.addChild(this.objects);
	this.addChild(this.third);
	this.third.alpha = 0.1;

	for (var y = 0; y < h; y++) {
		data.first.push(new Array(w));
		data.second.push(new Array(w));
		//data.objects.push(new Array(w));
		data.third.push(new Array(w));
		for (var x = 0; x < w; x++) {
			// t is a tileset
			// v is a tile number
			// if v is array it animated tile
			data.first[y][x] = null;
			data.second[y][x] = null;
			//data.objects[y][x] = 0;
			data.third[y][x] = null;
			//this._setAt(x, y, 'first', 0, [0, 1, 2], true);
			//this._setAt(x, y, 'second', 0, 3, true);
			//this._setAt(x, y, 'first', 5, 56);
			//this._setAt(x, y, 'second', 5, 56);
			//this._setAt(x, y, 'third', 5, 56);
		}
	}
}

Tilemap.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Tilemap.constructor = Tilemap;

function cleanLastSprites(layer, tile) {
	if (!tile) { return; }
	if (tile.hasOwnProperty('s')) {
		try {
			if (tile.s instanceof Array) {
				for (var i = 0, l = tile.s.length; i < l; i++) {
					layer.removeChild(tile.s[i]);
				}
			} else {
				layer.removeChild(tile.s);
			}
		} catch (e) {
			console.error(e);
		}
		delete tile.s;
	}
}

function _line(line, id, x) {
	var def = true;
	if (line === undefined) {
		return [true, true, true];
	}

	var lines = [line[x - 1], line[x], line[x + 1]];
	for (var i = 0, l = lines.length; i < l; i++) {
		var n = lines[i];
		if (n !== undefined && n !== null) {
			if (n.v instanceof Array) {
				n = n.v[0] === id;
			} else {
				n = n.v === id;
			}
		} else if (n === null) {
			n = false;
		} else {
			n = true;
		}
		lines[i] = n;
	}
	return lines;
}

function _addAuto(layer, map, tileset, tile, x, y, frame) {
	var w = tileset.size.width,
		h = tileset.size.height,
		id = (frame !== undefined) ? tile.v[frame] : tile.v,
		zeroId = (frame !== undefined) ? tile.v[0] : tile.v,
		neighbors = [];
	neighbors.push(_line(map[y - 1], zeroId, x));
	neighbors.push(_line(map[y + 0], zeroId, x));
	neighbors.push(_line(map[y + 1], zeroId, x));

	var textures = tileset.atAutoTile(id, neighbors),
		s0 = new PIXI.Sprite(textures[0]),
		s1 = new PIXI.Sprite(textures[1]),
		s2 = new PIXI.Sprite(textures[2]),
		s3 = new PIXI.Sprite(textures[3]);

	s0.position.x = x * w + 0;
	s0.position.y = y * h + 0;
	s0.frame = frame;

	s1.position.x = x * w + w / 2;
	s1.position.y = y * h + 0;
	s1.frame = frame;

	s2.position.x = x * w + 0;
	s2.position.y = y * h + h / 2;
	s2.frame = frame;

	s3.position.x = x * w + w / 2;
	s3.position.y = y * h + h / 2;
	s3.frame = frame;

	layer.addChild(s0);
	layer.addChild(s1);
	layer.addChild(s2);
	layer.addChild(s3);
	return [s0, s1, s2, s3];
}

Tilemap.prototype.redrawAt = function(x, y, layer) {
	try {
		var tile = this.data[layer][y][x];
		this._setAt(x, y, layer, tile.t, tile.v, tile.auto);
	}
	catch (e) {}
}

Tilemap.prototype.setAt = function(x, y, layer, t, v, auto) {
	this._setAt(x, y, layer, t, v, auto);

	switch (layer) {
		case 'first':
			cleanLastSprites(this.second, this.data.second[y][x]);
			this.data.second[y][x] = null;
			cleanLastSprites(this.third, this.data.third[y][x]);
			this.data.third[y][x] = null;
			break;
		case 'second':
			cleanLastSprites(this.third, this.data.third[y][x]);
			this.data.third[y][x] = null;
			break;
	}

	this.redrawAt(x - 1, y - 1, layer);
	this.redrawAt(x - 1, y, layer);
	this.redrawAt(x - 1, y + 1, layer);

	this.redrawAt(x, y - 1, layer);
	this.redrawAt(x, y + 1, layer);

	this.redrawAt(x + 1, y - 1, layer);
	this.redrawAt(x + 1, y, layer);
	this.redrawAt(x + 1, y + 1, layer);
}

Tilemap.prototype._setAt = function(x, y, layer, t, v, auto) {
	if (x < 0 || x > this.w) {
		throw 'Fail X';
	}
	if (y < 0 || y > this.h) {
		throw 'Fail Y';
	}

	if (!this.data.hasOwnProperty(layer) || layer === 'objects') {
		throw 'Fail Layer';
	}

	if (!this.data[layer][y][x]) {
		this.data[layer][y][x] = {t: 0, v: 0};
	}

	var tile = this.data[layer][y][x];
	tile.t = t;
	tile.v = v;
	tile.auto = auto;

	cleanLastSprites(this[layer], tile);

	var tileset = this.tilesets[t];

	if (typeof v === 'number') {
		if (tile.auto) {
			tile.s = _addAuto(this[layer], this.data[layer], tileset, tile, x, y);
		} else {
			var s = new PIXI.Sprite(tileset.at(v));
			s.position.x = x * tileset.size.width;
			s.position.y = y * tileset.size.height;
			this[layer].addChild(s);
			tile.s = s;
		}
	} else if (v instanceof Array) {
		tile.s = [];
		for (var i = 0, l = v.length; i < l; i++) {
			if (tile.auto) {
				var s = _addAuto(this[layer], this.data[layer], tileset, tile, x, y, i);
				tile.s = tile.s.concat(s);
			} else {
				var s = new PIXI.Sprite(tileset.at(v[i]));
				s.position.x = x * tileset.size.width;
				s.position.y = y * tileset.size.height;
				s.frame = i; // for animation
				this[layer].addChild(s);
				tile.s.push(s);
			}
		}
	}
}

Tilemap.prototype.updateTransform = function() {
	PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);

	var frame = this.step + 0.05,
		round = (frame) | 0;
	if (round === 3) {
		round = 0;
	}
	this.step = frame % 3;

	var data = this.data,
		w = this.w,
		h = this.h;

	if (round == this.lastRount) { return; }
	this.lastRount = round;

	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var tile = data.first[y][x];
			if (tile && tile.v instanceof Array && tile.s) {
				for (var i = 0, l = tile.s.length; i < l; i++) {
					var s = tile.s[i];
					s.visible = s.frame === round;
				}
			}
			var tile = data.second[y][x];
			if (tile && tile.v instanceof Array && tile.s) {
				for (var i = 0, l = tile.s.length; i < l; i++) {
					var s = tile.s[i];
					s.visible = s.frame === round;
				}
			}
			var tile = data.third[y][x];
			if (tile && tile.v instanceof Array && tile.s) {
				for (var i = 0, l = tile.s.length; i < l; i++) {
					var s = tile.s[i];
					s.visible = s.frame === round;
				}
			}
		}
	}
}

Tilemap.prototype.Fill = function(x, y, _layer, t, v, auto) {
	var layer = this.data[_layer],
		north,
		south,
		Q = [{x: x, y: y}],
		empty = (layer[y][x]) ? layer[y][x].v : null,
		check = function(x, y) {
			if (y < 0 || y >= layer.length) { return false; }
			if (x < 0 || x >= layer[y].length) { return false; }
			if (!layer[y][x] && !empty) { return true; }
			if (!layer[y][x]) { return false; }

			var v = layer[y][x].v;
			if (typeof v === 'number' && typeof empty === 'number') {
				return v === empty;
			} else if (typeof v !== 'number' && typeof empty !== 'number') {
				if (!empty) { return false; }
				for (var i = 0, l = v.length; i < l; i++) {
					if (v[i] !== empty[i]) {
						return false;
					}
				}
				return true;
			}
			return false;
		};

	while (Q.length) {
		var N = Q.pop();
		x = N.x;
		y = N.y;

		if (check(x, y)) {
			north = south = y;
			do {
				north--;
			} while (check(x, north) && north >= 0);
			do {
				south++;
			} while (check(x, south) && south < layer.length);

			for (var n = north + 1; n < south; n++) {
				this.setAt(x, n, _layer, t, v, auto);
				if (check(x - 1, n)) {
					Q.push({
						x: x - 1,
						y: n,
					});
				}
				if (check(x + 1, n)) {
					Q.push({
						x: x + 1,
						y: n,
					});
				}
			}
		}
	}
}

module.exports = Tilemap;

},{}],"/home/lain/gocode/src/oniproject/js/tileset.js":[function(require,module,exports){
'use strict';

function Tileset(url, w, h, size, noAutoLoad) {
	this.width = w;
	this.height = h;
	this.size = size;

	var image = new PIXI.ImageLoader(url),
		tiles = [];
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var rect = {
				x: x * size.width,
				y: y * size.height,
				width: size.width,
				height: size.height,
			};
			tiles.push(new PIXI.Texture(image.texture.baseTexture, rect));
		}
	}

	this.tiles = tiles;
	if(!noAutoLoad) {
		image.load();
	}
	this.image = image;
}

// x and y for subtile
Tileset.prototype.at = function(i, x, y) {
	if (x === undefined && y === undefined) {
		return this.tiles[i];
	} else {
		// FIXME maybe memory leaks
		var t = this.tiles[i],
			rect = {
				x: t.frame.x + x * this.size.width / 2,
				y: t.frame.y + y * this.size.height / 2,
				width: this.size.width / 2,
				height: this.size.height / 2,
			};
		return new PIXI.Texture(t, rect);
	}
}

/*
 * get
 *  [bool, bool, bool]
 *  [bool, xxxx, bool]
 *  [bool, bool, bool]
 * return
 *  [n, n]
 *  [n, n]
 */

Tileset.prototype.atAutoTile = function(id, neighbors) {
	/*
	 *   |**
	 *   |**
	 * --|--
	 * ↖↑|↑↗
	 * ←4|3→
	 * --|--
	 * ←2|1→
	 * ↙↓|↓↘
	 */
	var w = this.width >>> 1,
		x = (id % w) * 2,
		y = (id - id % w) / w * 3,
		map = [
			(y + 0) * this.width + x + 0,
			(y + 0) * this.width + x + 1,
			(y + 1) * this.width + x + 0,
			(y + 1) * this.width + x + 1,
			(y + 2) * this.width + x + 0,
			(y + 2) * this.width + x + 1,
		],
		one, two, three;

	// 2 3
	// 1 x
	one = neighbors[1][0];
	two = neighbors[0][0];
	three = neighbors[0][1];

	// 1↘  2↖ 3↑ 4← 5*
	var tleft = 2;
	if (one && !two && three) {
		tleft = 1;
	}
	if (one && two && three) {
		tleft = 5;
	}
	if (!one && three) {
		tleft = 4;
	}
	if (one && !three) {
		tleft = 3;
	}

	// 1 2
	// x 3
	one = neighbors[0][1];
	two = neighbors[0][2];
	three = neighbors[1][2];

	// 1↙ 2↑ 3↗ 4* 5→
	var tright = 3;
	if (one && !two && three) {
		tright = 1;
	}
	if (one && two && three) {
		tright = 4;
	}
	if (!one && three) {
		tright = 2;
	}
	if (one && !three) {
		tright = 5;
	}

	// 1 x
	// 2 3
	one = neighbors[1][0];
	two = neighbors[2][0];
	three = neighbors[2][1];

	// 1↗ 2← 3* 4↙ 5↓
	var dleft = 4;
	if (one && !two && three) {
		dleft = 1;
	}
	if (one && two && three) {
		dleft = 3;
	}
	if (!one && three) {
		dleft = 2;
	}
	if (one && !three) {
		dleft = 5;
	}

	// x 1
	// 3 2
	one = neighbors[1][2];
	two = neighbors[2][2];
	three = neighbors[2][1];
	// 1↖ 2* 3→ 4↓ 5↘
	var drigth = 5;
	if (one && !two && three) {
		drigth = 1;
	}
	if (one && two && three) {
		drigth = 2;
	}
	if (!one && three) {
		drigth = 3;
	}
	if (one && !three) {
		drigth = 4;
	}

	return [
		this.at(map[tleft], 0, 0),
		this.at(map[tright], 1, 0),
		this.at(map[dleft], 0, 1),
		this.at(map[drigth], 1, 1),
	];
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

},{}],"/home/lain/gocode/src/oniproject/node_modules/isomer/index.js":[function(require,module,exports){
/**
 * Entry point for the Isomer API
 */
module.exports = require('./js/isomer');

},{"./js/isomer":"/home/lain/gocode/src/oniproject/node_modules/isomer/js/isomer.js"}],"/home/lain/gocode/src/oniproject/node_modules/isomer/js/canvas.js":[function(require,module,exports){
function Canvas(elem) {
  this.elem = elem;
  this.ctx = this.elem.getContext('2d');

  this.width = elem.width;
  this.height = elem.height;
}

Canvas.prototype.clear = function () {
  this.ctx.clearRect(0, 0, this.width, this.height);
};

Canvas.prototype.path = function (points, color) {
  this.ctx.beginPath();
  this.ctx.moveTo(points[0].x, points[0].y);

  for (var i = 1; i < points.length; i++) {
    this.ctx.lineTo(points[i].x, points[i].y);
  }

  this.ctx.closePath();

  /* Set the strokeStyle and fillStyle */
  this.ctx.save()

  this.ctx.globalAlpha = color.a;
  this.ctx.fillStyle = this.ctx.strokeStyle = color.toHex();
  this.ctx.stroke();
  this.ctx.fill();
  this.ctx.restore();
};

module.exports = Canvas;

},{}],"/home/lain/gocode/src/oniproject/node_modules/isomer/js/color.js":[function(require,module,exports){
/**
 * A color instantiated with RGB between 0-255
 *
 * Also holds HSL values
 */
function Color(r, g, b, a) {
  this.r = parseInt(r || 0);
  this.g = parseInt(g || 0);
  this.b = parseInt(b || 0);
  this.a = parseFloat((Math.round(a * 100) / 100 || 1));

  this.loadHSL();
};

Color.prototype.toHex = function () {
  // Pad with 0s
  var hex = (this.r * 256 * 256 + this.g * 256 + this.b).toString(16);

  if (hex.length < 6) {
    hex = new Array(6 - hex.length + 1).join('0') + hex;
  }

  return '#' + hex;
};


/**
 * Returns a lightened color based on a given percentage and an optional
 * light color
 */
Color.prototype.lighten = function (percentage, lightColor) {
  lightColor = lightColor || new Color(255, 255, 255);

  var newColor = new Color(
    (lightColor.r / 255) * this.r,
    (lightColor.g / 255) * this.g,
    (lightColor.b / 255) * this.b,
    this.a
  );

  newColor.l = Math.min(newColor.l + percentage, 1);

  newColor.loadRGB();
  return newColor;
};


/**
 * Loads HSL values using the current RGB values
 * Converted from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype.loadHSL = function () {
  var r = this.r / 255;
  var g = this.g / 255;
  var b = this.b / 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);

  var h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;  // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  this.h = h;
  this.s = s;
  this.l = l;
};


/**
 * Reloads RGB using HSL values
 * Converted from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype.loadRGB = function () {
  var r, g, b;
  var h = this.h;
  var s = this.s;
  var l = this.l;

  if (s === 0) {
    r = g = b = l;  // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = this._hue2rgb(p, q, h + 1/3);
    g = this._hue2rgb(p, q, h);
    b = this._hue2rgb(p, q, h - 1/3);
  }

  this.r = parseInt(r * 255);
  this.g = parseInt(g * 255);
  this.b = parseInt(b * 255);
};


/**
 * Helper function to convert hue to rgb
 * Taken from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype._hue2rgb = function (p, q, t){
  if(t < 0) t += 1;
  if(t > 1) t -= 1;
  if(t < 1/6) return p + (q - p) * 6 * t;
  if(t < 1/2) return q;
  if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
};

module.exports = Color;

},{}],"/home/lain/gocode/src/oniproject/node_modules/isomer/js/isomer.js":[function(require,module,exports){
var Canvas = require('./canvas');
var Color = require('./color');
var Path = require('./path');
var Point = require('./point');
var Shape = require('./shape');
var Vector = require('./vector');


/**
 * The Isomer class
 *
 * This file contains the Isomer base definition
 */
function Isomer(canvasId, options) {
  options = options || {};

  this.canvas = new Canvas(canvasId);
  this.angle = Math.PI / 6;

  this.scale = options.scale || 70;

  this._calculateTransformation();

  this.originX = options.originX || this.canvas.width / 2;
  this.originY = options.originY || this.canvas.height * 0.9;

  /**
   * Light source as defined as the angle from
   * the object to the source.
   *
   * We'll define somewhat arbitrarily for now.
   */
  this.lightPosition = options.lightPosition || new Vector(2, -1, 3);
  this.lightAngle = this.lightPosition.normalize();

  /**
   * The maximum color difference from shading
   */
  this.colorDifference = 0.20;
  this.lightColor = options.lightColor || new Color(255, 255, 255);
}

/**
 * Sets the light position for drawing.
 */
Isomer.prototype.setLightPosition = function (x, y, z) {
  this.lightPosition = new Vector(x, y, z);
  this.lightAngle = this.lightPosition.normalize();
}

Isomer.prototype._translatePoint = function (point) {
  /**
   * X rides along the angle extended from the origin
   * Y rides perpendicular to this angle (in isometric view: PI - angle)
   * Z affects the y coordinate of the drawn point
   */
  var xMap = new Point(point.x * this.transformation[0][0],
                       point.x * this.transformation[0][1]);

  var yMap = new Point(point.y * this.transformation[1][0],
                       point.y * this.transformation[1][1]);

  var x = this.originX + xMap.x + yMap.x;
  var y = this.originY - xMap.y - yMap.y - (point.z * this.scale);
  return new Point(x, y);
};


/**
 * Adds a shape or path to the scene
 *
 * This method also accepts arrays
 */
Isomer.prototype.add = function (item, baseColor) {
  if (Object.prototype.toString.call(item) == '[object Array]') {
    for (var i = 0; i < item.length; i++) {
      this.add(item[i], baseColor);
    }
  } else if (item instanceof Path) {
    this._addPath(item, baseColor);
  } else if (item instanceof Shape) {
    /* Fetch paths ordered by distance to prevent overlaps */
    var paths = item.orderedPaths();
    for (var i in paths) {
      this._addPath(paths[i], baseColor);
    }
  }
};


/**
 * Adds a path to the scene
 */
Isomer.prototype._addPath = function (path, baseColor) {
  /* Default baseColor */
  baseColor = baseColor || new Color(120, 120, 120);

  /* Compute color */
  var v1 = Vector.fromTwoPoints(path.points[1], path.points[0]);
  var v2 = Vector.fromTwoPoints(path.points[2], path.points[1]);

  var normal = Vector.crossProduct(v1, v2).normalize();

  /**
   * Brightness is between -1 and 1 and is computed based
   * on the dot product between the light source vector and normal.
   */
  var brightness = Vector.dotProduct(normal, this.lightAngle);
  color = baseColor.lighten(brightness * this.colorDifference, this.lightColor);

  this.canvas.path(path.points.map(this._translatePoint.bind(this)), color);
};

/**
 * Precalculates transformation values based on the current angle and scale
 * which in theory reduces costly cos and sin calls
 */
Isomer.prototype._calculateTransformation = function () {
  this.transformation = [
    [
      this.scale * Math.cos(this.angle),
      this.scale * Math.sin(this.angle)
    ],
    [
      this.scale * Math.cos(Math.PI - this.angle),
      this.scale * Math.sin(Math.PI - this.angle)
    ]
  ];
}

/* Namespace our primitives */
Isomer.Canvas = Canvas;
Isomer.Color = Color;
Isomer.Path = Path;
Isomer.Point = Point;
Isomer.Shape = Shape;
Isomer.Vector = Vector;

/* Expose Isomer API */
module.exports = Isomer;

},{"./canvas":"/home/lain/gocode/src/oniproject/node_modules/isomer/js/canvas.js","./color":"/home/lain/gocode/src/oniproject/node_modules/isomer/js/color.js","./path":"/home/lain/gocode/src/oniproject/node_modules/isomer/js/path.js","./point":"/home/lain/gocode/src/oniproject/node_modules/isomer/js/point.js","./shape":"/home/lain/gocode/src/oniproject/node_modules/isomer/js/shape.js","./vector":"/home/lain/gocode/src/oniproject/node_modules/isomer/js/vector.js"}],"/home/lain/gocode/src/oniproject/node_modules/isomer/js/path.js":[function(require,module,exports){
var Point = require('./point');

/**
 * Path utility class
 *
 * An Isomer.Path consists of a list of Isomer.Point's
 */
function Path(points) {
  if (Object.prototype.toString.call(points) === '[object Array]') {
    this.points = points;
  } else {
    this.points = Array.prototype.slice.call(arguments);
  }
}


/**
 * Pushes a point onto the end of the path
 */
Path.prototype.push = function (point) {
  this.points.push(point);
};


/**
 * Returns a new path with the points in reverse order
 */
Path.prototype.reverse = function () {
  var points = Array.prototype.slice.call(this.points);

  return new Path(points.reverse());
};


/**
 * Translates a given path
 *
 * Simply a forward to Point#translate
 */
Path.prototype.translate = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.translate.apply(point, args);
  }));
};

/**
 * Returns a new path rotated along the X axis by a given origin
 *
 * Simply a forward to Point#rotateX
 */
Path.prototype.rotateX = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.rotateX.apply(point, args);
  }));
};

/**
 * Returns a new path rotated along the Y axis by a given origin
 *
 * Simply a forward to Point#rotateY
 */
Path.prototype.rotateY = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.rotateY.apply(point, args);
  }));
};

/**
 * Returns a new path rotated along the Z axis by a given origin
 *
 * Simply a forward to Point#rotateZ
 */
Path.prototype.rotateZ = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.rotateZ.apply(point, args);
  }));
};


/**
 * Scales a path about a given origin
 *
 * Simply a forward to Point#scale
 */
Path.prototype.scale = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.scale.apply(point, args);
  }));
};


/**
 * The estimated depth of a path as defined by the average depth
 * of its points
 */
Path.prototype.depth = function () {
  var i, total = 0;
  for (i = 0; i < this.points.length; i++) {
    total += this.points[i].depth();
  }

  return total / (this.points.length || 1);
};


/**
 * Some paths to play with
 */

/**
 * A rectangle with the bottom-left corner in the origin
 */
Path.Rectangle = function (origin, width, height) {
  if (width === undefined) width = 1;
  if (height === undefined) height = 1;

  var path = new Path([
    origin,
    new Point(origin.x + width, origin.y, origin.z),
    new Point(origin.x + width, origin.y + height, origin.z),
    new Point(origin.x, origin.y + height, origin.z)
  ]);

  return path;
};


/**
 * A circle centered at origin with a given radius and number of vertices
 */
Path.Circle = function (origin, radius, vertices) {
  vertices = vertices || 20;
  var i, path = new Path();

  for (i = 0; i < vertices; i++) {
    path.push(new Point(
      radius * Math.cos(i * 2 * Math.PI / vertices),
      radius * Math.sin(i * 2 * Math.PI / vertices),
      0));
  }

  return path.translate(origin.x, origin.y, origin.z);
};


/**
 * A star centered at origin with a given outer radius, inner
 * radius, and number of points
 *
 * Buggy - concave polygons are difficult to draw with our method
 */
Path.Star = function (origin, outerRadius, innerRadius, points) {
  var i, r, path = new Path();

  for (i = 0; i < points * 2; i++) {
    r = (i % 2 === 0) ? outerRadius : innerRadius;

    path.push(new Point(
      r * Math.cos(i * Math.PI / points),
      r * Math.sin(i * Math.PI / points),
      0));
  }

  return path.translate(origin.x, origin.y, origin.z);
};


/* Expose the Path constructor */
module.exports = Path;

},{"./point":"/home/lain/gocode/src/oniproject/node_modules/isomer/js/point.js"}],"/home/lain/gocode/src/oniproject/node_modules/isomer/js/point.js":[function(require,module,exports){
function Point(x, y, z) {
  if (this instanceof Point) {
    this.x = (typeof x === 'number') ? x : 0;
    this.y = (typeof y === 'number') ? y : 0;
    this.z = (typeof z === 'number') ? z : 0;
  } else {
    return new Point(x, y, z);
  }
}


Point.ORIGIN = new Point(0, 0, 0);


/**
 * Translate a point from a given dx, dy, and dz
 */
Point.prototype.translate = function (dx, dy, dz) {
  return new Point(
    this.x + dx,
    this.y + dy,
    this.z + dz);
};


/**
 * Scale a point about a given origin
 */
Point.prototype.scale = function (origin, dx, dy, dz) {
  var p = this.translate(-origin.x, -origin.y, -origin.z);

  if (dy === undefined && dz === undefined) {
    /* If both dy and dz are left out, scale all coordinates equally */
    dy = dz = dx;
    /* If just dz is missing, set it equal to 1 */
  } else {
    dz = (typeof dz === 'number') ? dz : 1;
  }

  p.x *= dx;
  p.y *= dy;
  p.z *= dz;

  return p.translate(origin.x, origin.y, origin.z);
};

/**
 * Rotate about origin on the X axis
 */
Point.prototype.rotateX = function (origin, angle) {
  var p = this.translate(-origin.x, -origin.y, -origin.z);

  var z = p.z * Math.cos(angle) - p.y * Math.sin(angle);
  var y = p.z * Math.sin(angle) + p.y * Math.cos(angle);
  p.z = z;
  p.y = y;

  return p.translate(origin.x, origin.y, origin.z);
};

/**
 * Rotate about origin on the Y axis
 */
Point.prototype.rotateY = function (origin, angle) {
  var p = this.translate(-origin.x, -origin.y, -origin.z);

  var x = p.x * Math.cos(angle) - p.z * Math.sin(angle);
  var z = p.x * Math.sin(angle) + p.z * Math.cos(angle);
  p.x = x;
  p.z = z;

  return p.translate(origin.x, origin.y, origin.z);
};

/**
 * Rotate about origin on the Z axis
 */
Point.prototype.rotateZ = function (origin, angle) {
  var p = this.translate(-origin.x, -origin.y, -origin.z);

  var x = p.x * Math.cos(angle) - p.y * Math.sin(angle);
  var y = p.x * Math.sin(angle) + p.y * Math.cos(angle);
  p.x = x;
  p.y = y;

  return p.translate(origin.x, origin.y, origin.z);
};


/**
 * The depth of a point in the isometric plane
 */
Point.prototype.depth = function () {
  /* z is weighted slightly to accomodate |_ arrangements */
    return this.x + this.y - 2*this.z;
};


/**
 * Distance between two points
 */
Point.distance = function (p1, p2) {
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  var dz = p2.z - p1.z;

  return Math.sqrt(dx*dx + dy*dy + dz*dz);
};


module.exports = Point;

},{}],"/home/lain/gocode/src/oniproject/node_modules/isomer/js/shape.js":[function(require,module,exports){
var Path = require('./path');
var Point = require('./point');

/**
 * Shape utility class
 *
 * An Isomer.Shape consists of a list of Isomer.Path's
 */
function Shape(paths) {
  if (Object.prototype.toString.call(paths) === '[object Array]') {
    this.paths = paths;
  } else {
    this.paths = Array.prototype.slice.call(arguments);
  }
}


/**
 * Pushes a path onto the end of the Shape
 */
Shape.prototype.push = function (path) {
  this.paths.push(path);
};


/**
 * Translates a given shape
 *
 * Simply a forward to Path#translate
 */
Shape.prototype.translate = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.translate.apply(path, args);
  }));
};

/**
 * Rotates a given shape along the X axis around a given origin
 *
 * Simply a forward to Path#rotateX
 */
Shape.prototype.rotateX = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.rotateX.apply(path, args);
  }));
};

/**
 * Rotates a given shape along the Y axis around a given origin
 *
 * Simply a forward to Path#rotateY
 */
Shape.prototype.rotateY = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.rotateY.apply(path, args);
  }));
};

/**
 * Rotates a given shape along the Z axis around a given origin
 *
 * Simply a forward to Path#rotateZ
 */
Shape.prototype.rotateZ = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.rotateZ.apply(path, args);
  }));
};

/**
 * Scales a path about a given origin
 *
 * Simply a forward to Point#scale
 */
Shape.prototype.scale = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.scale.apply(path, args);
  }));
};


/**
 * Produces a list of the shape's paths ordered by distance to
 * prevent overlaps when drawing
 */
Shape.prototype.orderedPaths = function () {
  var paths = this.paths.slice();

  /**
   * Sort the list of faces by distance then map the entries, returning
   * only the path and not the added "further point" from earlier.
   */
  return paths.sort(function (pathA, pathB) {
    return pathB.depth() - pathA.depth();
  });
};


/**
 * Utility function to create a 3D object by raising a 2D path
 * along the z-axis
 */
Shape.extrude = function (path, height) {
  height = (typeof height === 'number') ? height : 1;

  var i, topPath = path.translate(0, 0, height);
  var shape = new Shape();

  /* Push the top and bottom faces, top face must be oriented correctly */
  shape.push(path.reverse());
  shape.push(topPath);

  /* Push each side face */
  for (i = 0; i < path.points.length; i++) {
    shape.push(new Path([
      topPath.points[i],
      path.points[i],
      path.points[(i + 1) % path.points.length],
      topPath.points[(i + 1) % topPath.points.length]
    ]));
  }

  return shape;
};


/**
 * Some shapes to play with
 */

/**
 * A prism located at origin with dimensions dx, dy, dz
 */
Shape.Prism = function (origin, dx, dy, dz) {
  dx = (typeof dx === 'number') ? dx : 1;
  dy = (typeof dy === 'number') ? dy : 1;
  dz = (typeof dz === 'number') ? dz : 1;

  /* The shape we will return */
  var prism = new Shape();

  /* Squares parallel to the x-axis */
  var face1 = new Path([
    origin,
    new Point(origin.x + dx, origin.y, origin.z),
    new Point(origin.x + dx, origin.y, origin.z + dz),
    new Point(origin.x, origin.y, origin.z + dz)
  ]);

  /* Push this face and its opposite */
  prism.push(face1);
  prism.push(face1.reverse().translate(0, dy, 0));

  /* Square parallel to the y-axis */
  var face2 = new Path([
    origin,
    new Point(origin.x, origin.y, origin.z + dz),
    new Point(origin.x, origin.y + dy, origin.z + dz),
    new Point(origin.x, origin.y + dy, origin.z)
  ]);
  prism.push(face2);
  prism.push(face2.reverse().translate(dx, 0, 0));

  /* Square parallel to the xy-plane */
  var face3 = new Path([
    origin,
    new Point(origin.x + dx, origin.y, origin.z),
    new Point(origin.x + dx, origin.y + dy, origin.z),
    new Point(origin.x, origin.y + dy, origin.z)
  ]);
  /* This surface is oriented backwards, so we need to reverse the points */
  prism.push(face3.reverse());
  prism.push(face3.translate(0, 0, dz));

  return prism;
};


Shape.Pyramid = function (origin, dx, dy, dz) {
  dx = (typeof dx === 'number') ? dx : 1;
  dy = (typeof dy === 'number') ? dy : 1;
  dz = (typeof dz === 'number') ? dz : 1;

  var pyramid = new Shape();

  /* Path parallel to the x-axis */
  var face1 = new Path([
    origin,
    new Point(origin.x + dx, origin.y, origin.z),
    new Point(origin.x + dx / 2, origin.y + dy / 2, origin.z + dz)
  ]);
  /* Push the face, and its opposite face, by rotating around the Z-axis */
  pyramid.push(face1);
  pyramid.push(face1.rotateZ(origin.translate(dx/2, dy/2), Math.PI));

  /* Path parallel to the y-axis */
  var face2 = new Path([
    origin,
    new Point(origin.x + dx / 2, origin.y + dy / 2, origin.z + dz),
    new Point(origin.x, origin.y + dy, origin.z)
  ]);
  pyramid.push(face2);
  pyramid.push(face2.rotateZ(origin.translate(dx/2, dy/2), Math.PI));

  return pyramid;
};


Shape.Cylinder = function (origin, radius, vertices, height) {
  radius = (typeof radius === 'number') ? radius : 1;

  var circle = Path.Circle(origin, radius, vertices);
  var cylinder = Shape.extrude(circle, height);

  return cylinder;
};


module.exports = Shape;

},{"./path":"/home/lain/gocode/src/oniproject/node_modules/isomer/js/path.js","./point":"/home/lain/gocode/src/oniproject/node_modules/isomer/js/point.js"}],"/home/lain/gocode/src/oniproject/node_modules/isomer/js/vector.js":[function(require,module,exports){
function Vector(i, j, k) {
  this.i = (typeof i === 'number') ? i : 0;
  this.j = (typeof j === 'number') ? j : 0;
  this.k = (typeof k === 'number') ? k : 0;
}

/**
 * Alternate constructor
 */
Vector.fromTwoPoints = function (p1, p2) {
  return new Vector(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
};

Vector.crossProduct = function (v1, v2) {
  var i = v1.j * v2.k - v2.j * v1.k;
  var j = -1 * (v1.i * v2.k - v2.i * v1.k);
  var k = v1.i * v2.j - v2.i * v1.j;

  return new Vector(i, j, k);
};

Vector.dotProduct = function (v1, v2) {
  return v1.i * v2.i + v1.j * v2.j + v1.k * v2.k;
};

Vector.prototype.magnitude = function () {
  return Math.sqrt(this.i*this.i + this.j*this.j + this.k*this.k);
};

Vector.prototype.normalize = function () {
  var magnitude = this.magnitude();
  return new Vector(this.i / magnitude, this.j / magnitude, this.k / magnitude);
};

module.exports = Vector;

},{}]},{},["./js/main.js"])


//# sourceMappingURL=main.js.map