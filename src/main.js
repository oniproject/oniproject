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
var renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
renderer.view.style.display = "block";
renderer.view.style.width = "800px";
renderer.view.style.height = "500px";
window.Spine = null;
window.app = null;

document.body.appendChild(renderer.view);
function onAssetsLoaded() {
	Spine = new PIXI.Spine("data/dragonBonesData.json");
	stage.addChild(Spine);
	var scale = 1;//window.innerHeight / 700;
	Spine.position.x = window.innerWidth/2;
	Spine.position.y = window.innerHeight/2 + (450 * scale);
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
			LoopEnd: 29,

			Dopesheet: false,
			Graph: false,
		},
		methods: {
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
				Spine.state.animationSpeed = 1;
				Spine.state.currentLoop = true;
				Spine.state.currentTime -= Spine.state.currentTime|0;
			},
			play_reverse: function() {
				console.info('play_reverse');
				this.$data.played = false;
				this.$data.reversed = true;
				Spine.state.currentLoop = true;
				Spine.state.currentTime = Spine.state.currentTime - Spine.state.currentTime|0 + 100000;
				Spine.state.animationSpeed = -1;
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
					return (this.Time*30) |0;
				},
				$set: function(val) {
					Spine.state.currentTime = val / 30;
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
	Vue.nextTick(function() {
		var c = Spine.state.currentTime;
		var time = c - (Spine.state.currentTime|0);
		console.log(time);
		app.$data.Time = time+0.5;
	});
}

requestAnimFrame(animate);
function animate() {
	requestAnimFrame(animate);
	if(app) {
		var time = Spine.state.currentTime - (Spine.state.currentTime|0);
		app.$data.Time = time;
	}
	renderer.render(stage);
}

