'use strict';

module.exports = {
	replace: true,
	template: require('./dir.html'),
	data: {
		open: false,
		rename: false,
		model: {type: 'draw_order', children: [], gen: true},
	},
	computed: {
		children: function() {
			var Spine = this.$parent.$parent.$options.Spine;
			this.$parent.show.attachments;

			var slots = [];
			for(var i=0, l=Spine.skeleton.drawOrder.length; i<l;i++) {
				var slot = Spine.skeleton.drawOrder[i];
				var s = {
					type: 'slot',
					visibility: true,
					name: slot.data.name,
					bone: slot.bone.data.name,
					color: {r: slot.r, g: slot.g, b: slot.b, a: slot.a},
					//attachments: [],
				};
				slots.push(s);
				// TODO find in animations ?
				if(this.$parent.show.attachments) {
					s.children = [];
					for(var k in slot.sprites) {
						if(slot.sprites.hasOwnProperty(k)) {
							s.children.push({
								name: k,
								type: 'region',
								visible: slot.sprites[k].visible
							});
						}
					}
				}
			}
			return slots;
		},
	},
}
