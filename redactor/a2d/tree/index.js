'use strict';
require('less').render(require('./style.css'), function(e, css) {
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
	},
	methods: {
		alert: function(v, event) {
			event.preventDefault();
			alert(v);
		},
		select: function(type, name) {
			console.log('select[%s] %s', type, name);
			this.$parent.selected.type = type;
			this.$parent.selected.name = name;
			this.$parent.Bones;
		},
	},
	components: {
		dir: require('./dir'),
		animations: require('./animations'),
		bones: require('./bones'),
		images: require('./images'),
		draw_order: require('./draw_order'),
		events: require('./events'),
		skins: require('./skins'),
	},
	computed: {
	},
	created: function() {
		console.log('created Skeleton tree');

		this.$on('drag', function(model) {
			console.log('drag [%s]%s', model.type, model.name);
		});
		this.$on('drop', function(model, type, name, $index) {
			console.log('drop [%s]%s to [%s]%s', type, name, model.type, model.name);
		});

		this.dirty;
	},
}
