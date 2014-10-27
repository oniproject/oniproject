'use strict';

module.exports = {
	replace: true,
	template: require('./dir.html'),
	data: {
		open: false,
		rename: false,
		model: {
			type: 'animations',
			children: [],
			gen: true
		},
	},
	computed: {
		children: function() {
			var Spine = this.$parent.$parent.$options.Spine;
			var animations = [];
			for (var i = 0, l = Spine.skeleton.data.animations.length; i < l; i++) {
				var a = Spine.skeleton.data.animations[i];
				// TODO parse timelines
				animations.push({
					type: 'animation',
					name: a.name,
					draggable: true
				});
			}
			return animations;
		},
	},
}
