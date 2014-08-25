'use strict';
require('less').render(require('./style.css'), function (e, css) {
	require('insert-css')(css)
});

module.exports = {
	id: 'animations',
	template: require('./template.html'),
	data: {
		msg: 'I am component Animations!'
	},
	methods: {
		setCurve: function(curve) {
			this.$broadcast('updateCurve', curve);
		},
	},
	components: {
		head: {template: require('./head.html')},
		ds_head: {template: require('./ds_head.html')},
		graph: require('./graph'),
		player: {template: require('./player.html')},
	},
	computed: {
		AnimationList: function() {
			var Spine = this.$parent.$get('Spine');
			var getCurve = function(curves, i) {
				//var type = curves.type[i];
				var type;

				var t = curves.curves[i*6];
				if(t !== undefined) {
					if(t == -1) type='stepped';
					else type = 'bezier';
					if(t == 0) type = 'linear';
				}

				var c = curves._curves[i];
				if(!c) c=[0.5, 0.5, 0.5, 0.5];
				return {
					type: type,
					cx1: c[0], cy1: c[1],
					cx2: c[2], cy2: c[3],
				};
			}

			// TODO choise anim by name
			var animList = Spine.skeleton.data.animations[0];
			var animations = [];
			for(var i=0, l=animList.timelines.length; i<l; i++) {
				var timeline = animList.timelines[i];
				if(timeline instanceof PIXI.Spine.spine.RotateTimeline) {
					var t = {type:'rotate',
						bone: Spine.skeleton.bones[timeline.boneIndex].data.name, frames:[]};
					animations.push(t);

					for(var j=0, ll=timeline.getFrameCount(); j<ll; j++) {
						var curve = getCurve(timeline.curves, j);
						t.frames.push({
							curve: curve,
							type: curve.type,
							time: timeline.frames[j*2],
							angle: timeline.frames[j*2+1],
						});
					}

					/*
						this.curves = new spine.Curves(frameCount);
						this.frames = []; // time, angle, ...
						this.frames.length = frameCount * 2;
						boneIndex: 0,
						*/
				}
				if(timeline instanceof PIXI.Spine.spine.TranslateTimeline) {
					var t = {type:'translate',
						bone: Spine.skeleton.bones[timeline.boneIndex].data.name, frames:[]};
					animations.push(t);

					for(var j=0, ll=timeline.getFrameCount(); j<ll; j++) {
						t.frames.push({
							curve: timeline.curves[j],
							time: timeline.frames[j*3],
							x: timeline.frames[j*3+1],
							y: timeline.frames[j*3+2],
						});
					}
					/*
						this.curves = new spine.Curves(frameCount);
						this.frames = []; // time, x, y, ...
						this.frames.length = frameCount * 3;
						boneIndex: 0,
						*/
				}
				if(timeline instanceof PIXI.Spine.spine.ScaleTimeline) {
					var t = {type:'scale',
						bone: Spine.skeleton.bones[timeline.boneIndex].data.name, frames:[]};
					animations.push(t);

					for(var j=0, ll=timeline.getFrameCount(); j<ll; j++) {
						t.frames.push({
							curve: timeline.curves[j],
							time: timeline.frames[j*3],
							x: timeline.frames[j*3+1],
							y: timeline.frames[j*3+2],
						});
					}
					/*
						this.curves = new spine.Curves(frameCount);
						this.frames = []; // time, x, y, ...
						this.frames.length = frameCount * 3;
						boneIndex: 0,
						*/
				}
				if(timeline instanceof PIXI.Spine.spine.ColorTimeline) {
					var t = {type:'color',
						slot: Spine.skeleton.slots[timeline.slotIndex].data.name, frames:[]};
					animations.push(t);

					for(var j=0, ll=timeline.getFrameCount(); j<ll; j++) {
						t.frames.push({
							curve: timeline.curves[j],
							time: timeline.frames[j*5],
							r: timeline.frames[j*5+1],
							g: timeline.frames[j*5+2],
							b: timeline.frames[j*5+3],
							a: timeline.frames[j*5+4],
						});
					}
					/*
						this.curves = new spine.Curves(frameCount);
						this.frames = []; // time, r, g, b, a, ...
						this.frames.length = frameCount * 5;
						slotIndex: 0,
						*/
				}
				if(timeline instanceof PIXI.Spine.spine.AttachmentTimeline) {
					var t = {type:'attachment',
						slot: Spine.skeleton.slots[timeline.slotIndex].data.name, frames:[]};
					animations.push(t);

					for(var j=0, ll=timeline.getFrameCount(); j<ll; j++) {
						t.frames.push({
							curve: timeline.curves[j],
							time: timeline.frames[j],
							name: timeline.attachmentNames[j],
						});
					}
					/*
						this.curves = new spine.Curves(frameCount);
						this.frames = []; // time, ...
						this.frames.length = frameCount;
						this.attachmentNames = []; // time, ...
						this.attachmentNames.length = frameCount;
						slotIndex: 0,
						*/
				}
			}
			return animations;
		},
	},
}
