'use strict';

var Vue = require('vue'),
	Tileset = require('../../js/tileset'),
	Tilemap = require('../../js/tilemap');


Vue.config({
	delimiters: ['`', '`'],
});

var P = {
	el: '#palete',
	data: {
		layer: 'first',
		isFill: false,
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
		setActive: function(a, i) {
			console.log(a, i);
			switch (a) {
				case 'A1':
					this.auto = true;
					this.t = 0;
					if (i % 2) {
						i -= 1;
						i *= 2;
						this.v = i + 3;
					//this.layer = 'second';
					} else {
						i *= 2;
						this.v = [i, i + 1, i + 2];
						//this.layer = 'first';
					}
					break;
				case 'A2':
					this.auto = true;
					this.t = 1;
					this.v = i;
					//this.layer = 'first';
					break;
				case 'A3':
					this.auto = false;
					this.t = 2;
					this.v = i;
					//this.layer = 'first';
					break;
				case 'A4':
					this.auto = false;
					this.t = 3;
					this.v = i;
					//this.layer = 'first';
					break;
				case 'A5':
					this.auto = false;
					this.t = 4;
					this.v = i;
					//this.layer = 'first';
					break;
				case 'B':
					this.auto = false;
					this.t = 5;
					this.v = i;
					//this.layer = 'first';
					break;
				case 'C':
					this.auto = false;
					this.t = 6;
					this.v = i;
					//this.layer = 'first';
					break;
				case 'D':
					this.auto = false;
					this.t = 7;
					this.v = i;
					//this.layer = 'first';
					break;
				case 'E':
					this.auto = false;
					this.t = 8;
					this.v = i;
					//this.layer = 'first';
					break;
			}
		},
	},
	created: function() {
		console.log('created palete');
		this.$parent.$emit('initPalete');
	},
};

module.exports = {
	el: '#app',
	template: require('./app.html'),
	tilemaps: {
		World_A1: [16, 12],
		World_B: [16, 16],

		Outside_A1: [16, 12], // Animation
		Outside_A2: [16, 12], // Ground
		Outside_A3: [16, 8], // Buildings
		Outside_A4: [16, 15], // Walls
		Outside_A5: [8, 16], // Normal
		Outside_B: [16, 16],
		Outside_C: [16, 16],
	},
	scene: null,
	Outside: null,
	data: {
		count: 0,
	},
	components: {
		palete: P,
	},
	methods: {
		init: function() {
			console.log('init');
			var WH = {
				width: 32,
				height: 32
			};

			var tilemaps = this.$options.tilemaps;



			for (var k in tilemaps) {
				this.count++;
				var t = tilemaps[k];
				var set = new Tileset('/game/' + k + '.png', t[0], t[1], WH, true);
				tilemaps[k] = set;
				set.image.on('loaded', (function() {
					this.count--;
					console.log('loaded', this.count);
					if (!this.count) {
						this.onLoad();
					}
				}).bind(this));
			}

			var Outside = this.$options.Outside = [
				tilemaps.Outside_A1,
				tilemaps.Outside_A2,
				tilemaps.Outside_A3,
				tilemaps.Outside_A4,
				tilemaps.Outside_A5,
				tilemaps.Outside_B,
			tilemaps.Outside_C];
			var scene = this.$options.scene = new Tilemap(20, 20, Outside);

			for (var k in tilemaps) {
				tilemaps[k].image.load();
			}
		},
		onLoad: function() {
			console.log('onLoad', this.$);
			var Outside = this.$options.Outside;
			console.log(Outside[0]);
			//return;
			var type = this.$.palete;
			for (var y = 0; y < 10; y += 3) {
				type.A1.push({
					x: 0,
					y: -y,
					img: Outside[0].image.texture.baseTexture.source.src
				});
				type.A1.push({
					x: -6,
					y: -y,
					img: Outside[0].image.texture.baseTexture.source.src
				});
				type.A1.push({
					x: -8,
					y: -y,
					img: Outside[0].image.texture.baseTexture.source.src
				});
				type.A1.push({
					x: 2,
					y: -y,
					img: Outside[0].image.texture.baseTexture.source.src
				});
			}
			for (var y = 0; y < 10; y += 3) {
				type.A2.push({
					x: 0,
					y: -y,
					img: Outside[1].image.texture.baseTexture.source.src
				});
				type.A2.push({
					x: -2,
					y: -y,
					img: Outside[1].image.texture.baseTexture.source.src
				});
				type.A2.push({
					x: -4,
					y: -y,
					img: Outside[1].image.texture.baseTexture.source.src
				});
				type.A2.push({
					x: -6,
					y: -y,
					img: Outside[1].image.texture.baseTexture.source.src
				});
				type.A2.push({
					x: -8,
					y: -y,
					img: Outside[1].image.texture.baseTexture.source.src
				});
				type.A2.push({
					x: -10,
					y: -y,
					img: Outside[1].image.texture.baseTexture.source.src
				});
				type.A2.push({
					x: -12,
					y: -y,
					img: Outside[1].image.texture.baseTexture.source.src
				});
				type.A2.push({
					x: -14,
					y: -y,
					img: Outside[1].image.texture.baseTexture.source.src
				});
			}
			for (var y = 0; y < 8; y++) {
				for (var x = 0; x < 16; x++) {
					type.A3.push({
						x: -x,
						y: -y,
						img: Outside[2].image.texture.baseTexture.source.src
					});
				}
			}
			for (var y = 0; y < 15; y++) {
				for (var x = 0; x < 16; x++) {
					type.A4.push({
						x: -x,
						y: -y,
						img: Outside[3].image.texture.baseTexture.source.src
					});
				}
			}
			for (var y = 0; y < 16; y++) {
				for (var x = 0; x < 8; x++) {
					type.A5.push({
						x: -x,
						y: -y,
						img: Outside[4].image.texture.baseTexture.source.src
					});
				}
			}
			for (var y = 0; y < 16; y++) {
				for (var x = 0; x < 16; x++) {
					type.B.push({
						x: -x,
						y: -y,
						img: Outside[5].image.texture.baseTexture.source.src
					});
				}
			}
			for (var y = 0; y < 16; y++) {
				for (var x = 0; x < 16; x++) {
					type.C.push({
						x: -x,
						y: -y,
						img: Outside[6].image.texture.baseTexture.source.src
					});
				}
			}
		},
	},
	created: function() {
		this.$on('initPalete', this.init.bind(this));
	},
}
