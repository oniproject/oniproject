'use strict';

module.exports = {
	replace: true,
	template: require('./dir.html'),
	data: {
		open: false,
		rename: false,
		model: {
			type: 'skins',
			children: [],
			gen: true
		},
	},
	computed: {
		children: function() {
			var Spine = this.$parent.$parent.$options.Spine;

			var skins = [];
			for (var i = 0, l = Spine.skeleton.data.skins.length; i < l; i++) {
				var skin = Spine.skeleton.data.skins[i];
				//if(skin.name !== 'default') {
				skins.push({
					name: skin.name,
					type: 'skin',
					visibility: true,
					//draggable: true
				});
				//}
			}
			return skins;

			var skins = this.$parent.Skins;
			for (var i = 0, l = skins.length; i < l; i++) {
				var skin = skins[i];
				this.skins.push({
					type: 'skin',
					name: skin.name,
					visibility: true,
					draggable: true
				});
			}

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
