'use strict';
require('less').render(require('./style.css'), function (e, css) {
	require('insert-css')(css)
});

module.exports = {
	id: 'tools',
	template: require('./template.html'),
	data: {
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
	},
	computed: {
		// selected
		rotation: {
			$get: function() {
				if(this.$parent.selected.type === 'bone') {
					var Spine = this.$parent.$get('Spine');
					return Spine.skeleton.findBone(this.$parent.selected.name).data.rotation;
				}
				return NaN;
			},
			$set: function(val) {
				if(this.$parent.selected.type === 'bone') {
					var Spine = this.$parent.$get('Spine');
					Spine.skeleton.findBone(this.$parent.selected.name).data.rotation = +val;
					Spine.skeleton.setToSetupPose();
					console.info('$set rotation', this.$parent.selected.name, val);
				}
			},
		},
		translateX: {
			$get: function() {
				if(this.$parent.selected.type === 'bone') {
					var Spine = this.$parent.$get('Spine');
					return Spine.skeleton.findBone(this.$parent.selected.name).data.x;
				}
				return NaN;
			},
			$set: function(val) {
				if(this.$parent.selected.type === 'bone') {
					var Spine = this.$parent.$get('Spine');
					Spine.skeleton.findBone(this.$parent.selected.name).data.x = +val;
					Spine.skeleton.setToSetupPose();
					console.info('$set translateX', this.$parent.selected.name, val);
				}
			},
		},
		translateY: {
			$get: function() {
				if(this.$parent.selected.type === 'bone') {
					var Spine = this.$get('Spine');
					return Spine.skeleton.findBone(this.$parent.selected.name).data.y;
				}
				return NaN;
			},
			$set: function(val) {
				if(this.$parent.selected.type === 'bone') {
					var Spine = this.$get('Spine');
					Spine.skeleton.findBone(this.$parent.selected.name).data.y = +val;
					Spine.skeleton.setToSetupPose();
					console.info('$set translateY', this.$parent.selected.name, val);
				}
			},
		},
		scaleX: {
			$get: function() {
				if(this.$parent.selected.type === 'bone') {
					var Spine = this.$get('Spine');
					return Spine.skeleton.findBone(this.$parent.selected.name).data.scaleX;
				}
				return NaN;
			},
			$set: function(val) {
				if(this.$parent.selected.type === 'bone') {
					var Spine = this.$get('Spine');
					Spine.skeleton.findBone(this.$parent.selected.name).data.scaleX = +val;
					Spine.skeleton.setToSetupPose();
					console.info('$set scaleX', this.$parent.selected.name, val);
				}
			},
		},
		scaleY: {
			$get: function() {
				if(this.$parent.selected.type === 'bone') {
					var Spine = this.$get('Spine');
					return Spine.skeleton.findBone(this.$parent.selected.name).data.scaleY;
				}
				return NaN;
			},
			$set: function(val) {
				if(this.$parent.selected.type === 'bone') {
					var Spine = this.$get('Spine');
					Spine.skeleton.findBone(this.$parent.selected.name).data.scaleY = +val;
					Spine.skeleton.setToSetupPose();
					console.info('$set scaleY', this.$parent.selected.name, val);
				}
			},
		},
	},
}
