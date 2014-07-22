'use strict';

console.log("fuck");

function run(player, host) {
	var w = window.innerWidth,
		h = window.innerHeight,
		stage = new PIXI.Stage(0xFFFFFF, true),
		renderer = PIXI.autoDetectRenderer(w, h);
	document.body.appendChild(renderer.view);

	var Game = require('./game');
	window.game = new Game(renderer, stage, player, 'ws://' +host+ '/ws', require('./test-map'));

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
	var params = "login="+encodeURIComponent(login.value);
	r.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	console.log(params);
	r.send(params);
}

