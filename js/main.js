'use strict';

console.log("fuck");

var w = window.innerWidth,
	h = window.innerHeight,
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h);
document.body.appendChild(renderer.view);

var Game = require('./game');
window.game = new Game(renderer, stage, 1, 'ws://' +window.location.hostname+ ':2000', require('./test-map'));

window.onresize = resize;
resize();
function resize() {
	w = window.innerWidth;
	h = window.innerHeight;
	game.resize(w, h);

	renderer.resize(w, h);
}

var listener = new window.keypress.Listener();

var move_combos = [
	{keys:'w', on_keydown: function() { this.dir[0]='N'; }, on_keyup: function() { this.dir[0]=' '; }, },
	{keys:'a', on_keydown: function() { this.dir[1]='W'; }, on_keyup: function() { this.dir[1]=' '; }, },
	{keys:'s', on_keydown: function() { this.dir[0]='S'; }, on_keyup: function() { this.dir[0]=' '; }, },
	{keys:'d', on_keydown: function() { this.dir[1]='E'; }, on_keyup: function() { this.dir[1]=' '; }, },

	{keys:'e', on_keydown: function() { this.avatars[this.player].velocity.z=1; }, on_keyup: function() { this.avatars[this.player].velocity.z=0; }, },
	{keys:'q', on_keydown: function() { this.avatars[this.player].velocity.z=-1; }, on_keyup: function() { this.avatars[this.player].velocity.z=0; }, },
];

for(var i=0,l=move_combos.length;i<l;i++) {
	var combo = move_combos[i];
	combo.on_keyup = combo.on_keyup.bind(game);
	combo.on_keydown = combo.on_keydown.bind(game);
}

listener.register_many(move_combos);

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

