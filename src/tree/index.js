require('insert-css')(require('./style.css'))

var Vue = require('vue')

Vue.component('animation', {
	template: require('./item.html'),
	data: {}
})
Vue.component('animations', {
	template: require('./dir.html'),
	data: {open: false}
})
Vue.component('bone', {
	template: require('./dir.html'),
	data: {open: false}
})
Vue.component('bounding_box', {
	template: require('./item.html'),
	data: {}
})
Vue.component('draw_order', {
	template: require('./dir.html'),
	data: {open: false}
})
Vue.component('event', {
	template: require('./item.html'),
	data: {}
})
Vue.component('events', {
	template: require('./dir.html'),
	data: {open: false}
})
Vue.component('region', {
	template: require('./item.html'),
	data: {}
})
Vue.component('image', {
	template: require('./item.html'),
	data: {}
})
Vue.component('images', {
	template: require('./dir.html'),
	data: {open: false}
})
Vue.component('skin_placeholder', {
	template: require('./dir.html'),
	data: {open: false}
})
Vue.component('skeleton', {
	template: require('./dir.html'),
	data: {open: true}
})
Vue.component('skin', {
	template: require('./item.html'),
	data: {}
})
Vue.component('skins', {
	template: require('./dir.html'),
	data: {open: false}
})
Vue.component('slot', {
	template: require('./dir.html'),
	data: {open: false}
})

module.exports = {
	id: 'tree',
	template: require('./template.html'),
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
