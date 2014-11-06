'use strict';

module.exports = {
	replace: true,
	template: require('./dir.html'),
	data: {
		open: false,
		rename: false,
		model: {
			type: 'events',
			children: [],
			gen: true
		},
	},
	computed: {
		children: function() {
			var events = [];
			for (var i = 0; i < 5; i++) {
				events.push({
					type: 'event',
					name: 'vfds ' + i,
					keyframe: 'danger',
					visibility: true,
					draggable: true
				});
			}
			return events;
		},
	},
}
