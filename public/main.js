(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./js/main.js":[function(require,module,exports){
'use strict';

require('insert-css')(require('./game.styl'));

var Vue = window.Vue;
var requestAnimFrame = window.requestAnimFrame;

var Stats = require('./Stats');
var stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms

// align top-right
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '100px';
stats.domElement.style.top = '0px';

document.body.appendChild(stats.domElement);

console.log('fuck');

var w = window.innerWidth,
	h = window.innerHeight,
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h, {
		//view:
		transparent: true,
		antialias: false,
		resolution: 1,
	});
document.body.appendChild(renderer.view);

window.onresize = function() {
	w = window.innerWidth;
	h = window.innerHeight;
	renderer.resize(w, h);
};
window.onresize();

var Game = require('./game');
var game = window.game = new Game(renderer, stage, UI);

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
	stats.begin();

	var t = window.performance.now();
	if (t - lastTime > updateT) {
		game.update(updateT);
		lastTime += updateT;
	}
	game.render();
	renderer.render(stage);

	stats.end();
}

game.net.on('open', function() {
	game.net.RequestParametersMsg();
	game.net.RequestInventoryMsg();
	UI.isConnected = true;
	console.info('ws open');
});

game.net.on('close', function() {
	UI.isConnected = false;
	console.warn('ws close');
	setTimeout(getConnectionData, 1000);
});


game.net.on('TargetDataMsg', function(target) {
	console.log('TargetDataMsg');
	UI.target = target;
});
game.net.on('InventoryMsg', function(inv) {
	UI.inventory = inv.Inventory;
	UI.equip = inv.Equip;
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

game.net.on('ChatMsg', function(msg) {
	console.log('ChatMsg', msg);
	UI.chat.push(msg);
	game.avatars[msg.Id].msg = msg.Text;
});

var UI = window.UI = new Vue({
	el: '#ui',
	data: {
		isConnected: false,

		level: 88,
		exp: 77,
		hp: 190,
		mhp: 300,
		mp: 50,
		mmp: 300,
		tp: 50,
		mtp: 100,

		showEquip: false,
		showSpells: false,
		showInventory: false,
		showChat: true,

		msg: 'msgqwer freqw',
		chat: [{
			Name: 'vfndjskl',
			Text: 'vfds',
			Type: 'party'
			}, {
			Name: 'vfndjskl',
			Text: 'wqurio',
			Type: 'local'
			}, {
			Name: 'vfndjskl',
			Text: 'wqurio',
			Type: 'guild'
			}, {
			Name: 'vfndjskl',
			Text: 'qwioerh',
			Type: 'admin'
		}],
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
			Id: 0,
			Race: 0,
			HP: 0,
			MHP: 0,
			Name: 'vnfdjsk'
		},
		invTest: [
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
			{
				Icon: 'all-for-one'
			},
			{
				Icon: 'screaming'
			},
		],
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
			{
				Icon: 'all-for-one'
			},
			{
				Icon: 'screaming'
			},
		],
	},
	computed: {
		showTargetBar: function() {
			return !!this.target.Id;
		},
	},
	components: {
		scrollbar: {
			scrollTopX: 5,
			created: function() {
				this.$on('scroll', function() {
					this.scrollTopX = this.$parent.scrollTop;
					console.log('scroll', this.scrollTopX, this.$parent.scrollH);
				});
			},
			methods: {
				up: function(event) {
					this.$parent.$emit('up');
				},
				down: function(event) {
					this.$parent.$emit('down');
				},
			}
		},
		scrolled: {
			computed: {
				scrollTop: function() {
					var el = this.$el.querySelector('.native');
					return el.scrollTop;
				},
				scrollH: function() {
					var el = this.$el.querySelector('.scrollbar-wrap');
					var el2 = this.$el.querySelector('.s-content');
					var x = el2.clientHeight / el.clientHeight;
					console.log(x, el.clientHeight, el2.clientHeight);
					return x;
				},
			},
			methods: {
				scroll: function() {
					this.$broadcast('scroll', this.scrollTop);
				},
			},
			created: function() {
				this.$on('up', function() {
					this.$broadcast('scroll');
					this.$el.querySelector('.native').scrollTop -= 60;
				});
				this.$on('down', function() {
					this.$broadcast('scroll');
					this.$el.querySelector('.native').scrollTop += 60;
				});
			}
		},
		draggable: {
			dragged: false,
			methods: {
				dragStart: function(event) {
					this.dragged = true;
				},
				dragMove: function(event) {
					if (this.dragged) {
						var b = this.$el.getBoundingClientRect();
						var x = (event.movementX !== undefined) ? event.movementX : event.mozMovementX;
						var y = (event.movementY !== undefined) ? event.movementY : event.mozMovementY;
						this.$el.style.left = b.left + x + 'px';
						this.$el.style.top = b.top + y + 'px';
						console.log('dragged', x, y, event);
					}
				},
				dragEnd: function(event) {
					this.dragged = false;
				},
				dragOut: function(event) {
					this.dragged = false;
				},
			}
		}
	},
	methods: {
		cast: function(spell) {
			console.info('cast', spell);
			game.net.FireMsg('' + spell);
		},
		drop: function(index) {
			game.net.DropItemMsg(index);
		},
		chatMsg: function(event) {
			var msg = this.msg;
			this.msg = '';
			console.info(msg);
			event.target.blur();
			game.net.ChatPostMsg(msg);
		},
		focus: function() {
			game.listener.stop_listening();
		},
		blur: function() {
			game.listener.listen();
		}
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
			game.run(json.Id, json.Host, json.MapId);
		}
	};
	r.send();
}

