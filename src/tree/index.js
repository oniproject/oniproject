require('insert-css')(require('./style.css'))

var Vue = require('vue')

Vue.component('animation', {
	template: require('./animation.html'),
	data: {}
})
Vue.component('animations', {
	template: require('./animations.html'),
	data: {open: false}
})
Vue.component('bone', {
	template: require('./bone.html'),
	data: {open: false}
})
Vue.component('bounding_box', {
	template: require('./bounding_box.html'),
	data: {}
})
Vue.component('draw_order', {
	template: require('./draw_order.html'),
	data: {open: false}
})
Vue.component('event', {
	template: require('./event.html'),
	data: {}
})
Vue.component('events', {
	template: require('./events.html'),
	data: {open: false}
})
Vue.component('image', {
	template: require('./image.html'),
	data: {}
})
Vue.component('images', {
	template: require('./images.html'),
	data: {open: false}
})
Vue.component('placeholder', {
	template: require('./placeholder.html'),
	data: {open: false}
})
Vue.component('skeleton', {
	template: require('./skeleton.html'),
	data: {open: true}
})
Vue.component('skin', {
	template: require('./skin.html'),
	data: {}
})
Vue.component('skins', {
	template: require('./skins.html'),
	data: {open: false}
})
Vue.component('slot', {
	template: require('./slot.html'),
	data: {open: false}
})

module.exports = {
	id: 'tree',
	template: require('./template.html'),
	data: {
		msg: 'I am component A!',
		treeData: {
			name: 'xxx skeleton',
			children: [
				{type:'bone', name: 'root', children:[
					{type:'bone', name: 'hip', children:[
						{type: 'slot', name: 'vfds', children:[
							{type: 'placeholder', name: 'vfds', children:[
								{type: 'image', name: 'vfds'},
							]},
							{type: 'bounding_box', name: 'vfds'},
						]},
					]}
				]},
				{type:'draw_order', children:[
					{type: 'slot', name: 'vfds'},
					{type: 'slot', name: 'vfds'},
					{type: 'slot', name: 'vfds'},
					{type: 'slot', name: 'vfds'},
				]},
				{type:'images', children:[
					{type: 'image', name: 'vfds'},
					{type: 'image', name: 'vfds'},
					{type: 'image', name: 'vfds'},
					{type: 'image', name: 'vfds'},
					{type: 'image', name: 'vfds'},
					{type: 'image', name: 'vfds'},
				]},
				{type:'skins', children:[
					{type: 'skin', name: 'vfds'},
					{type: 'skin', name: 'vfds'},
					{type: 'skin', name: 'vfds'},
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
