'use strict';

module.exports = {
	replace: true,
	template: require('./dir.html'),
	data: {
		open: false,
		rename: false,
		model: {type: 'bone', name: 'root', children: [], gen: true},
	},
	computed: {
		children: function() {
			var Spine = this.$parent.$parent.$options.Spine;

			this.$parent.show.slots;
			this.$parent.show.attachments;

			if(!this.$parent.show.bones) {
				return [];
			}

			var bone_map = {};
			var root = null;
			for(var i=0, l=Spine.skeleton.bones.length; i<l;i++) {
				var bone = Spine.skeleton.bones[i];
				var b = {
					name: bone.data.name,
					type: 'bone',
					visibility: true,
					draggable: true,
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
				};
				bone_map[b.name] = b;

				if(b.parent == '') {
					this.model.name = b.name;
					root = b;
				} else {
					var parent = bone_map[b.parent];
					if(!parent.children) {
						parent.children = [];
					}
					parent.children.push(b);
				}
			}

			if(this.$parent.show.slots) {
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

					var parent = bone_map[s.bone];
					if(!parent.children) {
						parent.children = [];
					}
					// insert at start
					parent.children.splice(0,0, s);
				}
			}

			return root? root.children: [];
		},
	},
}