getConnectionData();

},{"./Stats":"/home/lain/gocode/src/oniproject/js/Stats.js","./game":"/home/lain/gocode/src/oniproject/js/game.js","./game.styl":"/home/lain/gocode/src/oniproject/js/game.styl","insert-css":"/home/lain/gocode/src/oniproject/node_modules/insert-css/index.js"}],"/home/lain/gocode/src/oniproject/js/Stats.js":[function(require,module,exports){
/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {

	var startTime = Date.now(), prevTime = startTime;
	var ms = 0, msMin = Infinity, msMax = 0;
	var fps = 0, fpsMin = Infinity, fpsMax = 0;
	var frames = 0, mode = 0;

	var container = document.createElement( 'div' );
	container.id = 'stats';
	container.addEventListener( 'mousedown', function ( event ) { event.preventDefault(); setMode( ++ mode % 2 ) }, false );
	container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';

	var fpsDiv = document.createElement( 'div' );
	fpsDiv.id = 'fps';
	fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';
	container.appendChild( fpsDiv );

	var fpsText = document.createElement( 'div' );
	fpsText.id = 'fpsText';
	fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	fpsText.innerHTML = 'FPS';
	fpsDiv.appendChild( fpsText );

	var fpsGraph = document.createElement( 'div' );
	fpsGraph.id = 'fpsGraph';
	fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';
	fpsDiv.appendChild( fpsGraph );

	while ( fpsGraph.children.length < 74 ) {

		var bar = document.createElement( 'span' );
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
		fpsGraph.appendChild( bar );

	}

	var msDiv = document.createElement( 'div' );
	msDiv.id = 'ms';
	msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';
	container.appendChild( msDiv );

	var msText = document.createElement( 'div' );
	msText.id = 'msText';
	msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	msText.innerHTML = 'MS';
	msDiv.appendChild( msText );

	var msGraph = document.createElement( 'div' );
	msGraph.id = 'msGraph';
	msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';
	msDiv.appendChild( msGraph );

	while ( msGraph.children.length < 74 ) {

		var bar = document.createElement( 'span' );
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
		msGraph.appendChild( bar );

	}

	var setMode = function ( value ) {

		mode = value;

		switch ( mode ) {

			case 0:
				fpsDiv.style.display = 'block';
				msDiv.style.display = 'none';
				break;
			case 1:
				fpsDiv.style.display = 'none';
				msDiv.style.display = 'block';
				break;
		}

	};

	var updateGraph = function ( dom, value ) {

		var child = dom.appendChild( dom.firstChild );
		child.style.height = value + 'px';

	};

	return {

		REVISION: 12,

		domElement: container,

		setMode: setMode,

		begin: function () {

			startTime = Date.now();

		},

		end: function () {

			var time = Date.now();

			ms = time - startTime;
			msMin = Math.min( msMin, ms );
			msMax = Math.max( msMax, ms );

			msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
			updateGraph( msGraph, Math.min( 30, 30 - ( ms / 200 ) * 30 ) );

			frames ++;

			if ( time > prevTime + 1000 ) {

				fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );
				fpsMin = Math.min( fpsMin, fps );
				fpsMax = Math.max( fpsMax, fps );

				fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
				updateGraph( fpsGraph, Math.min( 30, 30 - ( fps / 100 ) * 30 ) );

				prevTime = time;
				frames = 0;

			}

			return time;

		},

		update: function () {

			startTime = this.end();

		}

	}

};

if ( typeof module === 'object' ) {

	module.exports = Stats;

}
},{}],"/home/lain/gocode/src/oniproject/js/bat.js":[function(require,module,exports){
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

Object.defineProperty(Bat.prototype, 'currentDirection', {
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

Object.defineProperty(Bat.prototype, 'currentAnimation', {
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
	net.on('message', this.onmessage.bind(this));
	//net.on('close', alert.bind(null, 'close WS'));
	net.on('event', this.onevent.bind(this));
	net.on('FireMsg', this.onfire.bind(this));
	net.on('DestroyMsg', this.ondestroy.bind(this));
	net.on('SetTargetMsg', this.ontarget.bind(this));

	net.on('ReplicaMsg', (function(value) {
		var tick = value.Tick;
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

},{"../public/animations.json":"/home/lain/gocode/src/oniproject/public/animations.json","./bat":"/home/lain/gocode/src/oniproject/js/bat.js","./gameobject":"/home/lain/gocode/src/oniproject/js/gameobject.js","./item":"/home/lain/gocode/src/oniproject/js/item.js","./net":"/home/lain/gocode/src/oniproject/js/net.js","CharRedactor":"/home/lain/gocode/src/oniproject/node_modules/CharRedactor/src/actor.js","events":"/home/lain/gocode/src/oniproject/node_modules/browserify/node_modules/events/events.js","howler":"/home/lain/gocode/src/oniproject/node_modules/howler/howler.js","tiled.js":"/home/lain/gocode/src/oniproject/node_modules/tiled.js/src/index.js"}],"/home/lain/gocode/src/oniproject/js/game.styl":[function(require,module,exports){
module.exports = ".scrollbar-wrap {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n  position: relative;\n}\n.scrollbar-wrap .native {\n  overflow-y: scroll;\n  overflow-x: hidden;\n  width: 200%;\n}\n.scrollbar-wrap .s-content {\n  overflow: hidden;\n  width: 50%;\n}\n/*.custom_scroll_bar_handle\n    top:0\n    right:0\n    position:absolute\n    width:10px\n    height:15px\n    background:#c00\n    cursor:pointer\n    */\n.tooltip {\n  display: none;\n  top: -50px;\n  position: absolute;\n  margin-left: -50px;\n  width: 100px;\n  height: 20px;\n  line-height: 20px;\n  padding: 10px;\n  font-size: 14px;\n  text-align: center;\n  color: #fff;\n  background: rgba(0,0,0,0.6);\n}\n.tooltip:after {\n  content: \"\";\n  position: absolute;\n  border-width: 10px;\n  border-style: solid;\n  border-color: rgba(0,0,0,0.6) transparent transparent transparent;\n  top: 40px;\n  left: 50px;\n}\nhtml,\nbody {\n  overflow: hidden;\n  padding: 0;\n  margin: 0;\n  width: 100%;\n  height: 100%;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -khtml-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n#loading {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 9999;\n  background: -webkit-radial-gradient(center, #101517, #090d0f);\n  background: -moz-radial-gradient(center, #101517, #090d0f);\n  background: -o-radial-gradient(center, #101517, #090d0f);\n  background: -ms-radial-gradient(center, #101517, #090d0f);\n  background: radial-gradient(center, #101517, #090d0f);\n}\n#loading img {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  margin-top: -110px;\n  margin-left: -379px;\n  opacity: 0.3;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=30)\";\n  filter: alpha(opacity=30);\n}\n#bottom {\n  position: absolute;\n  bottom: 0;\n  width: 100%;\n}\n#spell-over {\n  background: url(\"/ui/spell-bar-over.png\");\n  height: 44px;\n  width: 364px;\n  position: absolute;\n  top: 0;\n  left: 0;\n}\n#spells {\n  margin: auto;\n  width: 340px;\n  background: url(\"/ui/spell-bar-bg.png\");\n  font-size: 0;\n  padding: 4px 1px;\n  height: 44px;\n  width: 364px;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  position: relative;\n}\n#spells img {\n  margin: 0;\n  width: 32px;\n  height: 32px;\n}\n#spells .img {\n  position: relative;\n  display: inline-block;\n  width: 32px;\n  height: 32px;\n  margin: 2px;\n}\n#spells .img .text {\n  position: absolute;\n  display: none;\n  top: 0;\n  bottom: 0;\n  z-index: 999;\n  background: #f00;\n}\n#spells .img:hover .text {\n  display: block;\n}\n#spells .img:hover .img-over {\n  background: no-repeat url(\"/ui/spell-bar-glass.png\");\n  width: 32px;\n  height: 32px;\n  position: absolute;\n  top: 1px;\n  left: 0px;\n}\n#chat {\n  position: absolute;\n  bottom: 0.5em;\n  width: 300px;\n  color: #fff;\n}\n#chat input {\n  background: rgba(120,0,0,0.3);\n  border: none;\n  width: 100%;\n  color: #fff;\n}\n#chat ul {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n  background: rgba(255,255,255,0.1);\n  width: 100%;\n}\n#chat .admin {\n  font-weight: bold;\n  color: #c00;\n}\n#chat .party {\n  font-weight: bold;\n}\n#chat .guild {\n  color: #0f0;\n}\n#exp {\n  width: 100%;\n  background: #000;\n}\n#exp div {\n  background: #c0c0c0;\n  height: 7px;\n}\n#hud {\n  position: absolute;\n  padding: 3px;\n}\n#hud .hudMap {\n  background: #534741;\n  top: 5px;\n  left: 5px;\n  width: 82px;\n  height: 82px;\n  position: absolute;\n  -webkit-border-radius: 9999999px;\n  border-radius: 9999999px;\n  padding: 19px;\n  font-size: 40px;\n  font-family: Impact;\n  text-align: center;\n  color: #fff;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\n#hud .hud {\n  background: url(\"/ui/hud-bg.png\");\n  width: 223px;\n  height: 86px;\n  position: relative;\n}\n#hud .hud .bar {\n  width: 119px;\n  height: 9px;\n  position: absolute;\n}\n#hud .hud .bar div {\n  height: 9px;\n  -webkit-transition: 0.4s ease;\n  -moz-transition: 0.4s ease;\n  -o-transition: 0.4s ease;\n  -ms-transition: 0.4s ease;\n  transition: 0.4s ease;\n  -webkit-transition: 1.1s linear;\n  -moz-transition: 1.1s linear;\n  -o-transition: 1.1s linear;\n  -ms-transition: 1.1s linear;\n  transition: 1.1s linear;\n}\n#hud .hud .bar.hp {\n  top: 14px;\n  left: 84px;\n}\n#hud .hud .bar.hp div {\n  background: url(\"/ui/hp-bar.png\");\n}\n#hud .hud .bar.mp {\n  top: 28px;\n  left: 84px;\n}\n#hud .hud .bar.mp div {\n  background: url(\"/ui/mp-bar.png\");\n}\n#hud .hud .bar.sp {\n  top: 28px;\n  left: 84px;\n}\n#hud .hud .bar.sp div {\n  background: url(\"/ui/sp-bar.png\");\n}\n#target-bar {\n  background: no-repeat url(\"/ui/target.png\");\n  position: absolute;\n  width: 159px;\n  height: 100px;\n  top: 10px;\n  left: 45%;\n  line-height: 58px;\n  font-size: 14px;\n  text-shadow: 1px 1px 1px #000;\n  color: #fff;\n  text-align: center;\n/*.points\n        //width:200px\n        width: 100%\n        border-radius:6px\n        border: 1px solid black\n        background: silver\n        margin: 2px 0\n        box-sizing: border-box\n\n        div\n            height: 7px\n            border-radius:6px\n            transition: .4s ease\n            transition: 1.1s linear\n        &.hp div\n            background: red\n        &.mp div\n            height: 4px\n            background: blue\n        &.tp div\n            height: 4px\n            background: yellow\n            */\n}\n#target-bar .bar {\n  width: 119px;\n  height: 9px;\n  position: absolute;\n  top: 9px;\n  left: 20px;\n}\n#target-bar .bar div {\n  height: 9px;\n  -webkit-transition: 0.4s ease;\n  -moz-transition: 0.4s ease;\n  -o-transition: 0.4s ease;\n  -ms-transition: 0.4s ease;\n  transition: 0.4s ease;\n  -webkit-transition: 1.1s linear;\n  -moz-transition: 1.1s linear;\n  -o-transition: 1.1s linear;\n  -ms-transition: 1.1s linear;\n  transition: 1.1s linear;\n  background: url(\"/ui/hp-bar.png\");\n}\n#top-right {\n  position: absolute;\n  padding: 3px;\n  right: 0;\n  color: #fff;\n  background: #332;\n}\n.window {\n  width: 274px;\n  height: 424px;\n  background: url(\"/ui/win-bg.png\");\n  position: absolute;\n}\n.window .close {\n  position: absolute;\n  top: 0px;\n  left: 241px;\n  width: 28px;\n  height: 27px;\n}\n.window .close:hover {\n  background: url(\"/ui/win-close.png\");\n}\n.window .title {\n  font-family: Impact;\n  text-shadow: 1px 1px 1px #000;\n  color: #fff;\n  cursor: move;\n  text-align: center;\n  width: 274px;\n  height: 47px;\n  position: absolute;\n  top: 0;\n  left: 0;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  padding-top: 10px;\n}\n.window .scrollbar {\n  background: url(\"/ui/scrollbar-bg.png\");\n  position: absolute;\n  top: 49px;\n  right: 5px;\n  width: 22px;\n  height: 362px;\n}\n.window .scrollbar .up,\n.window .scrollbar .down,\n.window .scrollbar .slider {\n  position: absolute;\n  width: 16px;\n  height: 16px;\n  left: 3px;\n}\n.window .scrollbar .up {\n  background: url(\"/ui/scrollbar-up.png\");\n  top: 2px;\n}\n.window .scrollbar .up:hover {\n  background: url(\"/ui/scrollbar-up-hover.png\");\n}\n.window .scrollbar .down {\n  background: url(\"/ui/scrollbar-down.png\");\n  bottom: 2px;\n}\n.window .scrollbar .down:hover {\n  background: url(\"/ui/scrollbar-down-hover.png\");\n}\n.window .scrollbar .slider {\n  background: url(\"/ui/scrollbar-slider.png\");\n  bottom: 50px;\n}\n.window button.btn {\n  background: url(\"/ui/btn.png\");\n  width: 90px;\n  height: 29px;\n  font-size: 11pt;\n  text-align: center;\n  border: 0;\n  padding: 0;\n  margin: 2px;\n  padding-bottom: 4px;\n  text-shadow: 1px 1px 1px #000;\n  color: #fff;\n}\n.window button.btn:hover {\n  background: url(\"/ui/btn-hover.png\");\n}\n.window button.btn:disabled {\n  background: url(\"/ui/btn-disabled.png\");\n}\n.window button.btn:active {\n  background: url(\"/ui/btn-active.png\");\n}\n.window .content {\n  color: #fff;\n  position: absolute;\n  top: 50px;\n  left: 7px;\n  width: 261px;\n  height: 363px;\n  overflow: hidden;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  font-size: 11pt;\n}\n.window .content.red {\n  background: url(\"/ui/win-red.png\");\n  font-family: sans;\n  color: #fff799;\n}\n.window .content.yellow {\n  background: url(\"/ui/win-yellow.png\");\n  font-family: sans;\n}\n.window .content.paper {\n  background: no-repeat url(\"/ui/win-paper.png\");\n  font-family: sans-serif;\n  padding: 45px 35px 10px 10px;\n  position: relative;\n  color: #46290e;\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.window .content.paper .native {\n  height: 311px;\n}\n.window .content.paper .h {\n  font-size: 14pt;\n  color: #356e0b;\n  font-weight: bold;\n}\n.window .content.paper p {\n  font-size: 11pt;\n}\n.window .content.paper .sello {\n  position: absolute;\n  top: 10px;\n  left: 82px;\n  width: 87px;\n  height: 42px;\n}\n.window .content.paper .sello.red {\n  background: url(\"/ui/sello-red.png\");\n}\n.window .content.paper .sello.blue {\n  background: url(\"/ui/sello-blue.png\");\n}\n#equip {\n  padding: 10px;\n}\n#equip .item {\n  height: 4em;\n  border-bottom: 2px solid #1f1a19;\n  margin-bottom: 0.5em;\n}\n#equip .item:nth-last-of-type(1) {\n  border-bottom: 0;\n}\n#equip .item .slot {\n  float: right;\n  font-weight: bold;\n  display: inline-block;\n  width: 32px;\n}\n#equip .item .name {\n  width: 32px;\n}\n#equip .item .name:before {\n  content: '[';\n}\n#equip .item .name:after {\n  content: ']';\n}\n#equip .item .desc {\n  display: inline-block;\n}\n/* icon 28x28 */\n#inventory {\n  background: url(\"/ui/win-inventory.png\");\n  font-size: 0;\n  padding: 14px 0 18px 18px;\n}\n#inventory .img {\n  position: relative;\n  display: inline-block;\n  width: 32px;\n  height: 32px;\n  margin: 2px 3px;\n}\n#inventory .img:hover .img-over {\n  background: no-repeat url(\"/ui/spell-bar-glass.png\");\n  width: 32px;\n  height: 32px;\n  position: absolute;\n  top: 1px;\n  left: 0px;\n}\n#inventory img {\n  margin: 0;\n  width: 32px;\n  height: 32px;\n}\n#inventory #gold {\n  font-family: Impact;\n  text-shadow: 1px 1px 1px #000;\n  color: #fff;\n  background: no-repeat url(\"/ui/win-x-gold.png\");\n  position: absolute;\n  width: 70px;\n  bottom: 10px;\n  right: 0px;\n  color: #fff;\n  padding-left: 35px;\n  line-height: 21px;\n  font-size: 12px;\n}\n#sys.s5 {\n  background: no-repeat url(\"/ui/sys-bg-5.png\");\n  background-position: 0 11px;\n  position: absolute;\n  width: 204px;\n  height: 35px;\n  bottom: 7px;\n  right: 10px;\n  padding-left: 15px;\n}\n#sys .icon {\n  position: relative;\n  background: url(\"/ui/sys-icons.png\");\n  width: 26px;\n  height: 26px;\n  display: inline-block;\n  margin-right: 11px;\n}\n#sys .icon:hover .tooltip {\n  display: block;\n}\n#sys .icon.hammer {\n  background-position: 0 0;\n}\n#sys .icon.helment {\n  background-position: -26px 0;\n}\n#sys .icon.bubble {\n  background-position: -52px 0;\n}\n#sys .icon.cup {\n  background-position: -78px 0;\n}\n#sys .icon.door {\n  background-position: 52px 0;\n}\n#sys .icon.pounch {\n  background-position: 26px 0;\n}\n"

},{}],"/home/lain/gocode/src/oniproject/js/gameobject.js":[function(require,module,exports){
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

},{"events":"/home/lain/gocode/src/oniproject/node_modules/browserify/node_modules/events/events.js"}],"/home/lain/gocode/src/oniproject/js/item.js":[function(require,module,exports){
'use strict';

function Item(type) {
	var w = 32 * 3,
		h = 32 * 10;
	var image = new PIXI.ImageLoader('/items.png');
	this._type = type;

	var textures = this.textures = [];

	for (var y = 0; y < 10; y++) {
		for (var x = 0; x < 3; x++) {
			var rect = {
				x: x * 32,
				y: y * 32,
				width: 32,
				height: 32,
			};
			var t = new PIXI.Texture(image.texture.baseTexture, rect);
			textures.push(t);
		}
	}

	PIXI.Sprite.call(this, textures[type]);
	this.anchor.x = 0.5;
	this.anchor.y = 1;

	image.load();
	this.image = image;
}

Item.prototype = Object.create(PIXI.Sprite.prototype);
Item.prototype.constructor = Item;

Object.defineProperty(Item.prototype, 'type', {
	get: function() {
		return this._type;
	},
	set: function(type) {
		this.setTexture(this.textures[type]);
		this._type = type;
	}
});

module.exports = Item;

},{}],"/home/lain/gocode/src/oniproject/js/net.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var CBOR = window.CBOR;
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
	M_Chat = 12,
	M_ChatPost = 13,
	M_Replica = 14,
	___ = 0;

function Net(url) {
}

Net.prototype = Object.create(EventEmitter.prototype);
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
				}
				break;
			default:
				that.emit('message', message, event);
		}
	};
};

Net.prototype.close = function() {
	this.ws.close();
};
Net.prototype.send = function(message) {
	var ws = this.ws;
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(CBOR.encode(message));
	}
};

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
		case M_Chat:
			this.emit('ChatMsg', value);
			break;
		case M_Replica:
			this.emit('ReplicaMsg', value);
			break;
		default:
			this.emit('event', type, value, event);
	}
};

