'use strict';
require('less').render(require('./style.css'), function (e, css) {
	require('insert-css')(css)
});

function swap(xs, index1, index2) {
	var temp = xs[index1];
	xs.$set(index1, xs[index2]);
	xs.$set(index2, temp);
}

module.exports = {
	id: 'tree',
	template: require('./template.html'),
	data: {
		msg: 'I am component tree!',
		dirty: true,
		show: {
			bones: true,
			slots: true,
			attachments: true,
		},
		skeleton: {
			type: 'skeleton',
			children: [
				{type:'bone', name: 'root', children:[]},
				{type:'draw_order', children:[]},
				{type:'images', children:[]},
				{type:'skins', children:[]},
				{type:'animations', children:[]},
				{type:'events', children:[]},
			]
		},
	},
	methods: {
		alert: function(v, event) {
			event.preventDefault();
			alert(v);
		},
		updateTree: function() {
			Vue.nextTick((function(){
				this.dirty = !this.dirty;
			}).bind(this))
		},
		select: function(type, name) {
			console.log('select[%s] %s', type, name);
			this.$parent.selected.type = type;
			this.$parent.selected.name = name;
			this.$parent.$data.Bones;
		},
	},
	components: {
		dir: require('./dir'),
		skeleton: {
			replace: true,
			template: require('./dir.html'),
			data: {open: true}
		},
	},
	computed: {
		root: {
			$get: function() { return this.skeleton.children[0]; },
			$set: function(val) { this.skeleton.children[0] = val; },
		},
		draw_order: {
			$get: function() { return this.skeleton.children[1].children; },
			$set: function(val) { this.skeleton.children[1].children = val; },
		},
		images: function() { return this.skeleton.children[2].children; },
		skins: function() { return this.skeleton.children[3].children; },
		animations: function() { return this.skeleton.children[4].children; },
		events: function() { return this.skeleton.children[5].children; },
	},
	created: function() {
		console.log('created Skeleton tree');
		this.$on('updateTree', (function() {
			console.log('updateTree');
			this.dirty = !this.dirty;
		}).bind(this));
		this.$watch('skeleton', function() {

		});

		this.$on('drag',  function(model) {
			console.log('drag [%s]%s', model.type, model.name);
		});
		this.$on('drop', function(model, type, name, $index) {
			console.log('drop [%s]%s to [%s]%s', type, name, model.type, model.name);
		});

		this.dirty;

		var root = null;
		var bone_map = {};

		// bones
		var bones = this.$parent.Bones;
		for(var i=0, l=bones.length; i<l;i++) {
			var _bone = bones[i];
			var bone = {type: 'bone', name: _bone.name, visibility: true, draggable: true};
			bone_map[bone.name] = bone;

			if(!_bone.parent) {
				this.root = bone;
			} else {
				var parent = bone_map[_bone.parent];
				if(!parent.children) {
					parent.children = [];
				}
				parent.children.push(bone);
			}
		}

		// draw order
		var drawOrder = this.$parent.Slots;

		for(var i=0, l=drawOrder.length; i<l;i++) {
			var _slot = drawOrder[i];
			var slot = {type: 'slot', name: _slot.name, visibility: true, children:[]};
			this.draw_order.push(slot);

			for(var j=0, ll=_slot.attachments.length; j<ll;j++) {
				var a = _slot.attachments[j];
				slot.children.push({type: 'region', name: a.name, draggable: true});
			}

			var parent = bone_map[_slot.bone];
			if(!parent.children) {
				parent.children = [];
			}
			// insert at start
			parent.children.splice(0,0, slot);
		}
		this.draw_order = this.draw_order.reverse();

		// images
		var attachments = this.$parent.Attachments;
		for(var i=0, l=attachments.length; i<l; i++) {
			var image = attachments[i];
			this.images.push({type: 'image', name: image.name, draggable: true});
		}

		// skins
		var skins = this.$parent.Skins;
		for(var i=0, l=skins.length; i<l; i++) {
			var skin = skins[i];
			this.skins.push({type: 'skin', name: skin.name, visibility: true, draggable: true});
		}

		// animations
		var animations = this.$parent.Animations;
		for(var i=0, l=animations.length; i<l;i++) {
			var animation = animations[i];
			this.animations.push({type: 'animation', name: animation.name, draggable: true});
		}

		// events
		for(var i=0; i<5; i++) {
			this.events.push({
				type: 'event',
				name: 'vfds ' + i,
				keyframe: 'danger',
				visibility:true,
				draggable: true
			});
		}
	},
}
