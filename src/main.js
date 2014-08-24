'use strict';
require('less').render(require('./app.css'), function (e, css) {
	require('insert-css')(css)
});

var Vue = require('vue')
Vue.filter('int', function (value) {
	return value |0;
})

var assetsToLoader = [
	"data/dragonBones.json",
	"data/dragonBonesData.json"];
var loader = new PIXI.AssetLoader(assetsToLoader);
loader.onComplete = onAssetsLoaded
loader.load();

var stage = new PIXI.Stage(0xFFFFFF, true);
window.Spine = null;
window.app = null;

var backGrid = new PIXI.Graphics();
stage.addChild(backGrid);
var n = 50;
for(var x = -n; x<n; x++) {
	for(var y = -n; y<n; y++) {
		backGrid.beginFill(0x000000, ((x+y)%2)?0.4:0.8);
		backGrid.drawRect(x*32, y*32, 32,32);
		backGrid.endFill();
	}
}

function onAssetsLoaded() {
	Spine = new PIXI.Spine("data/dragonBonesData.json");
	stage.addChild(Spine);
	var scale = 0.5;//window.innerHeight / 700;
	Spine.position.x = window.innerWidth/4;
	Spine.position.y = window.innerHeight/4 + (450 * scale);
	Spine.scale.x = Spine.scale.y = scale
	Spine.state.setAnimationByName("flying", true);

	app = new Vue({
		el: '#app',
		data: {
			selected: {
				type: '',
				name: '',
			},
			options: {
				bones: {
					selecting: true,
					show: true,
					names: false,
				},
				images: {
					selecting: true,
					show: true,
					names: false,
				},
				bounds: {
					selecting: true,
					show: false,
					names: false,
				},
			},
			toolT: 'none',
			transformEnable: false,
			played: true,
			reversed: false,
			Time: 0.4,
			LoopStart: 0,
			LoopEnd: 30,
			speed: 1,

			animHeight: 0,
			otherHeight: 0,

			Dopesheet: false,
			Graph: false,
		},
		methods: {
			resize: function() {
				console.log('resize');
				Vue.nextTick(resizeAnimations);
				//setTimeout(resizeAnimations, 200);
			},
			stop: function() {
				console.info('stop');
				this.$data.played = false;
				this.$data.reversed = false;
				Spine.state.animationSpeed = 0;
				Spine.state.currentTime -= Spine.state.currentTime|0;
			},
			play: function() {
				console.info('play');
				this.$data.played = true;
				this.$data.reversed = false;
				Spine.state.animationSpeed = this.$data.speed;
				Spine.state.currentLoop = true;
				Spine.state.currentTime -= Spine.state.currentTime|0;
			},
			play_reverse: function() {
				console.info('play_reverse');
				this.$data.played = false;
				this.$data.reversed = true;
				Spine.state.currentLoop = true;
				Spine.state.currentTime = Spine.state.currentTime - Spine.state.currentTime|0 + 100000;
				Spine.state.animationSpeed = -this.$data.speed;
			},
			updateTransform: function(type, name) {
				console.log('updateTransform[%s] %s', type, name);
				this.$data.transformEnable = type === 'bone';
				if(!this.$data.transformEnable) {
					this.$data.toolT = 'none';
				}
			},
		},
		components: {
			a: require('./component-a'),
			b: require('./component-b'),
			Animations: require('./animations'),
			Tools: require('./tools'),
			Tree: require('./tree'),
		},
		template: require('./app.html'),
		computed: {
			Spine: function() {
				return Spine;
			},
			Current: {
				$get: function() {
					return (this.Time*31) |0;
				},
				$set: function(val) {
					if(val<0) {
						val=0;
					}
					Spine.state.currentTime = val / 31;
				},
			},
			rotation: {
				$get: function() {
					if(this.selected.type === 'bone') {
						return Spine.skeleton.findBone(this.selected.name).data.rotation;
					}
					return NaN;
				},
				$set: function(val) {
					if(this.selected.type === 'bone') {
						console.warn('angle $set', this.selected, val)
						Spine.skeleton.findBone(this.selected.name).data.rotation = +val;
					}
				},
			},
			translateX: {
				$get: function() {
					if(this.selected.type === 'bone') {
						return Spine.skeleton.findBone(this.selected.name).data.x;
					}
					return NaN;
				},
				$set: function(val) {
					if(this.selected.type === 'bone') {
						Spine.skeleton.findBone(this.selected.name).data.x = +val;
					}
				},
			},
			translateY: {
				$get: function() {
					if(this.selected.type === 'bone') {
						return Spine.skeleton.findBone(this.selected.name).data.y;
					}
					return NaN;
				},
				$set: function(val) {
					if(this.selected.type === 'bone') {
						Spine.skeleton.findBone(this.selected.name).data.y = +val;
					}
				},
			},
			scaleX: {
				$get: function() {
					if(this.selected.type === 'bone') {
						return Spine.skeleton.findBone(this.selected.name).data.scaleX;
					}
					return NaN;
				},
				$set: function(val) {
					if(this.selected.type === 'bone') {
						Spine.skeleton.findBone(this.selected.name).data.scaleX = +val;
					}
				},
			},
			scaleY: {
				$get: function() {
					if(this.selected.type === 'bone') {
						return Spine.skeleton.findBone(this.selected.name).data.scaleY;
					}
					return NaN;
				},
				$set: function(val) {
					if(this.selected.type === 'bone') {
						Spine.skeleton.findBone(this.selected.name).data.scaleY = +val;
					}
				},
			},
		},
	});

	var canvas = document.getElementById('canvas');
	var renderer = new PIXI.autoDetectRenderer(100, 100, canvas, true);

	var getH = function(el) {
		var style = window.getComputedStyle(el, null);
		return parseFloat(style.getPropertyValue('height'));
	}
	var getW = function(el) {
		var style = window.getComputedStyle(el, null);
		return parseFloat(style.getPropertyValue('width'));
	}

	var resizeAnimations = function(event) {
		console.log('oldHeight', app.$data.animHeight);
		var animHeight = getH(document.getElementById('animations'));
		var otherHeight = window.innerHeight - animHeight;
		app.$data.otherHeight = otherHeight;
		app.$data.animHeight = animHeight;
		Vue.nextTick(function(){
			renderer.resize(getW(canvas), getH(canvas));
		});
		console.log('newHeight', app.$data.animHeight, app.$data.otherHeight);
		//renderer.view.height = otherHeight;
	}
	window.addEventListener('resize', resizeAnimations);
	resizeAnimations();
	requestAnimFrame(animate);
	function animate() {
		requestAnimFrame(animate);
		if(app) {
			var time = Spine.state.currentTime - (Spine.state.currentTime|0);
			app.$data.Time = time;
		}
		renderer.render(stage);
	}
}



