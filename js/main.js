'use strict';

console.log('fuck');

var Tiled = require('./tiled');

function run(player, host) {
	var w = window.innerWidth,
		h = window.innerHeight,
		stage = new PIXI.Stage(0xFFFFFF, true),
		renderer = PIXI.autoDetectRenderer(w, h);
	document.body.appendChild(renderer.view);

	var ttt = new Tiled('/maps/', 'test.json');
	ttt.load();


	var Game = require('./game');
	window.game = new Game(renderer, stage, player, 'ws://' + host + '/ws');
	game.container.addChild(ttt);

	/*var colorMatrixFilter = new PIXI.ColorMatrixFilter();
	colorMatrixFilter.matrix = [
		0.4, 0, 0, 0,
		0, 0.4, 0, 0,
		0, 0, 0.7, 0,
		0, 0, 0, 1,
	];
	game.container.filters = [colorMatrixFilter];
	*/


	game.ttt = ttt;

	window.onresize = resize;
	resize();

	function resize() {
		w = window.innerWidth;
		h = window.innerHeight;
		game.resize(w, h);

		renderer.resize(w, h);
	}

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
	requestAnimFrame(render);

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
				{
					Name: "43"
				},
				{
					Name: "1k"
				},
				{
					Name: "4njki32"
				},
				{
					Name: "PPPPvndfsj"
				},
			],
			target: {
				Race: 0,
				HP: 0,
				MHP: 0,
				Name: "vnfdjsk"
			},
			spells: [
				{
					Icon: 'all-for-one'
				},
				{
					Icon: 'all-for-one'
				},
				{
					Icon: 'all-for-one'
				},
				{
					Icon: 'all-for-one'
				},
				{
					Icon: 'all-for-one'
				},

				{
					Icon: 'screaming'
				},
				{
					Icon: 'screaming'
				},
				{
					Icon: 'screaming'
				},
				{
					Icon: 'screaming'
				},
				{
					Icon: 'screaming'
				},

				{
					Icon: 'spiral-thrust'
				},
				{
					Icon: 'spiral-thrust'
				},
				{
					Icon: 'spiral-thrust'
				},
				{
					Icon: 'spiral-thrust'
				},
				{
					Icon: 'spiral-thrust'
				},

				{
					Icon: 'rune-sword'
				},
				{
					Icon: 'rune-sword'
				},
				{
					Icon: 'rune-sword'
				},
				{
					Icon: 'rune-sword'
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
					t: "" + spell
				});
			},
			drop: function(index) {
				game.net.DropItemMsg({
					Id: index
				});
			},
		},
	}),

	r = new XMLHttpRequest();
r.open('POST', '/game', true);
r.onreadystatechange = function() {
	if (r.readyState != 4 || r.status != 200) {
		return;
	}
	var json = JSON.parse(r.responseText);
	if (json.Id !== undefined) {
		console.log('Success:', json);
		run(json.Id, json.Host);
	}
};
r.send();
