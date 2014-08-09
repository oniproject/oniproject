//'use strict';

console.log("fuck");

var AutoTilemap = require('./autotilemap');
var Tileset = require('./tileset');
var Tilemap = require('./tilemap');

function run(player, host) {
	var w = window.innerWidth,
		h = window.innerHeight,
		stage = new PIXI.Stage(0xFFFFFF, true),
		renderer = PIXI.autoDetectRenderer(w, h);
	document.body.appendChild(renderer.view);

	var WH = {width:32, height:32};
	var World_A1 = new Tileset('/game/World_A1.png', 16, 12, WH);
	var World_A2 = new Tileset('/game/World_A2.png', 16, 12, WH);
	var World_B = new Tileset('/game/World_B.png', 16, 16, WH);

	var map = [
		[1,2,3,4],
		[3,1,4,1],
		[3,0,9,10],
		[3,1,4,1],
	];
	var tilemap = new Tilemap(map, World_B);

	var nn = 31;

	var amap = [
		[0,0,0,0,0,0,0],
		[0,nn,0,nn,nn,nn,0],
		[0,nn,0,nn,0,0,0],
		[0,nn,0,nn,0,0,0],
		[0,nn,nn,nn,nn,nn,0],
		[0,0,0,nn,0,nn,0],
		[0,0,0,nn,0,nn,0],
		[0,nn,nn,nn,0,nn,0],
		[0,0,0,0,0,0,0],
		[0,nn,nn,nn,0,0,0],
		[0,nn,0,nn,0,0,0],
		[0,nn,nn,nn,0,0,0],
		[0,0,nn,nn,nn,0,0],
		[0,0,0,nn,nn,0,0],
		[0,0,0,nn,nn,0,0],
		[0,0,0,0,0,0,0],
	];

	var amap = new AutoTilemap(amap, World_A2);

	var Game = require('./game');
	window.game = new Game(renderer, stage, player, 'ws://' +host+ '/ws', require('./test-map'));
	stage.addChild(tilemap.container);
	stage.addChild(amap.container);

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
	function animate() {
		game.animate(0.05);
	}
}

var form = document.getElementById('form');
var login = document.getElementById('login');
var password = document.getElementById('password');

form.onsubmit = function(event) {
	event.preventDefault();
	var r = new XMLHttpRequest();
	r.open("POST", "/login", true);
	r.onreadystatechange = function () {
		if (r.readyState != 4 || r.status != 200) return;
		var json = JSON.parse(r.responseText);
		form.parentNode.removeChild(form);
		console.log("Success:", json);
		run(json.Id, json.Host);
	};
	var params = "login="+encodeURIComponent(login.value)+"&password="+encodeURIComponent(password.value);
	r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	console.log(params);
	r.send(params);
}