Net.prototype.SetVelocityMsg = function(data) {
	this.send({
		T: M_SetVelocityMsg,
		V: data
	});
};
Net.prototype.SetTargetMsg = function(id) {
	this.send({
		T: M_SetTargetMsg,
		V: {
			id: id
		},
	});
};
Net.prototype.FireMsg = function(name) {
	this.send({
		T: M_CastMsg,
		V: {
			t: name
		}
	});
};
Net.prototype.RequestInventoryMsg = function() {
	this.send({
		T: M_RequestInventory,
		V: {}
	});
};
Net.prototype.RequestParametersMsg = function() {
	this.send({
		T: M_RequestParameters,
		V: {}
	});
};
Net.prototype.PickupItemMsg = function() {
	this.send({
		T: M_PickupItem,
		V: {}
	});
};
Net.prototype.DropItemMsg = function(index) {
	this.send({
		T: M_DropItem,
		V: {
			Id: index
		}
	});
};

Net.prototype.ChatPostMsg = function(msg) {
	this.send({
		T: M_ChatPost,
		V: {
			m: msg
		}
	});
};

module.exports = Net;

},{"events":"/home/lain/gocode/src/oniproject/node_modules/browserify/node_modules/events/events.js"}],"/home/lain/gocode/src/oniproject/node_modules/CharRedactor/src/actor.js":[function(require,module,exports){
'use strict';

var Actor = function(data) {
	PIXI.DisplayObjectContainer.call(this);

	this.data = data;
	//this.textures = textures;

	this._currentAnimation = 'idle';
	this._currentDirection = '↓';
	this._currentFrame = 0;

	this.lastTime = window.performance.now();
	this.playing = true;

	this._currentDelta = 100;
}

Actor.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Actor.prototype.constructor = Actor;

Object.defineProperty(Actor.prototype, 'currentFrame', {
	get: function() {
		return this._currentFrame;
	},
	set: function(val) {
		if (this.data[this._currentAnimation].directions[this._currentDirection].length > val) {
			this._currentFrame = val;
		} else {
			console.error("Bad currentFrame", val);
		}
	},
});

Object.defineProperty(Actor.prototype, 'currentAnimation', {
	get: function() {
		return this._currentAnimation;
	},
	set: function(val) {
		if (this.data.hasOwnProperty(val)) {
			this._currentAnimation = val;
		} else {
			console.error("Bad action", val, this.data);
		}
	},
});

Object.defineProperty(Actor.prototype, 'currentDirection', {
	get: function() {
		return this._currentDirection;
	},
	set: function(val) {
		switch (val) {
			case '↑':
			case '↗':
			case '→':
			case '↘':
			case '↓':
			case '↙':
			case '←':
			case '↖':
				this._currentDirection = val;
				break;
			default:
				console.error("Bad direction", val);
		}
	},
});

Actor.prototype.stop = function() {
	this.playing = false;
}
Actor.prototype.play = function() {
	this.playing = true;
}
Actor.prototype.gotoAndStop = function(frameNumber) {
	this.playing = false;
	this.currentFrame = frameNumber;
}
Actor.prototype.gotoAndPlay = function(frameNumber) {
	this.currentFrame = frameNumber;
	this.playing = true;
}

Actor.prototype.getFrames = function() {
	var animation = this.data[this._currentAnimation];
	return animation.directions[this._currentDirection];
}

Actor.prototype.updateTransform = function() {
	var time = window.performance.now();

	if (!this.playing) {
		this.lastTime = time;
	} else {
		var delta = time - this.lastTime;

		if (delta >= this._currentDelta) {
			this.lastTime = time;

			var frames = this.getFrames();
			if (!frames && this._sprite) {
				this._sprite.visible = false;
				return
			}

			this._currentFrame++;

			if (this._currentFrame >= frames.length) {
				this._currentFrame = 0;
			}
			//this._upd = true;
			var frame = frames[this._currentFrame];
			var texture = PIXI.TextureCache[frame.name];
			if (!texture) {
				if (this._sprite) {
					this._sprite.visible = false;
				}
				return;
			}
			if (!this._sprite) {
				this._sprite = new PIXI.Sprite(texture);
				this.addChild(this._sprite);
			}
			this._currentDelta = frame.t;
			this._sprite.visible = true;
			var sprite = this._sprite;
			sprite.position.x = frame.x;
			sprite.position.y = frame.y;
			sprite.scale.x = frame.sx;
			sprite.scale.y = frame.sy;
			sprite.rotation = frame.rot;
			sprite.setTexture(texture);
		}
	}

	PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
}

module.exports = Actor;

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

},{}],"/home/lain/gocode/src/oniproject/node_modules/howler/howler.js":[function(require,module,exports){
/*!
 *  howler.js v1.1.25
 *  howlerjs.com
 *
 *  (c) 2013-2014, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {
  // setup
  var cache = {};

  // setup the audio context
  var ctx = null,
    usingWebAudio = true,
    noAudio = false;
  try {
    if (typeof AudioContext !== 'undefined') {
      ctx = new AudioContext();
    } else if (typeof webkitAudioContext !== 'undefined') {
      ctx = new webkitAudioContext();
    } else {
      usingWebAudio = false;
    }
  } catch(e) {
    usingWebAudio = false;
  }

  if (!usingWebAudio) {
    if (typeof Audio !== 'undefined') {
      try {
        new Audio();
      } catch(e) {
        noAudio = true;
      }
    } else {
      noAudio = true;
    }
  }

  // create a master gain node
  if (usingWebAudio) {
    var masterGain = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }

  // create global controller
  var HowlerGlobal = function(codecs) {
    this._volume = 1;
    this._muted = false;
    this.usingWebAudio = usingWebAudio;
    this.ctx = ctx;
    this.noAudio = noAudio;
    this._howls = [];
    this._codecs = codecs;
    this.iOSAutoEnable = true;
  };
  HowlerGlobal.prototype = {
    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this;

      // make sure volume is a number
      vol = parseFloat(vol);

      if (vol >= 0 && vol <= 1) {
        self._volume = vol;

        if (usingWebAudio) {
          masterGain.gain.value = vol;
        }

        // loop through cache and change volume of all nodes that are using HTML5 Audio
        for (var key in self._howls) {
          if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
            // loop through the audio nodes
            for (var i=0; i<self._howls[key]._audioNode.length; i++) {
              self._howls[key]._audioNode[i].volume = self._howls[key]._volume * self._volume;
            }
          }
        }

        return self;
      }

      // return the current global volume
      return (usingWebAudio) ? masterGain.gain.value : self._volume;
    },

    /**
     * Mute all sounds.
     * @return {Howler}
     */
    mute: function() {
      this._setMuted(true);

      return this;
    },

    /**
     * Unmute all sounds.
     * @return {Howler}
     */
    unmute: function() {
      this._setMuted(false);

      return this;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    _setMuted: function(muted) {
      var self = this;

      self._muted = muted;

      if (usingWebAudio) {
        masterGain.gain.value = muted ? 0 : self._volume;
      }

      for (var key in self._howls) {
        if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
          // loop through the audio nodes
          for (var i=0; i<self._howls[key]._audioNode.length; i++) {
            self._howls[key]._audioNode[i].muted = muted;
          }
        }
      }
    },

    /**
     * Check for codec support.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return this._codecs[ext];
    },

    /**
     * iOS will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _enableiOSAudio: function() {
      var self = this;

      // only run this on iOS if audio isn't already eanbled
      if (ctx && (self._iOSEnabled || !/iPhone|iPad|iPod/i.test(navigator.userAgent))) {
        return;
      }

      self._iOSEnabled = false;

      // call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS
      var unlock = function() {
        // create an empty buffer
        var buffer = ctx.createBuffer(1, 1, 22050);
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        // play the empty buffer
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // setup a timeout to check that we are unlocked on the next event loop
        setTimeout(function() {
          if ((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
            // update the unlocked state and prevent this check from happening again
            self._iOSEnabled = true;
            self.iOSAutoEnable = false;

            // remove the touch start listener
            window.removeEventListener('touchstart', unlock, false);
          }
        }, 0);
      };

      // setup a touch start listener to attempt an unlock in
      window.addEventListener('touchstart', unlock, false);

      return self;
    }
  };

  // check for browser codec support
  var audioTest = null;
  var codecs = {};
  if (!noAudio) {
    audioTest = new Audio();
    codecs = {
      mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, ''),
      opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
      ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
      wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
      aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
      m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
      mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
      weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')
    };
  }

  // allow access to the global audio controls
  var Howler = new HowlerGlobal(codecs);

  // setup the audio object
  var Howl = function(o) {
    var self = this;

    // setup the defaults
    self._autoplay = o.autoplay || false;
    self._buffer = o.buffer || false;
    self._duration = o.duration || 0;
    self._format = o.format || null;
    self._loop = o.loop || false;
    self._loaded = false;
    self._sprite = o.sprite || {};
    self._src = o.src || '';
    self._pos3d = o.pos3d || [0, 0, -0.5];
    self._volume = o.volume !== undefined ? o.volume : 1;
    self._urls = o.urls || [];
    self._rate = o.rate || 1;

    // allow forcing of a specific panningModel ('equalpower' or 'HRTF'),
    // if none is specified, defaults to 'equalpower' and switches to 'HRTF'
    // if 3d sound is used
    self._model = o.model || null;

    // setup event functions
    self._onload = [o.onload || function() {}];
    self._onloaderror = [o.onloaderror || function() {}];
    self._onend = [o.onend || function() {}];
    self._onpause = [o.onpause || function() {}];
    self._onplay = [o.onplay || function() {}];

    self._onendTimer = [];

    // Web Audio or HTML5 Audio?
    self._webAudio = usingWebAudio && !self._buffer;

    // check if we need to fall back to HTML5 Audio
    self._audioNode = [];
    if (self._webAudio) {
      self._setupAudioNode();
    }

    // automatically try to enable audio on iOS
    if (typeof ctx !== 'undefined' && ctx && Howler.iOSAutoEnable) {
      Howler._enableiOSAudio();
    }

    // add this to an array of Howl's to allow global control
    Howler._howls.push(self);

    // load the track
    self.load();
  };

  // setup all of the methods
  Howl.prototype = {
    /**
     * Load an audio file.
     * @return {Howl}
     */
    load: function() {
      var self = this,
        url = null;

      // if no audio is available, quit immediately
      if (noAudio) {
        self.on('loaderror');
        return;
      }

      // loop through source URLs and pick the first one that is compatible
      for (var i=0; i<self._urls.length; i++) {
        var ext, urlItem;

        if (self._format) {
          // use specified audio format if available
          ext = self._format;
        } else {
          // figure out the filetype (whether an extension or base64 data)
          urlItem = self._urls[i];
          ext = /^data:audio\/([^;,]+);/i.exec(urlItem);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(urlItem.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          } else {
            self.on('loaderror');
            return;
          }
        }

        if (codecs[ext]) {
          url = self._urls[i];
          break;
        }
      }

      if (!url) {
        self.on('loaderror');
        return;
      }

      self._src = url;

      if (self._webAudio) {
        loadBuffer(self, url);
      } else {
        var newNode = new Audio();

        // listen for errors with HTML5 audio (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror)
        newNode.addEventListener('error', function () {
          if (newNode.error && newNode.error.code === 4) {
            HowlerGlobal.noAudio = true;
          }

          self.on('loaderror', {type: newNode.error ? newNode.error.code : 0});
        }, false);

        self._audioNode.push(newNode);

        // setup the new audio node
        newNode.src = url;
        newNode._pos = 0;
        newNode.preload = 'auto';
        newNode.volume = (Howler._muted) ? 0 : self._volume * Howler.volume();

        // setup the event listener to start playing the sound
        // as soon as it has buffered enough
        var listener = function() {
          // round up the duration when using HTML5 Audio to account for the lower precision
          self._duration = Math.ceil(newNode.duration * 10) / 10;

          // setup a sprite if none is defined
          if (Object.getOwnPropertyNames(self._sprite).length === 0) {
            self._sprite = {_default: [0, self._duration * 1000]};
          }

          if (!self._loaded) {
            self._loaded = true;
            self.on('load');
          }

          if (self._autoplay) {
            self.play();
          }

          // clear the event listener
          newNode.removeEventListener('canplaythrough', listener, false);
        };
        newNode.addEventListener('canplaythrough', listener, false);
        newNode.load();
      }

      return self;
    },

    /**
     * Get/set the URLs to be pulled from to play in this source.
     * @param  {Array} urls  Arry of URLs to load from
     * @return {Howl}        Returns self or the current URLs
     */
    urls: function(urls) {
      var self = this;

      if (urls) {
        self.stop();
        self._urls = (typeof urls === 'string') ? [urls] : urls;
        self._loaded = false;
        self.load();

        return self;
      } else {
        return self._urls;
      }
    },

    /**
     * Play a sound from the current time (0 by default).
     * @param  {String}   sprite   (optional) Plays from the specified position in the sound sprite definition.
     * @param  {Function} callback (optional) Returns the unique playback id for this sound instance.
     * @return {Howl}
     */
    play: function(sprite, callback) {
      var self = this;

      // if no sprite was passed but a callback was, update the variables
      if (typeof sprite === 'function') {
        callback = sprite;
      }

      // use the default sprite if none is passed
      if (!sprite || typeof sprite === 'function') {
        sprite = '_default';
      }

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.play(sprite, callback);
        });

        return self;
      }

      // if the sprite doesn't exist, play nothing
      if (!self._sprite[sprite]) {
        if (typeof callback === 'function') callback();
        return self;
      }

      // get the node to playback
      self._inactiveNode(function(node) {
        // persist the sprite being played
        node._sprite = sprite;

        // determine where to start playing from
        var pos = (node._pos > 0) ? node._pos : self._sprite[sprite][0] / 1000;

        // determine how long to play for
        var duration = 0;
        if (self._webAudio) {
          duration = self._sprite[sprite][1] / 1000 - node._pos;
          if (node._pos > 0) {
            pos = self._sprite[sprite][0] / 1000 + pos;
          }
        } else {
          duration = self._sprite[sprite][1] / 1000 - (pos - self._sprite[sprite][0] / 1000);
        }

        // determine if this sound should be looped
        var loop = !!(self._loop || self._sprite[sprite][2]);

        // set timer to fire the 'onend' event
        var soundId = (typeof callback === 'string') ? callback : Math.round(Date.now() * Math.random()) + '',
          timerId;
        (function() {
          var data = {
            id: soundId,
            sprite: sprite,
            loop: loop
          };
          timerId = setTimeout(function() {
            // if looping, restart the track
            if (!self._webAudio && loop) {
              self.stop(data.id).play(sprite, data.id);
            }

            // set web audio node to paused at end
            if (self._webAudio && !loop) {
              self._nodeById(data.id).paused = true;
              self._nodeById(data.id)._pos = 0;

              // clear the end timer
              self._clearEndTimer(data.id);
            }

            // end the track if it is HTML audio and a sprite
            if (!self._webAudio && !loop) {
              self.stop(data.id);
            }

            // fire ended event
            self.on('end', soundId);
          }, duration * 1000);

          // store the reference to the timer
          self._onendTimer.push({timer: timerId, id: data.id});
        })();

        if (self._webAudio) {
          var loopStart = self._sprite[sprite][0] / 1000,
            loopEnd = self._sprite[sprite][1] / 1000;

          // set the play id to this node and load into context
          node.id = soundId;
          node.paused = false;
          refreshBuffer(self, [loop, loopStart, loopEnd], soundId);
          self._playStart = ctx.currentTime;
          node.gain.value = self._volume;

          if (typeof node.bufferSource.start === 'undefined') {
            node.bufferSource.noteGrainOn(0, pos, duration);
          } else {
            node.bufferSource.start(0, pos, duration);
          }
        } else {
          if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
            node.readyState = 4;
            node.id = soundId;
            node.currentTime = pos;
            node.muted = Howler._muted || node.muted;
            node.volume = self._volume * Howler.volume();
            setTimeout(function() { node.play(); }, 0);
          } else {
            self._clearEndTimer(soundId);

            (function(){
              var sound = self,
                playSprite = sprite,
                fn = callback,
                newNode = node;
              var listener = function() {
                sound.play(playSprite, fn);

                // clear the event listener
                newNode.removeEventListener('canplaythrough', listener, false);
              };
              newNode.addEventListener('canplaythrough', listener, false);
            })();

            return self;
          }
        }

        // fire the play event and send the soundId back in the callback
        self.on('play');
        if (typeof callback === 'function') callback(soundId);

        return self;
      });

      return self;
    },

    /**
     * Pause playback and save the current position.
     * @param {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.pause(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(id);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = self.pos(null, id);

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource || activeNode.paused) {
            return self;
          }

          activeNode.paused = true;
          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else {
          activeNode.pause();
        }
      }

      self.on('pause');

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl}
     */
    stop: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.stop(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(id);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = 0;

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource || activeNode.paused) {
            return self;
          }

          activeNode.paused = true;

          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else if (!isNaN(activeNode.duration)) {
          activeNode.pause();
          activeNode.currentTime = 0;
        }
      }

      return self;
    },

    /**
     * Mute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    mute: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.mute(id);
        });

        return self;
      }

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (self._webAudio) {
          activeNode.gain.value = 0;
        } else {
          activeNode.muted = true;
        }
      }

      return self;
    },

    /**
     * Unmute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    unmute: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.unmute(id);
        });

        return self;
      }

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (self._webAudio) {
          activeNode.gain.value = self._volume;
        } else {
          activeNode.muted = false;
        }
      }

      return self;
    },

    /**
     * Get/set volume of this sound.
     * @param  {Float}  vol Volume from 0.0 to 1.0.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}     Returns self or current volume.
     */
    volume: function(vol, id) {
      var self = this;

      // make sure volume is a number
      vol = parseFloat(vol);

      if (vol >= 0 && vol <= 1) {
        self._volume = vol;

        // if the sound hasn't been loaded, add it to the event queue
        if (!self._loaded) {
          self.on('play', function() {
            self.volume(vol, id);
          });

          return self;
        }

        var activeNode = (id) ? self._nodeById(id) : self._activeNode();
        if (activeNode) {
          if (self._webAudio) {
            activeNode.gain.value = vol;
          } else {
            activeNode.volume = vol * Howler.volume();
          }
        }

        return self;
      } else {
        return self._volume;
      }
    },

    /**
     * Get/set whether to loop the sound.
     * @param  {Boolean} loop To loop or not to loop, that is the question.
     * @return {Howl/Boolean}      Returns self or current looping value.
     */
    loop: function(loop) {
      var self = this;

      if (typeof loop === 'boolean') {
        self._loop = loop;

        return self;
      } else {
        return self._loop;
      }
    },

    /**
     * Get/set sound sprite definition.
     * @param  {Object} sprite Example: {spriteName: [offset, duration, loop]}
     *                @param {Integer} offset   Where to begin playback in milliseconds
     *                @param {Integer} duration How long to play in milliseconds
     *                @param {Boolean} loop     (optional) Set true to loop this sprite
     * @return {Howl}        Returns current sprite sheet or self.
     */
    sprite: function(sprite) {
      var self = this;

      if (typeof sprite === 'object') {
        self._sprite = sprite;

        return self;
      } else {
        return self._sprite;
      }
    },

    /**
     * Get/set the position of playback.
     * @param  {Float}  pos The position to move current playback to.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}      Returns self or current playback position.
     */
    pos: function(pos, id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.pos(pos);
        });

        return typeof pos === 'number' ? self : self._pos || 0;
      }

      // make sure we are dealing with a number for pos
      pos = parseFloat(pos);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (pos >= 0) {
          self.pause(id);
          activeNode._pos = pos;
          self.play(activeNode._sprite, id);

          return self;
        } else {
          return self._webAudio ? activeNode._pos + (ctx.currentTime - self._playStart) : activeNode.currentTime;
        }
      } else if (pos >= 0) {
        return self;
      } else {
        // find the first inactive node to return the pos for
        for (var i=0; i<self._audioNode.length; i++) {
          if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
            return (self._webAudio) ? self._audioNode[i]._pos : self._audioNode[i].currentTime;
          }
        }
      }
    },

    /**
     * Get/set the 3D position of the audio source.
     * The most common usage is to set the 'x' position
     * to affect the left/right ear panning. Setting any value higher than
     * 1.0 will begin to decrease the volume of the sound as it moves further away.
     * NOTE: This only works with Web Audio API, HTML5 Audio playback
     * will not be affected.
     * @param  {Float}  x  The x-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  y  The y-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  z  The z-position of the playback from -1000.0 to 1000.0
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl/Array}   Returns self or the current 3D position: [x, y, z]
     */
    pos3d: function(x, y, z, id) {
      var self = this;

      // set a default for the optional 'y' & 'z'
      y = (typeof y === 'undefined' || !y) ? 0 : y;
      z = (typeof z === 'undefined' || !z) ? -0.5 : z;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.pos3d(x, y, z, id);
        });

        return self;
      }

      if (x >= 0 || x < 0) {
        if (self._webAudio) {
          var activeNode = (id) ? self._nodeById(id) : self._activeNode();
          if (activeNode) {
            self._pos3d = [x, y, z];
            activeNode.panner.setPosition(x, y, z);
            activeNode.panner.panningModel = self._model || 'HRTF';
          }
        }
      } else {
        return self._pos3d;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes.
     * @param  {Number}   from     The volume to fade from (0.0 to 1.0).
     * @param  {Number}   to       The volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback (optional) Fired when the fade is complete.
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    fade: function(from, to, len, callback, id) {
      var self = this,
        diff = Math.abs(from - to),
        dir = from > to ? 'down' : 'up',
        steps = diff / 0.01,
        stepTime = len / steps;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.fade(from, to, len, callback, id);
        });

        return self;
      }

      // set the volume to the start position
      self.volume(from, id);

      for (var i=1; i<=steps; i++) {
        (function() {
          var change = self._volume + (dir === 'up' ? 0.01 : -0.01) * i,
            vol = Math.round(1000 * change) / 1000,
            toVol = to;

          setTimeout(function() {
            self.volume(vol, id);

            if (vol === toVol) {
              if (callback) callback();
            }
          }, stepTime * i);
        })();
      }
    },

    /**
     * [DEPRECATED] Fade in the current sound.
     * @param  {Float}    to      Volume to fade to (0.0 to 1.0).
     * @param  {Number}   len     Time in milliseconds to fade.
     * @param  {Function} callback
     * @return {Howl}
     */
    fadeIn: function(to, len, callback) {
      return this.volume(0).play().fade(0, to, len, callback);
    },

    /**
     * [DEPRECATED] Fade out the current sound and pause when finished.
     * @param  {Float}    to       Volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    fadeOut: function(to, len, callback, id) {
      var self = this;

      return self.fade(self._volume, to, len, function() {
        if (callback) callback();
        self.pause(id);

        // fire ended event
        self.on('end');
      }, id);
    },

    /**
     * Get an audio node by ID.
     * @return {Howl} Audio node.
     */
    _nodeById: function(id) {
      var self = this,
        node = self._audioNode[0];

      // find the node with this ID
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].id === id) {
          node = self._audioNode[i];
          break;
        }
      }

      return node;
    },

    /**
     * Get the first active audio node.
     * @return {Howl} Audio node.
     */
    _activeNode: function() {
      var self = this,
        node = null;

      // find the first playing node
      for (var i=0; i<self._audioNode.length; i++) {
        if (!self._audioNode[i].paused) {
          node = self._audioNode[i];
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      return node;
    },

    /**
     * Get the first inactive audio node.
     * If there is none, create a new one and add it to the pool.
     * @param  {Function} callback Function to call when the audio node is ready.
     */
    _inactiveNode: function(callback) {
      var self = this,
        node = null;

      // find first inactive node to recycle
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
          // send the node back for use by the new play instance
          callback(self._audioNode[i]);
          node = true;
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      if (node) {
        return;
      }

      // create new node if there are no inactives
      var newNode;
      if (self._webAudio) {
        newNode = self._setupAudioNode();
        callback(newNode);
      } else {
        self.load();
        newNode = self._audioNode[self._audioNode.length - 1];

        // listen for the correct load event and fire the callback
        var listenerEvent = navigator.isCocoonJS ? 'canplaythrough' : 'loadedmetadata';
        var listener = function() {
          newNode.removeEventListener(listenerEvent, listener, false);
          callback(newNode);
        };
        newNode.addEventListener(listenerEvent, listener, false);
      }
    },

    /**
     * If there are more than 5 inactive audio nodes in the pool, clear out the rest.
     */
    _drainPool: function() {
      var self = this,
        inactive = 0,
        i;

      // count the number of inactive nodes
      for (i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused) {
          inactive++;
        }
      }

      // remove excess inactive nodes
      for (i=self._audioNode.length-1; i>=0; i--) {
        if (inactive <= 5) {
          break;
        }

        if (self._audioNode[i].paused) {
          // disconnect the audio source if using Web Audio
          if (self._webAudio) {
            self._audioNode[i].disconnect(0);
          }

          inactive--;
          self._audioNode.splice(i, 1);
        }
      }
    },

    /**
     * Clear 'onend' timeout before it ends.
     * @param  {String} soundId  The play instance ID.
     */
    _clearEndTimer: function(soundId) {
      var self = this,
        index = 0;

      // loop through the timers to find the one associated with this sound
      for (var i=0; i<self._onendTimer.length; i++) {
        if (self._onendTimer[i].id === soundId) {
          index = i;
          break;
        }
      }

      var timer = self._onendTimer[index];
      if (timer) {
        clearTimeout(timer.timer);
        self._onendTimer.splice(index, 1);
      }
    },

    /**
     * Setup the gain node and panner for a Web Audio instance.
     * @return {Object} The new audio node.
     */
    _setupAudioNode: function() {
      var self = this,
        node = self._audioNode,
        index = self._audioNode.length;

      // create gain node
      node[index] = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
      node[index].gain.value = self._volume;
      node[index].paused = true;
      node[index]._pos = 0;
      node[index].readyState = 4;
      node[index].connect(masterGain);

      // create the panner
      node[index].panner = ctx.createPanner();
      node[index].panner.panningModel = self._model || 'equalpower';
      node[index].panner.setPosition(self._pos3d[0], self._pos3d[1], self._pos3d[2]);
      node[index].panner.connect(node[index]);

      return node[index];
    },

    /**
     * Call/set custom events.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Function to call.
     * @return {Howl}
     */
    on: function(event, fn) {
      var self = this,
        events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(fn);
      } else {
        for (var i=0; i<events.length; i++) {
          if (fn) {
            events[i].call(self, fn);
          } else {
            events[i].call(self);
          }
        }
      }

      return self;
    },

    /**
     * Remove a custom event.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Listener to remove.
     * @return {Howl}
     */
    off: function(event, fn) {
      var self = this,
        events = self['_on' + event],
        fnString = fn ? fn.toString() : null;

      if (fnString) {
        // loop through functions in the event for comparison
        for (var i=0; i<events.length; i++) {
          if (fnString === events[i].toString()) {
            events.splice(i, 1);
            break;
          }
        }
      } else {
        self['_on' + event] = [];
      }

      return self;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all play instances attached to this sound.
     */
    unload: function() {
      var self = this;

      // stop playing any active nodes
      var nodes = self._audioNode;
      for (var i=0; i<self._audioNode.length; i++) {
        // stop the sound if it is currently playing
        if (!nodes[i].paused) {
          self.stop(nodes[i].id);
          self.on('end', nodes[i].id);
        }

        if (!self._webAudio) {
          // remove the source if using HTML5 Audio
          nodes[i].src = '';
        } else {
          // disconnect the output from the master gain
          nodes[i].disconnect(0);
        }
      }

      // make sure all timeouts are cleared
      for (i=0; i<self._onendTimer.length; i++) {
        clearTimeout(self._onendTimer[i].timer);
      }

      // remove the reference in the global Howler object
      var index = Howler._howls.indexOf(self);
      if (index !== null && index >= 0) {
        Howler._howls.splice(index, 1);
      }

      // delete this sound from the cache
      delete cache[self._src];
      self = null;
    }

  };

  // only define these functions when using WebAudio
  if (usingWebAudio) {

    /**
     * Buffer a sound from URL (or from cache) and decode to audio source (Web Audio API).
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var loadBuffer = function(obj, url) {
      // check if the buffer has already been cached
      if (url in cache) {
        // set the duration from the cache
        obj._duration = cache[url].duration;

        // load the sound into this object
        loadSound(obj);
        return;
      }
      
      if (/^data:[^;]+;base64,/.test(url)) {
        // Decode base64 data-URIs because some browsers cannot load data-URIs with XMLHttpRequest.
        var data = atob(url.split(',')[1]);
        var dataView = new Uint8Array(data.length);
        for (var i=0; i<data.length; ++i) {
          dataView[i] = data.charCodeAt(i);
        }
        
        decodeAudioData(dataView.buffer, obj, url);
      } else {
        // load the buffer from the URL
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          decodeAudioData(xhr.response, obj, url);
        };
        xhr.onerror = function() {
          // if there is an error, switch the sound to HTML Audio
          if (obj._webAudio) {
            obj._buffer = true;
            obj._webAudio = false;
            obj._audioNode = [];
            delete obj._gainNode;
            delete cache[url];
            obj.load();
          }
        };
        try {
          xhr.send();
        } catch (e) {
          xhr.onerror();
        }
      }
    };

    /**
     * Decode audio data from an array buffer.
     * @param  {ArrayBuffer} arraybuffer The audio data.
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var decodeAudioData = function(arraybuffer, obj, url) {
      // decode the buffer into an audio source
      ctx.decodeAudioData(
        arraybuffer,
        function(buffer) {
          if (buffer) {
            cache[url] = buffer;
            loadSound(obj, buffer);
          }
        },
        function(err) {
          obj.on('loaderror');
        }
      );
    };

    /**
     * Finishes loading the Web Audio API sound and fires the loaded event
     * @param  {Object}  obj    The Howl object for the sound to load.
     * @param  {Objecct} buffer The decoded buffer sound source.
     */
    var loadSound = function(obj, buffer) {
      // set the duration
      obj._duration = (buffer) ? buffer.duration : obj._duration;

      // setup a sprite if none is defined
      if (Object.getOwnPropertyNames(obj._sprite).length === 0) {
        obj._sprite = {_default: [0, obj._duration * 1000]};
      }

      // fire the loaded event
      if (!obj._loaded) {
        obj._loaded = true;
        obj.on('load');
      }

      if (obj._autoplay) {
        obj.play();
      }
    };

    /**
     * Load the sound back into the buffer source.
     * @param  {Object} obj   The sound to load.
     * @param  {Array}  loop  Loop boolean, pos, and duration.
     * @param  {String} id    (optional) The play instance ID.
     */
    var refreshBuffer = function(obj, loop, id) {
      // determine which node to connect to
      var node = obj._nodeById(id);

      // setup the buffer source for playback
      node.bufferSource = ctx.createBufferSource();
      node.bufferSource.buffer = cache[obj._src];
      node.bufferSource.connect(node.panner);
      node.bufferSource.loop = loop[0];
      if (loop[0]) {
        node.bufferSource.loopStart = loop[1];
        node.bufferSource.loopEnd = loop[1] + loop[2];
      }
      node.bufferSource.playbackRate.value = obj._rate;
    };

  }

  /**
   * Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
   */
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    });
  }

  /**
   * Add support for CommonJS libraries such as browserify.
   */
  if (typeof exports !== 'undefined') {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // define globally in case AMD is not available or available but not used

  if (typeof window !== 'undefined') {
    window.Howler = Howler;
    window.Howl = Howl;
  }

})();

},{}],"/home/lain/gocode/src/oniproject/node_modules/insert-css/index.js":[function(require,module,exports){
var inserted = {};

module.exports = function (css, options) {
    if (inserted[css]) return;
    inserted[css] = true;
    
    var elem = document.createElement('style');
    elem.setAttribute('type', 'text/css');

    if ('textContent' in elem) {
      elem.textContent = css;
    } else {
      elem.styleSheet.cssText = css;
    }
    
    var head = document.getElementsByTagName('head')[0];
    if (options && options.prepend) {
        head.insertBefore(elem, head.childNodes[0]);
    } else {
        head.appendChild(elem);
    }
};

},{}],"/home/lain/gocode/src/oniproject/node_modules/tiled.js/src/imagelayer.js":[function(require,module,exports){
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
};

module.exports = ImageLayer;

},{}],"/home/lain/gocode/src/oniproject/node_modules/tiled.js/src/index.js":[function(require,module,exports){
'use strict';

var Tileset = require('./tileset');
var TileLayer = require('./tilelayer');
var ObjectGroup = require('./objectgroup');
var ImageLayer = require('./imagelayer');

function Tiled(path, uri) {
	PIXI.DisplayObjectContainer.call(this);

	this.path = path;

	var loader = this.loader = new PIXI.JsonLoader(path + uri);

	this.tilesets = [];
	this.layers = [];

	this.AVATARS = new PIXI.DisplayObjectContainer();
}

Tiled.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Tiled.constructor = Tiled;

Tiled.prototype.load = function(fn, fn2) {
	var that = this;
	this.loader.on('loaded', function() {
		var json = that.data = that.loader.json;

		var tilesets_count = json.tilesets.length;
		var f = function() {
			tilesets_count--;
			if (!tilesets_count) {
				console.info('tilesets loaded');
				if (fn) {
					fn();
				}
			}
		};
		var i, l;
		for (i = 0, l = json.tilesets.length; i < l; i++) {
			var t = new Tileset(json.tilesets[i], that.path, null, null);
			that.tilesets.push(t);
			t.load(f);
		}

		for (i = 0, l = json.layers.length; i < l; i++) {
			var layer = json.layers[i];
			var obj = null;
			switch (layer.type) {
				case 'tilelayer':
					obj = new TileLayer(layer, that.tilesets, json.tilewidth, json.tileheight, json.renderorder);
					break;
				case 'objectgroup':
					if (layer.name == 'AVATARS') {
						obj = that.AVATARS;
					} else {
						obj = new ObjectGroup(layer, that.tilesets);
					}
					break;
				case 'imagelayer':
					obj = new ImageLayer(layer, that.path);
					obj.load();
					break;
			}
			if (obj !== null) {
				that.layers.push(obj);
				that.addChild(obj);
			}
		}
		if (fn2) {
			fn2();
		}

	});
	this.loader.load();
};

module.exports = Tiled;

},{"./imagelayer":"/home/lain/gocode/src/oniproject/node_modules/tiled.js/src/imagelayer.js","./objectgroup":"/home/lain/gocode/src/oniproject/node_modules/tiled.js/src/objectgroup.js","./tilelayer":"/home/lain/gocode/src/oniproject/node_modules/tiled.js/src/tilelayer.js","./tileset":"/home/lain/gocode/src/oniproject/node_modules/tiled.js/src/tileset.js"}],"/home/lain/gocode/src/oniproject/node_modules/tiled.js/src/objectgroup.js":[function(require,module,exports){
'use strict';

function ObjectGroup(data, tilesets) {
	PIXI.DisplayObjectContainer.call(this);
	var graphics = this.graphics = new PIXI.Graphics();
	this.addChild(graphics);

	this.data = data || {};
	if (!data.objects) {
		data.objects = [];
	}
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

},{}],"/home/lain/gocode/src/oniproject/node_modules/tiled.js/src/tilelayer.js":[function(require,module,exports){
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

	this.cacheAsBitmap = this._animated.length === 0;
}

TileLayer.prototype = Object.create(PIXI.SpriteBatch.prototype);
TileLayer.constructor = TileLayer;

TileLayer.prototype.updateTransform = function() {
	var _animated = this._animated;
	for (var i = 0, l = _animated.length; i < l; i++) {
		_animated[i].updateTransform();
	}
	PIXI.SpriteBatch.prototype.updateTransform.call(this);
};

module.exports = TileLayer;

},{}],"/home/lain/gocode/src/oniproject/node_modules/tiled.js/src/tileset.js":[function(require,module,exports){
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
}


Tileset.prototype.load = function(fn) {
	if (fn) {
		this.image.on('loaded', fn);
	}
	this.image.load();
};


Tileset.prototype.CreateSprite = function(id) {
	if (id === 0) return;

	var data = this.data;
	id -= data.firstgid;
	var texture = this.tiles[id];

	if (!texture) return;

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
};

var updateTransform = function() {
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
};

module.exports = Tileset;

},{}],"/home/lain/gocode/src/oniproject/public/animations.json":[function(require,module,exports){
module.exports=module.exports={"idle":{"directions":{"↖":[{"name":"suika walk ↖ 1","t":0,"x":-42,"y":-86,"sx":1,"sy":1,"rot":0}],"↑":[{"name":"suika walk ↑ 1","t":0,"x":-36,"y":-90,"sx":1,"sy":1,"rot":0}],"↗":[{"name":"suika walk ↗ 1","t":0,"x":-32,"y":-92,"sx":1,"sy":1,"rot":0}],"←":[{"name":"suika walk ← 1","t":0,"x":-30,"y":-88,"sx":1,"sy":1,"rot":0}],"→":[{"name":"suika walk → 1","t":0,"x":-24,"y":-88,"sx":1,"sy":1,"rot":0}],"↙":[{"name":"suika walk ↙ 1","t":0,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0}],"↓":[{"name":"suika walk ↓ 1","t":0,"x":-38,"y":-88,"sx":1,"sy":1,"rot":0}],"↘":[{"name":"suika walk ↘ 1","t":0,"x":-36,"y":-88,"sx":1,"sy":1,"rot":0}]}},"walk":{"directions":{"↖":[{"name":"suika walk ↖ 0","t":100,"x":-42,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↖ 1","t":100,"x":-42,"y":-86,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↖ 2","t":100,"x":-42,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↖ 1","t":100,"x":-42,"y":-86,"sx":1,"sy":1,"rot":0}],"↑":[{"name":"suika walk ↑ 0","t":100,"x":-36,"y":-92,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↑ 1","t":100,"x":-36,"y":-90,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↑ 2","t":100,"x":-36,"y":-92,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↑ 1","t":100,"x":-36,"y":-90,"sx":1,"sy":1,"rot":0}],"↗":[{"name":"suika walk ↗ 0","t":100,"x":-32,"y":-94,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↗ 1","t":100,"x":-32,"y":-92,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↗ 2","t":100,"x":-32,"y":-94,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↗ 1","t":100,"x":-32,"y":-92,"sx":1,"sy":1,"rot":0}],"←":[{"name":"suika walk ← 0","t":100,"x":-30,"y":-90,"sx":1,"sy":1,"rot":0},{"name":"suika walk ← 1","t":100,"x":-30,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika walk ← 2","t":100,"x":-30,"y":-90,"sx":1,"sy":1,"rot":0},{"name":"suika walk ← 1","t":100,"x":-30,"y":-88,"sx":1,"sy":1,"rot":0}],"→":[{"name":"suika walk → 0","t":100,"x":-24,"y":-90,"sx":1,"sy":1,"rot":0},{"name":"suika walk → 1","t":100,"x":-24,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika walk → 2","t":100,"x":-24,"y":-90,"sx":1,"sy":1,"rot":0},{"name":"suika walk → 1","t":100,"x":-24,"y":-88,"sx":1,"sy":1,"rot":0}],"↙":[{"name":"suika walk ↙ 0","t":100,"x":-38,"y":-86,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↙ 1","t":100,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↙ 2","t":100,"x":-38,"y":-86,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↙ 1","t":100,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0}],"↓":[{"name":"suika walk ↓ 0","t":100,"x":-38,"y":-90,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↓ 1","t":100,"x":-38,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↓ 2","t":100,"x":-38,"y":-90,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↓ 1","t":100,"x":-38,"y":-88,"sx":1,"sy":1,"rot":0}],"↘":[{"name":"suika walk ↘ 0","t":100,"x":-36,"y":-90,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↘ 1","t":100,"x":-36,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↘ 2","t":100,"x":-36,"y":-90,"sx":1,"sy":1,"rot":0},{"name":"suika walk ↘ 1","t":100,"x":-36,"y":-88,"sx":1,"sy":1,"rot":0}]}},"boom":{"directions":{"↖":[{"name":"suika boom ↖ 0","t":300,"x":-44,"y":-82,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↖ 1","t":100,"x":-52,"y":-98,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↖ 2","t":400,"x":-50,"y":-98,"sx":1,"sy":1,"rot":0}],"↑":[{"name":"suika boom ↑ 0","t":300,"x":-40,"y":-82,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↑ 1","t":100,"x":-40,"y":-100,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↑ 2","t":400,"x":-42,"y":-96,"sx":1,"sy":1,"rot":0}],"↗":[{"name":"suika boom ↗ 0","t":300,"x":-36,"y":-92,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↗ 1","t":100,"x":-36,"y":-94,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↗ 2","t":400,"x":-34,"y":-92,"sx":1,"sy":1,"rot":0}],"←":[{"name":"suika boom ← 0","t":300,"x":-30,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika boom ← 1","t":100,"x":-82,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika boom ← 2","t":400,"x":-70,"y":-88,"sx":1,"sy":1,"rot":0}],"→":[{"name":"suika boom → 0","t":300,"x":-32,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika boom → 1","t":100,"x":-24,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika boom → 2","t":400,"x":-18,"y":-88,"sx":1,"sy":1,"rot":0}],"↙":[{"name":"suika boom ↙ 0","t":300,"x":-42,"y":-84,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↙ 1","t":100,"x":-50,"y":-84,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↙ 2","t":400,"x":-42,"y":-84,"sx":1,"sy":1,"rot":0}],"↓":[{"name":"suika boom ↓ 0","t":300,"x":-44,"y":-84,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↓ 1","t":100,"x":-44,"y":-84,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↓ 2","t":400,"x":-40,"y":-84,"sx":1,"sy":1,"rot":0}],"↘":[{"name":"suika boom ↘ 0","t":300,"x":-44,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↘ 1","t":100,"x":-38,"y":-88,"sx":1,"sy":1,"rot":0},{"name":"suika boom ↘ 2","t":400,"x":-32,"y":-88,"sx":1,"sy":1,"rot":0}]}},"death":{"directions":{"↖":[{"name":"suika death 2","t":100,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0}],"↑":[{"name":"suika death 2","t":100,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0}],"↗":[{"name":"suika death 2","t":100,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0}],"←":[{"name":"suika death 2","t":100,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0}],"→":[{"name":"suika death 2","t":100,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0}],"↙":[{"name":"suika death 2","t":100,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0}],"↓":[{"name":"suika death 2","t":100,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0}],"↘":[{"name":"suika death 2","t":100,"x":-38,"y":-84,"sx":1,"sy":1,"rot":0}]}}}

},{}]},{},["./js/main.js"])


//# sourceMappingURL=main.js.map