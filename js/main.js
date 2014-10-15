'use strict';

console.log('fuck');

var Tileset = require('./tileset'),
	Tilemap = require('./tilemap');

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
	}

	setInterval(animate, 50);
	setInterval(function(){
        game.net.RequestParametersMsg();
        game.net.RequestInventoryMsg();
    }, 1000);
    game.net.on('open', function() {
        game.net.RequestParametersMsg();
        game.net.RequestInventoryMsg();
    });

	game.net.on('InventoryMsg', function(inv) {
        UI.inventory = inv.Inventory;
    });
	game.net.on('ParametersMsg', function(p) {
        UI.hp = p.Parameters.HP;
        UI.mhp = p.Parameters.MHP;
        UI.mp = p.Parameters.MP;
        UI.mmp = p.Parameters.MMP;
        UI.tp = p.Parameters.TP;
        UI.mtp = p.Parameters.MTP;
        UI.spells = [];
        for(var k in p.Skills) {
            if(p.Skills.hasOwnProperty(k)) {
                var skill = p.Skills[k]
                UI.spells.push(skill);
            }
        }
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
		inventory: [
			{Name: "43"},
			{Name: "1k"},
			{Name: "4njki32"},
			{Name: "PPPPvndfsj"},
		],
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
			console.info('cast', spell.Name);
			game.net.FireMsg({t: ""+spell.Icon});
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
