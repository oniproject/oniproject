'use strict';

console.log('start');

var Tileset = require('./tileset');
var Tilemap = require('./tilemap');



var WH = {width:32, height:32};
var World_A1 = new Tileset('/game/World_A1.png', 16, 12, WH);
var World_A2 = new Tileset('/game/World_A2.png', 16, 12, WH);
var World_B = new Tileset('/game/World_B.png', 16, 16, WH);

var Outside_A1 = new Tileset('/game/Outside_A1.png', 16, 12, WH); // Animation
var Outside_A2 = new Tileset('/game/Outside_A2.png', 16, 12, WH); // Ground
var Outside_A3 = new Tileset('/game/Outside_A3.png', 16, 8, WH);  // Buildings
var Outside_A4 = new Tileset('/game/Outside_A4.png', 16, 15, WH); // Walls
var Outside_A5 = new Tileset('/game/Outside_A5.png', 8, 16, WH);  // Normal
var Outside_B =  new Tileset('/game/Outside_B.png', 16, 16, WH);
var Outside_C =  new Tileset('/game/Outside_C.png', 16, 16, WH);

var nn = 31;

var data = [
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

//var amap = new AutoTilemap(amap, World_A2);







var w = $('#canvas').width(),
	h = $('#canvas').height(),
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h);

stage.interactive = true;
$('#canvas').append(renderer.view);

window.Outside = [Outside_A1, Outside_A2, Outside_A3, Outside_A4, Outside_A5, Outside_B, Outside_C];

window.scene = new Tilemap(20, 20, Outside);
for(var y=0, ml=data.length; y<ml; y++) {
	var line = data[y];
	for(var x=0, ll=line.length;x<ll; x++) {
		var nnn = data[y][x];
		if(nnn) {
			scene.setAt(x, y, 'first', 0, [0,1,2], true);
			scene.setAt(x, y, 'second', 0, 3, true);
		} else {
			scene.setAt(x, y, 'first', 0, [0,1,2], true);
		}
	}
}


stage.addChild(scene);



var originX=32*10, originY=32*2, moveSpeed=32;
var keyCodes = {
	37: function(event) {
		originX += moveSpeed;
		resize();
	},
	38: function(event) {
		originY += moveSpeed;
		resize();
	},
	39: function(event) {
		originX -= moveSpeed;
		resize();
	},
	40: function(event) {
		originY -= moveSpeed;
		resize();
	},
}
document.onkeydown = function(event) {
	var f = keyCodes[event.keyCode];
	if (f) {
		event.preventDefault();
		f(event);
	}
}


window.onresize = resize;
resize();
function resize() {
	w = $('#canvas').width();
	h = $('#canvas').height();

	scene.position.x = originX;
	scene.position.y = originY;

	renderer.resize(w, h);
}

requestAnimFrame(animate);

function animate() {
	renderer.render(stage);
	requestAnimFrame(animate);
}


var type = new Vue({
	el: '#palete',
	data: {
		layer:'first',
		isFill:false,
		t: 0,
		v: 0,
		auto: false,
		//{ img: "", x: 0, y:0 },
		A1: [],
		A2: [],
		A3: [],
		A4: [],
		A5: [],
		B: [],
		C: [],
		D: [],
		E: [],
	},
	methods: {
		setActive: function(a, i){
			console.log(a, i);
			switch(a) {
			case 'A1':
				this.$data.auto = true;
				this.$data.t = 0;
				if(i%2) {
					i-=1;
					i*=2;
					this.$data.v = i+3;
					//this.$data.layer = 'second';
				} else {
					i*=2;
					this.$data.v = [i, i+1, i+2];
					//this.$data.layer = 'first';
				}
				break;
			case 'A2':
				this.$data.auto = true;
				this.$data.t = 1;
				this.$data.v = i;
				//this.$data.layer = 'first';
				break;
			case 'A3':
				this.$data.auto = false;
				this.$data.t = 2;
				this.$data.v = i;
				//this.$data.layer = 'first';
				break;
			case 'A4':
				this.$data.auto = false;
				this.$data.t = 3;
				this.$data.v = i;
				//this.$data.layer = 'first';
				break;
			case 'A5':
				this.$data.auto = false;
				this.$data.t = 4;
				this.$data.v = i;
				//this.$data.layer = 'first';
				break;
			case 'B':
				this.$data.auto = false;
				this.$data.t = 5;
				this.$data.v = i;
				//this.$data.layer = 'first';
				break;
			case 'C':
				this.$data.auto = false;
				this.$data.t = 6;
				this.$data.v = i;
				//this.$data.layer = 'first';
				break;
			case 'D':
				this.$data.auto = false;
				this.$data.t = 7;
				this.$data.v = i;
				//this.$data.layer = 'first';
				break;
			case 'E':
				this.$data.auto = false;
				this.$data.t = 8;
				this.$data.v = i;
				//this.$data.layer = 'first';
				break;
			}
		},
	},
});

