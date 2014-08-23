'use strict';
require('insert-css')(require('./style.css'))

var Vue = require('vue')


module.exports = {
	id: 'tree',
	template: require('./template.html'),
	components: {
		animation: {
			template: require('./item.html'),
		},
		animations: {
			template: require('./dir.html'),
			data: {open: false}
		},
		bone: {
			template: require('./dir.html'),
			data: {open: false}
		},
		bounding_box: {
			template: require('./item.html'),
		},
		draw_order: {
			template: require('./dir.html'),
			data: {open: false}
		},
		event: {
			template: require('./item.html'),
		},
		events: {
			template: require('./dir.html'),
			data: {open: false}
		},
		region: {
			template: require('./item.html'),
		},
		image: {
			template: require('./item.html'),
		},
		images: {
			template: require('./dir.html'),
			data: {open: false}
		},
		skin_placeholder: {
			template: require('./dir.html'),
			data: {open: false}
		},
		skeleton: {
			template: require('./dir.html'),
			data: {open: true}
		},
		skin: {
			template: require('./item.html'),
		},
		skins: {
			template: require('./dir.html'),
			data: {open: false}
		},
		slot: {
			template: require('./dir.html'),
			data: {open: false}
		},
	},
	computed: {
		Skeleton: function() {
			var Spine = this.$parent.$get('Spine');
			var spineData = Spine.spineData;
			var drawOrder = Spine.skeleton.drawOrder;
			var obj = {type:'skeleton', name: '', visiblity: true,children:[]};
			var root = null;
			var bone_map = {};

			// bones
			for(var i=0, l=spineData.bones.length; i<l;i++) {
				var _bone = spineData.bones[i];
				var bone = {type: 'bone', name: _bone.name, visiblity: true};
				bone_map[bone.name] = bone;

				if(_bone.parent === null) {
					root = bone;
				} else {
					var parent = bone_map[_bone.parent.name];
					if(!parent.children) {
						parent.children = [];
					}
					parent.children.push(bone);
				}
			}
			if(root) {
				obj.children.push(root);
			}

			var draw_order = {type:'draw_order', children:[]};
			obj.children.push(draw_order);

			for(var i=0, l=drawOrder.length; i<l;i++) {
				var _slot = drawOrder[i];
				var slotX = {type: 'slot', name: _slot.data.name, visiblity: true};
				var slotY = {type: 'slot', name: _slot.data.name, visiblity: true, children:[]};
				draw_order.children.push(slotX);

				// TODO find in animations
				for(var k in _slot.sprites) {
					if(_slot.sprites.hasOwnProperty(k)) {
						slotY.children.push({type: 'region', name: k});
					}
				}

				var parent = bone_map[_slot.bone.data.name];
				if(!parent.children) {
					parent.children = [];
				}
				// insert at start
				parent.children.splice(0,0, slotY);
			}
			draw_order.children = draw_order.children.reverse();

			var animations = {type:'animations', children:[]};
			obj.children.push(animations);
			for(var i=0, l=spineData.animations.length; i<l;i++) {
				var animation = spineData.animations[i];
				animations.children.push({type: 'animation', name: animation.name});
			}
			animations.children = animations.children.reverse();
			return obj;
		},
	},
	data: {
		msg: 'I am component tree!',
		treeData: {
			type:'skeleton', name: 'xxx skeleton', visiblity: true,
			children: [
				{type:'bone', name: 'root', visiblity: true, children:[
					{type:'bone', name: 'hip', visiblity: true, children:[
						{type: 'slot', name: 'vfds', visiblity: true, children:[
							{type: 'skin_placeholder', name: 'vfds', visiblity: true, children:[
								{type: 'region', visiblity: true, name: 'vfds'},
							]},
							{type: 'bounding_box', name: 'vfds'},
						]},
					]}
				]},
				{type:'draw_order', children:[
					{type: 'slot', name: 'vfds', visiblity: true},
					{type: 'slot', name: 'vfds', visiblity: true},
					{type: 'slot', name: 'vfds', visiblity: true},
					{type: 'slot', name: 'vfds', visiblity: true},
				]},
				{type:'images', children:[
					{type: 'image', name: 'vfds'},
					{type: 'image', name: 'vfds'},
					{type: 'image', name: 'vfds'},
					{type: 'image', name: 'vfds'},
				]},
				{type:'skins', children:[
					{type: 'skin', name: 'vfds', visiblity: true},
					{type: 'skin', name: 'vfds', visiblity: true},
					{type: 'skin', name: 'vfds', visiblity: true},
				]},
				{type:'animations', children:[
					{type: 'animation', name: 'vfds'},
					{type: 'animation', name: 'vfds'},
					{type: 'animation', name: 'vfds'},
				]},
				{type:'events', children:[
					{type: 'event', name: 'vfds'},
					{type: 'event', name: 'vfds'},
					{type: 'event', name: 'vfds'},
					{type: 'event', name: 'vfds'},
				]},
			]
		}
	}
}
