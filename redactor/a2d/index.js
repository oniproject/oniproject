'use strict';

require('less').render(require('./app.css'), function(e, css) {
	require('insert-css')(css)
});

function makeGrid() {
	var backGrid = new PIXI.Graphics();
	var n = 50;
	var nn = 32;
	for (var x = -n; x < n; x++) {
		for (var y = -n; y < n; y++) {
			backGrid.beginFill(0x000000, ((x + y) % 2) ? 0.4 : 0.8);
			backGrid.drawRect(x * nn, y * nn, nn, nn);
			backGrid.endFill();
		}
	}
	return backGrid;
}

function makeBBDrawer(Spine) {
	var bbDrawer = new PIXI.Graphics();
	bbDrawer.updateTransform = function() {
		PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
		bbDrawer.clear();

		for (var i = 0, l = Spine.skeleton.drawOrder.length; i < l; i++) {
			var att = Spine.skeleton.drawOrder[i].currentSprite;
			var bb = att.getBounds();
			bbDrawer.lineStyle(1, 0x999999, 1);
			bbDrawer.drawRect(bb.x, bb.y, bb.width, bb.height);
			bbDrawer.lineStyle(3, 0x999999, 1);
			bbDrawer.drawRect(bb.x, bb.y, 1, 1);
			/*
			bbDrawer.lineStyle(1, 0x999999, 1);
			bbDrawer.moveTo(bb.x, bb.x);
			bbDrawer.lineTo(bb.x+bb.width, bb.y+bb.height);
			*/
		}
	}
	return bbDrawer;
}

function makeBoneDrawer(Spine) {
	var boneDrawer = new PIXI.Graphics();
	boneDrawer.updateTransform = function() {
		PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
		var nn = 20;
		boneDrawer.clear();

		var ox = Spine.position.x;
		var oy = Spine.position.y;

		for (var i = 0, l = Spine.skeleton.bones.length; i < l; i++) {
			var bone = Spine.skeleton.bones[i];

			boneDrawer.lineStyle(0, 0x999999, 1);
			boneDrawer.beginFill(0x9999ff, 0.8);
			boneDrawer.drawCircle(bone.worldX + ox, bone.worldY + oy, nn / 4);
			boneDrawer.endFill();

			if (bone.data.length) {
				boneDrawer.lineStyle(1, 0x9999ff, 1);
				var rot = bone.worldRotation * Math.PI / 180;
				var x = Math.cos(rot) * bone.data.length;
				var y = Math.sin(rot) * bone.data.length;
				boneDrawer.moveTo(bone.worldX + ox + x, bone.worldY + oy - y);
				boneDrawer.lineTo(bone.worldX + ox, bone.worldY + oy);
			} else {
				boneDrawer.lineStyle(1, 0xff9999, 1);
				boneDrawer.moveTo(bone.worldX + ox - nn, bone.worldY + oy);
				boneDrawer.lineTo(bone.worldX + ox + nn, bone.worldY + oy);
				boneDrawer.moveTo(bone.worldX + ox, bone.worldY - nn + oy);
				boneDrawer.lineTo(bone.worldX + ox, bone.worldY + nn + oy);
			}
		}
	}
	return boneDrawer;
}

