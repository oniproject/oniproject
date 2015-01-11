'use strict';

require('insert-css')(require('./game.styl'));


var Vue = window.Vue;
var requestAnimFrame = window.requestAnimFrame;

var Mode7 = require('./mode7');
var Stats = require('./Stats');
var stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms

// align top-right
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0';
stats.domElement.style.top = '0';

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

var proton = new Proton();
var protonRenderer = new Proton.Renderer('other', proton);
protonRenderer.onProtonUpdate = function() {};
protonRenderer.onParticleCreated = function(particle) {
	// TODO not only damage
	var target = particle.target;

	if (target.hasOwnProperty('text')) {
		var style = {
			font: '12px Helvetica',
			fill: 'white',
			stroke: 'black',
			strokeThickness: 2,
			align: 'center',
		};

		var text = target.text;
		if (text < 0) {
			style.fill = 'red';
		} else if (text > 0) {
			style.fill = 'green';
		} else {
			text = 'miss';
		}
		var particleSprite = new PIXI.Text("" + text, style);
		particle.sprite = particleSprite;
	}

	if (target.hasOwnProperty('container')) {
		target.container.addChild(particle.sprite);
	} else {
		stage.addChild(particle.sprite);
	}
};
protonRenderer.onParticleUpdate = function(particle) {
	var sprite = particle.sprite;
	sprite.position.x = particle.p.x;
	sprite.position.y = particle.p.y;
	sprite.scale.x = particle.scale;
	sprite.scale.y = particle.scale;
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.alpha = particle.alpha;
	sprite.rotation = particle.rotation * Math.PI / 180;
};
protonRenderer.onParticleDead = function(particle) {
	var target = particle.target;
	if (target.hasOwnProperty('container')) {
		target.container.removeChild(particle.sprite);
	} else {
		stage.removeChild(particle.sprite);
	}
};
protonRenderer.start();

window.onresize = function() {
	w = window.innerWidth;
	h = window.innerHeight;
	renderer.resize(w, h);
};
window.onresize();

var Game = require('./game');
var game = window.game = new Game(renderer, stage, UI);

game.proton = proton;

var colorMatrixFilter = new PIXI.ColorMatrixFilter();
colorMatrixFilter.matrix = [
	0.4, 0, 0, 0,
	0, 0.4, 0, 0,
	0, 0, 0.7, 0,
	0, 0, 0, 1,
];
var m7 = new Mode7();
//game.container.filters = [colorMatrixFilter];
/*
var gui = new dat.GUI();
var c = function() {};
gui.add(m7, 'pos_x').onFinishChange(c);
gui.add(m7, 'pos_y').onFinishChange(c);
gui.add(m7, 'ang').onFinishChange(c);
gui.add(m7, 'horizon').onFinishChange(c);
gui.add(m7, 'fov').onFinishChange(c);
gui.add(m7, 'scale_x').onFinishChange(c);
gui.add(m7, 'scale_y').onFinishChange(c);
*/

requestAnimFrame(render);
var updateT = 1000 / 50;
var lastTime = window.performance.now();
function render() {
	requestAnimFrame(render);
	stats.begin();

	proton.update();

	var t = window.performance.now();
	if (t - lastTime > updateT) {
		game.update(updateT);
		lastTime += updateT;
	}

	game.render();
	renderer.render(stage);
	game.postrender();

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
	UI.money = inv.Money;
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
		inventory: [],
		money: 0,
		target: {
			Id: 0,
			Race: 0,
			HP: 0,
			MHP: 0,
			Name: 'vnfdjsk'
		},
		invTest: [],
		spells: [],
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
			game.net.FireMsg('' + spell, game.target);
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
