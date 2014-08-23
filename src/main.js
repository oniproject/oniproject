'use strict';
require('insert-css')(require('./app.css'))

var Vue = require('vue')

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
window.dragon = null;

document.body.appendChild(renderer.view);
function onAssetsLoaded() {
	dragon = new PIXI.Spine("data/dragonBonesData.json");
	var scale = 1;//window.innerHeight / 700;
	dragon.position.x = window.innerWidth/2;
	dragon.position.y = window.innerHeight/2 + (450 * scale);
	dragon.scale.x = dragon.scale.y = scale
	dragon.state.setAnimationByName("flying", true);
	stage.addChild(dragon);

	new Vue({
		el: '#app',
		methods: {
			select: function(type, name) {
				console.log('select[%s] %s', type, name);
				this.$data.selected.type = type;
				this.$data.selected.name = name;

				var obj=null;
				switch(type) {
					case 'bone':
						obj = dragon.skeleton.findBone(name);
						break;
					case 'slot':
						obj = dragon.skeleton.findSlot(name);
						break;
				}
				if(obj) {
					this.$data.angle = obj.data.rotation;
					/*this.$data.scaleX = obj.data.scaleX;
					this.$data.scaleY = obj.data.scaleY;
					this.$data.translateX = obj.data.x;
					this.$data.translateY = obj.data.y;
					*/
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
				return dragon;
			},
			angle: {
				$get: function() {
					if(this.selected.type === 'bone') {
						return dragon.skeleton.findBone(this.selected.name).data.rotation;
					}
					return NaN;
				},
				$set: function(val) {
					if(this.selected.type === 'bone') {
						console.warn('angle $set', this.selected, val)
						dragon.skeleton.findBone(this.selected.name).data.rotation = +val;
					}
				},
			},
			translateX: {
				$get: function() {
					if(this.selected.type === 'bone') {
						return dragon.skeleton.findBone(this.selected.name).data.x;
					}
					return NaN;
				},
			},
			translateY: {
				$get: function() {
					if(this.selected.type === 'bone') {
						return dragon.skeleton.findBone(this.selected.name).data.y;
					}
					return NaN;
				},
			},
			scaleX: {
				$get: function() {
					if(this.selected.type === 'bone') {
						return dragon.skeleton.findBone(this.selected.name).data.scaleX;
					}
					return NaN;
				},
				$set: function(val) {
					if(this.selected.type === 'bone') {
						dragon.skeleton.findBone(this.selected.name).data.scaleX = val;
					}
				},
			},
			scaleY: {
				$get: function() {
					if(this.selected.type === 'bone') {
						return dragon.skeleton.findBone(this.selected.name).data.scaleY;
					}
					return NaN;
				},
				$set: function(val) {
					if(this.selected.type === 'bone') {
						dragon.skeleton.findBone(this.selected.name).data.scaleY = val;
					}
				},
			},
		},
		data: {
			selected: {
				type: '',
				name: '',
			},
		}
	});
}

requestAnimFrame(animate);
function animate() {
	requestAnimFrame(animate);
	renderer.render(stage);
}