module.exports = {
	el: '#app',
	template: require('./app.html'),
	Spine: null,
	renderer: null,
	stage: null,
	data: {
		selected: {
			type: '',
			name: '',
		},
		played: true,
		reversed: false,

		Time: 0.4,
		LoopStart: 0,
		LoopEnd: 30,

		otherHeight: 0,
	},
	components: {
		Animations: require('./animations'),
		Tools: require('./tools'),
		Tree: require('./tree'),
	},
	methods: {
		load: function(data) {
			var Spine = this.$options.Spine;
			if (Spine.children.length) {
				Spine.removeChildren();
			}
			Spine.spineData = data;
			var spine = PIXI.Spine.spine;

			(function() {
				this.skeleton = new spine.Skeleton(this.spineData);
				this.skeleton.updateWorldTransform();

				this.stateData = new spine.AnimationStateData(this.spineData);
				this.state = new spine.AnimationState(this.stateData);

				this.slotContainers = [];

				for (var i = 0, n = this.skeleton.drawOrder.length; i < n; i++) {
					var slot = this.skeleton.drawOrder[i];
					var attachment = slot.attachment;
					var slotContainer = new PIXI.DisplayObjectContainer();
					this.slotContainers.push(slotContainer);
					this.addChild(slotContainer);
					if (!(attachment instanceof spine.RegionAttachment)) {
						continue;
					}
					var spriteName = attachment.rendererObject.name;
					var sprite = this.createSprite(slot, attachment.rendererObject);
					slot.currentSprite = sprite;
					slot.currentSpriteName = spriteName;
					slotContainer.addChild(sprite);
				}
			}).call(Spine);

			this.currentAnimation = 'flying';
		},
		setVisibility: function(type, name, val) {
			console.log('setVisibility', type, name, val);
		},
		resize: function() {
			console.log('resize');
			Vue.nextTick(window.resizeAnimations);
		},
		stop: function() {
			this.played = this.reversed = false;
			console.info('stop');

			this.animationSpeed = 0;
			var Spine = this.$options.Spine;
			Spine.state.currentTime -= Spine.state.currentTime | 0;
			this.$.Tools.transformEnable = true;
		},
		play: function(speed) {
			this.played = speed > 0;
			this.reversed = speed < 0;

			console.info('play');
			this.animationSpeed = speed;
			var Spine = this.$options.Spine;
			Spine.state.currentTime -= Spine.state.currentTime | 0;
			if (speed < 0) {
				Spine.state.currentTime += 10000;
			}

			this.$.Tools.transformEnable = false;
			if (!this.currentAnimation) {
				this.currentAnimation = 'flying';
			}
		},
		updateTransform: function(type, name) {
			//if(!this.played && !this.reversed) {
			if (this.animationSpeed === 0) {
				this.$.Tools.transformEnable = type === 'bone';
			}
			if (!this.$.Tools.transformEnable) {
				this.$.Tools.toolT = 'none';
			}
			console.log('updateTransform[%s] %s', type, name);
		},
	},
	computed: {
		Spine: function() {
			return this.$options.Spine;
		},
		isAnimations: {
			$get: function() {
				return this.$.Animations.isEnabled;
			},
			$set: function(val) {
				this.$.Animations.isEnabled = val;
				if (!val) {
					this.stop();
					this.$options.Spine.state.clearAnimation();
					this.$options.Spine.skeleton.setToSetupPose();
				}
				this.resize();
			},
		},
		currentAnimation: {
			$get: function() {
				if (!this.$options.Spine.state.current) return '';
				return this.$options.Spine.state.current.name
			},
			$set: function(val) {
				this.$options.Spine.state.setAnimationByName(val, true);
			}
		},
		animationSpeed: {
			$get: function() {
				return this.$options.Spine.state.animationSpeed;
			},
			$set: function(val) {
				this.$options.Spine.state.animationSpeed = val; Vue.nextTick((function() {
					this.played;
				}).bind(this));
			}
		},
		// current time
		Current: {
			$get: function() {
				return (this.Time * 31) | 0;
			},
			$set: function(val) {
				if (val < 0) {
					val = 0;
				}
				this.$options.Spine.state.currentTime = val / 31;
			},
		},
	},
	created: function() {
		var that = this;

		var stage = this.$options.stage = new PIXI.Stage(0xFFFFFF, true);
		stage.addChild(makeGrid());

		var spineJsonParser = new PIXI.Spine.spine.SkeletonJson();
		var skeletonData = spineJsonParser.readSkeletonData({
			bones: [],
			slots: [],
			skins: {
				default: {}
			},
			animations: {
				flying: {},
			}
		});
		PIXI.AnimCache['defaultSpine'] = skeletonData;
		var Spine = window.Spine = this.$options.Spine = new PIXI.Spine('defaultSpine');
		//Spine.state.setAnimationByName('flying', true);
		stage.addChild(Spine);

		Spine.UpdateSetup = function() {
			this.state.clearAnimation();
			this.skeleton.setToSetupPose();
		}

		/*for(var i=0;i<100;i++) {
			Spine.state.currentTime = i/100;
			Spine.updateTransform();
		}
		Spine.stage.animationSpeed = 0;
		*/

		stage.addChild(makeBBDrawer(Spine));
		stage.addChild(makeBoneDrawer(Spine));
		//
		var xxxx = Spine;
		var scale = 1;
		//xxxx.scale.x = xxxx.scale.y = scale;
		xxxx.position.x = window.innerWidth / 4;
		xxxx.position.y = window.innerHeight / 4 + (450 * scale);

		var canvas = this.$el.getElementsByTagName('canvas')[0];
		console.log('canvas', canvas);
		var renderer = this.$options.renderer = new PIXI.autoDetectRenderer(100, 100, canvas, true, true);

		var getH = function(el) {
			var style = window.getComputedStyle(el, null);
			return parseFloat(style.getPropertyValue('height'));
		}
		var getW = function(el) {
			var style = window.getComputedStyle(el, null);
			return parseFloat(style.getPropertyValue('width'));
		}

		window.resizeAnimations = function(event) {
			var animHeight = getH(document.getElementById('animations'));
			var otherHeight = window.innerHeight - animHeight;
			that.otherHeight = otherHeight;
			Vue.nextTick(function() {
				renderer.resize(getW(canvas), getH(canvas));
			});
		}
		window.addEventListener('resize', resizeAnimations);
		Vue.nextTick(resizeAnimations);

		stage.scale.x = stage.scale.y = 0.1;

		requestAnimFrame(animate);
		function animate() {
			requestAnimFrame(animate);
			if (Spine) {
				var time = Spine.state.currentTime - (Spine.state.currentTime | 0);
				that.Time = time;
			}
			renderer.render(stage);
		}

		var assetsToLoader = [
			"data/dragonBones.json",
		"data/dragonBonesData.json"];
		var loader = new PIXI.AssetLoader(assetsToLoader);
		loader.onComplete = onAssetsLoaded
		loader.load();

		function onAssetsLoaded() {
			that.load(PIXI.AnimCache['data/dragonBonesData.json']);
		}
	}
};
