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