setTimeout(function() {
	for(var y=0; y<10; y+=3) {
		type.$data.A1.push({x:0, y:-y, img: Outside[0].image.texture.baseTexture.source.src});
		type.$data.A1.push({x:-6, y:-y, img: Outside[0].image.texture.baseTexture.source.src});
		type.$data.A1.push({x:-8, y:-y, img: Outside[0].image.texture.baseTexture.source.src});
		type.$data.A1.push({x:2, y:-y, img: Outside[0].image.texture.baseTexture.source.src});
	}
	for(var y=0; y<10; y+=3) {
		type.$data.A2.push({x:0, y:-y, img: Outside[1].image.texture.baseTexture.source.src});
		type.$data.A2.push({x:-2, y:-y, img: Outside[1].image.texture.baseTexture.source.src});
		type.$data.A2.push({x:-4, y:-y, img: Outside[1].image.texture.baseTexture.source.src});
		type.$data.A2.push({x:-6, y:-y, img: Outside[1].image.texture.baseTexture.source.src});
		type.$data.A2.push({x:-8, y:-y, img: Outside[1].image.texture.baseTexture.source.src});
		type.$data.A2.push({x:-10, y:-y, img: Outside[1].image.texture.baseTexture.source.src});
		type.$data.A2.push({x:-12, y:-y, img: Outside[1].image.texture.baseTexture.source.src});
		type.$data.A2.push({x:-14, y:-y, img: Outside[1].image.texture.baseTexture.source.src});
	}
	for(var y=0; y<8; y++) {
		for(var x=0; x<16; x++) {
			type.$data.A3.push({x:-x, y:-y, img: Outside[2].image.texture.baseTexture.source.src});
		}
	}
	for(var y=0; y<15; y++) {
		for(var x=0; x<16; x++) {
			type.$data.A4.push({x:-x, y:-y, img: Outside[3].image.texture.baseTexture.source.src});
		}
	}
	for(var y=0; y<16; y++) {
		for(var x=0; x<8; x++) {
			type.$data.A5.push({x:-x, y:-y, img: Outside[4].image.texture.baseTexture.source.src});
		}
	}
	for(var y=0; y<16; y++) {
		for(var x=0; x<16; x++) {
			type.$data.B.push({x:-x, y:-y, img: Outside[5].image.texture.baseTexture.source.src});
		}
	}
	for(var y=0; y<16; y++) {
		for(var x=0; x<16; x++) {
			type.$data.C.push({x:-x, y:-y, img: Outside[6].image.texture.baseTexture.source.src});
		}
	}
}, 3000);

stage.click = function(event) {
	var loc = event.getLocalPosition(scene);
	var x = loc.x/32|0;
	var y = loc.y/32|0;
	if(type.$data.isFill) {
		scene.Fill(x, y, type.$data.layer, type.$data.t, type.$data.v, type.$data.auto);
	} else {
		scene.setAt(x, y, type.$data.layer, type.$data.t, type.$data.v, type.$data.auto);
	}
	console.log(x, y, type.$data);
}
