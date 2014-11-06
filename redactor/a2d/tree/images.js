'use strict';

// TODO get current skin

module.exports = {
	replace: true,
	template: require('./dir.html'),
	data: {
		open: false,
		rename: false,
		model: {
			type: 'images',
			children: [],
			gen: true
		},
	},
	computed: {
		children: function() {
			var Spine = this.$parent.$parent.$options.Spine;

			var attachments = [];
			// TODO get current skin
			var skin = Spine.skeleton.data.defaultSkin;
			for (var k in skin.attachments) {
				if (skin.attachments.hasOwnProperty(k)) {
					var a = skin.attachments[k];
					attachments.push({
						type: 'image',
						name: a.rendererObject.name,
						draggable: true,
					});
				}
			}
			return attachments;
		},
	},
}
