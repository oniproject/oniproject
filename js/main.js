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

game.net.on('ChatMsg', function(msg) {
	console.log('ChatMsg', msg);
	UI.chat.push(msg);
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
			//game.run(json.Id, json.Host, 'test');
		}
	};
	r.send();
}

getConnectionData();
