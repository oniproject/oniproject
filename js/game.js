'use strict';

var EventEmitter = require('events').EventEmitter;

var Isomer = require('isomer');
Isomer.prototype.reorigin = function(point) {
	var xMap = new Point(point.x * this.transformation[0][0],
					   point.x * this.transformation[0][1]);

	var yMap = new Point(point.y * this.transformation[1][0],
					   point.y * this.transformation[1][1]);

	this.originX = - xMap.x - yMap.x + (this.canvas._width / 2.0);
	this.originY = + xMap.y + yMap.y + (point.z * this.scale) + (this.canvas._height / 2.0);
}

var Point = Isomer.Point;
var Shape = Isomer.Shape;
var Stairs = require('./stairs');
var Map = require('./map');
var Avatar = require('./avatar');
var Net = require('./net');

function Game(renderer, stage, player, url, map) {
	this.renderer = renderer;
	this.stage = stage;
	this.dir = [' ', ' '];
	this.player = player;
	this.avatars = {};

	var net = new Net(url);
	this.net = net;
	net.on('message', this.onmessage.bind(this));
	net.on('event', this.onevent.bind(this));
	net.on('FireMsg', this.onfire.bind(this));

	var iso = new Isomer(renderer.view);
	this.iso = iso;
	iso.lightColor = new Isomer.Color(0xFF, 0xCC, 0xCC);
	iso.colorDifference = 0.2;
	iso.canvas = new PIXI.Graphics();
	stage.addChild(iso.canvas);
	iso.canvas.path = function (points, color) {
		var c = color.r * 256 * 256 + color.g * 256 + color.b;
		var graphics = this; // for moar speed
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
		for(var id in game.avatars) {
			if(game.avatars.hasOwnProperty(id)) {
				var a = game.avatars[id];
				var pos = iso._translatePoint(a.position);
				var x = event.global.x - pos.x;
				var y = event.global.y - pos.y;
				var d = Math.sqrt(x*x + y*y);
				if(d < 50) {
					net.SetTargetMsg({id: id});
					console.log("xxx", id, d, pos, event.global);
				}
			}
		}
	}

	this.map = new Map(this.iso);
	this.map.objects = map.objects;
}

Game.prototype = EventEmitter.prototype;
Game.prototype.constructor = Game;

Game.prototype.resize = function(w, h) {
	this.iso.canvas._width = w;
	this.iso.canvas._height = h;

	this.iso.canvas.hitArea = new PIXI.Rectangle(0,0, w,h);

	if(this.avatars.hasOwnProperty(this.player)) {
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
		[1,1,1,1],
		[1,0,0,1],
		[1,1,1,1],
	];

	for(var y=xx.length-1;y>=0;y--) {
		for(var x=xx[y].length-1;x>=0;x--) {
			if(xx[y][x] != 0) {
				iso.add(Shape.Prism(new Point(x, y,  0), 1,1,0.1));
			}
		}
	}

	for(var i in this.avatars) {
		this.avatars[i].draw(iso);
	}
}

Game.prototype.animate = function(time) {
	if(this.avatars.hasOwnProperty(this.player)) {
		var player = this.avatars[this.player];
		player.move(this.dir.join(''));
		this.net.SetVelocityMsg(player.velocity);
	}
	for(var i in this.avatars) {
		this.avatars[i].update(0.05);
	}
	if(this.avatars.hasOwnProperty(this.player)) {
		this.iso.reorigin(this.avatars[this.player].position);
	}
}

Game.prototype.state_msg = function(state) {
	if (state.hasOwnProperty('Id')) {
		switch(state.Type) {
			case 2: // destroy
				delete this.avatars[state.Id];
				break;
			case 1: // create
				this.avatars[state.Id] = new Avatar(state.Position, state.Veloctity)
			case 0: // idle
				var avatar = this.avatars[state.Id];
				avatar.rot = 0;
			case 3: // move
				var avatar = this.avatars[state.Id];
				if(state.Type == 3) {
					avatar.rot = 3;
				}
				avatar.position.x = state.Position[0];
				avatar.position.y = state.Position[1];
				avatar.velocity.x = state.Veloctity[0];
				avatar.velocity.y = state.Veloctity[1];
				break;
		}
		return true;
	}
	return false;
}

Game.prototype.onmessage = function(message) {
	if(Array.isArray(message)) {
		for(var i=0, l=message.length; i<l; i++) {
			this.state_msg(message[i]);
		}
	} else {
		if(!this.state_msg(message)) {
			console.log('message', message);
		}
	}
}

Game.prototype.onevent = function(type, message) {
	console.log('event', type, message);
}

Game.prototype.onfire = function(message) {
	console.log('fire', message);
}

module.exports = Game;
