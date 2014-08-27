'use strict';
require('less').render(require('./app.css'), function (e, css) {
	require('insert-css')(css)
});

window.Vue = require('vue');
Vue.directive('phimg', require('vue-placeholders/src/vue-placeholders-image'))
Vue.directive('phtxt', require('vue-placeholders/src/vue-placeholders-text'))
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
var nn = 32;
for(var x = -n; x<n; x++) {
	for(var y = -n; y<n; y++) {
		backGrid.beginFill(0x000000, ((x+y)%2)?0.4:0.8);
		backGrid.drawRect(x*nn, y*nn, nn,nn);
		backGrid.endFill();
	}
}

function onAssetsLoaded() {
	var scale = 0.7;//window.innerHeight / 700;
	var xxxx = new PIXI.DisplayObjectContainer();
	stage.addChild(xxxx);
	xxxx.scale.x = xxxx.scale.y = scale;
	xxxx.position.x = window.innerWidth/4;
	xxxx.position.y = window.innerHeight/4 + (450 * scale);

	var bbDrawer = new PIXI.Graphics();
	var boneDrawer = new PIXI.Graphics();
	Spine = new PIXI.Spine("data/dragonBonesData.json");
	xxxx.addChild(Spine);
	xxxx.addChild(bbDrawer);
	xxxx.addChild(boneDrawer);
	//boneDrawer.position.x = Spine.position.x = window.innerWidth/4;
	//boneDrawer.position.y = Spine.position.y = window.innerHeight/4 + (450 * scale);
	//boneDrawer.scale.x = boneDrawer.scale.y = Spine.scale.x = Spine.scale.y = scale

	window.UpdateSetup = function() {
		Spine.state.clearAnimation();
		Spine.skeleton.setToSetupPose();
	}

	Spine.state.setAnimationByName('flying', false);
	for(var i=0;i<100;i++) {
		Spine.stage.currentTime = i/100;
		Spine.updateTransform();
	}
	Spine.stage.animationSpeed = 0;
	UpdateSetup();
	//Spine.state.setAnimationByName('flying', true);
	//setTimeout(function(){Spine.state.clearAnimation()}, 2000);
	//Spine.state.setAnimation('FAIL', true);
	
	bbDrawer.updateTransform = function() {
		PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
		bbDrawer.clear();

		for(var i=0, l= Spine.skeleton.drawOrder.length; i<l; i++) {
			var att = Spine.skeleton.drawOrder[i].currentSprite;
			var bb = att.getBounds();
			bb.x -= xxxx.position.x;
			bb.y -= xxxx.position.y;
			bbDrawer.lineStyle(1, 0x999999, 1);
			//bbDrawer.beginFill(0x9999ff, 0.1);
			bbDrawer.drawRect(bb.x/scale, bb.y/scale, bb.width/scale, bb.height/scale);
			//bbDrawer.endFill();
		}
	}

	boneDrawer.updateTransform = function() {
		PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
		boneDrawer.clear();


		for(var i=0, l= Spine.skeleton.bones.length;i<l;i++) {
			var bone = Spine.skeleton.bones[i];

			boneDrawer.lineStyle(0, 0x999999, 1);
			boneDrawer.beginFill(0x9999ff, 0.8);
			boneDrawer.drawCircle(bone.worldX, bone.worldY, 5);
			boneDrawer.endFill();

			if(bone.data.length) {
				boneDrawer.lineStyle(1, 0x9999ff, 1);
				var rot = bone.worldRotation * Math.PI/180;
				var x = Math.cos(rot) * bone.data.length;
				var y = Math.sin(rot) * bone.data.length;
				boneDrawer.moveTo(bone.worldX +x, bone.worldY -y);
				boneDrawer.lineTo(bone.worldX, bone.worldY);
			} else {
				boneDrawer.lineStyle(1, 0xff9999, 1);
				boneDrawer.moveTo(bone.worldX -nn, bone.worldY);
				boneDrawer.lineTo(bone.worldX +nn, bone.worldY);
				boneDrawer.moveTo(bone.worldX, bone.worldY -nn);
				boneDrawer.lineTo(bone.worldX, bone.worldY +nn);
			}
		}
	}

	app = new Vue({
		el: '#app',
		template: require('./app.html'),
		data: {
			selected: {
				type: '',
				name: '',
			},
			played: false,
			reversed: false,

			Time: 0.4,
			LoopStart: 0,
			LoopEnd: 30,
			speed: 1,

			animHeight: 0,
			otherHeight: 0,
		},
		methods: {
			setVisibility: function(type, name, val) {
				console.log('setVisibility', type, name, val);
			},
			resize: function() {
				console.log('resize');
				this.$broadcast('updateTree');
				Vue.nextTick(resizeAnimations);
			},
			stop: function() {
				console.info('stop');
				this.$data.played = false;
				this.$data.reversed = false;
				Spine.state.animationSpeed = 0;
				Spine.state.currentTime -= Spine.state.currentTime|0;
				this.$.Tools.transformEnable = true;
			},
			play: function() {
				console.info('play');
				this.$data.played = true;
				this.$data.reversed = false;

				Spine.state.setAnimationByName('flying', true);
				Spine.state.animationSpeed = this.$data.speed;
				Spine.state.currentTime -= Spine.state.currentTime|0;

				this.$.Tools.transformEnable = false;
			},
			play_reverse: function() {
				console.info('play_reverse');
				this.$data.played = false;
				this.$data.reversed = true;

				Spine.state.setAnimationByName('flying', true);
				Spine.state.animationSpeed = -this.$data.speed;
				Spine.state.currentTime = Spine.state.currentTime - (Spine.state.currentTime|0) + 10000;

				this.$.Tools.transformEnable = false;
			},
			updateTransform: function(type, name) {
				if(!this.$data.played && !this.$data.reversed) {
					this.$.Tools.transformEnable = type === 'bone';
				}
				if(!this.$.Tools.transformEnable) {
					this.$.Tools.toolT = 'none';
				}
				console.log('updateTransform[%s] %s', type, name);
			},
		},
		components: {
			a: require('./component-a'),
			b: require('./component-b'),
			AnimationsComponent: require('./animations'),
			Tools: require('./tools'),
			Tree: require('./tree'),
		},
		computed: {
			Spine: function() { return Spine; },
			Bones: function() {
				var bones = [];
				for(var i=0, l=Spine.skeleton.bones.length; i<l;i++) {
					var bone = Spine.skeleton.bones[i];
					bones.push({
						name: bone.data.name,
						parent: bone.parent? bone.parent.data.name: '',
						length: bone.data.length,
						data: {
							rotation: bone.data.rotation,
							position: {x: bone.data.x, y: bone.data.y},
							scale: {x: bone.data.scaleX, y: bone.data.scaleY},
						},
						local: {
							rotation: bone.rotation,
							position: {x: bone.x, y: bone.y},
							scale: {x: bone.scaleX, y: bone.scaleY},
						},
						world: {
							rotation: bone.worldRotation,
							position: {x: bone.worldX, y: bone.worldY},
							scale: {x: bone.worldScaleX, y: bone.worldScaleY},
						}
					});
				}
				return bones;
			},
			Slots: function() {
				var slots = [];
				for(var i=0, l=Spine.skeleton.drawOrder.length; i<l;i++) {
					var slot = Spine.skeleton.drawOrder[i];
					var s = {
						name: slot.data.name,
						bone: slot.bone.data.name,
						color: {r: slot.r, g: slot.g, b: slot.b, a: slot.a},
						attachments: [],
					};
					slots.push(s);
					// TODO find in animations ?
					for(var k in slot.sprites) {
						if(slot.sprites.hasOwnProperty(k)) {
							s.attachments.push({
								name: k,
								visible: slot.sprites[k].visible
							});
						}
					}
				}
				return slots;
			},
			Animations: function() {
				var animations = [];
				for(var i=0, l=Spine.skeleton.data.animations.length; i<l; i++) {
					var a = Spine.skeleton.data.animations[i];
					// TODO parse timelines
					animations.push({name: a.name});
				}
				return animations;
			},
			Attachments: function() {
				var attachments = [];
				// TODO get current skin
				var skin = Spine.skeleton.data.defaultSkin;
				for(var k in skin.attachments) {
					if(skin.attachments.hasOwnProperty(k)) {
						var a = skin.attachments[k];
						attachments.push({
							name: a.rendererObject.name,
						});
					}
				}
				return attachments;
			},
			Skins: function() {
				var skins = [];
				for(var i=0, l=Spine.skeleton.data.skins.length; i<l;i++) {
					var skin = Spine.skeleton.data.skins[i];
					//if(skin.name !== 'default') {
						skins.push({name: skin.name});
					//}
				}
				return skins;
			},

			// current time
			Current: {
				$get: function() {
					return (this.Time*31) |0;
				},
				$set: function(val) {
					if (val<0) {
						val=0;
					}
					Spine.state.currentTime = val / 31;
				},
			},
		},
	});

	var canvas = document.getElementById('canvas');
	var renderer = new PIXI.autoDetectRenderer(100, 100, canvas, true, true);

	var getH = function(el) {
		var style = window.getComputedStyle(el, null);
		return parseFloat(style.getPropertyValue('height'));
	}
	var getW = function(el) {
		var style = window.getComputedStyle(el, null);
		return parseFloat(style.getPropertyValue('width'));
	}

	var resizeAnimations = function(event) {
		//console.log('oldHeight', app.$data.animHeight);
		var animHeight = getH(document.getElementById('animations'));
		var otherHeight = window.innerHeight - animHeight;
		app.$data.otherHeight = otherHeight;
		app.$data.animHeight = animHeight;
		Vue.nextTick(function(){
			renderer.resize(getW(canvas), getH(canvas));
		});
		//console.log('newHeight', app.$data.animHeight, app.$data.otherHeight);
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

