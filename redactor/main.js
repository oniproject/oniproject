var Vue = require('vue');

Vue.directive('phimg', require('vue-placeholders/src/vue-placeholders-image'))
Vue.directive('phtxt', require('vue-placeholders/src/vue-placeholders-text'))

Vue.component('Home', {
	template: '<br><br>HOME'
})
Vue.component('Page1', {
	template: '<br><br>PAGE1'
})
Vue.component('Map', require('./map'))
Vue.component('Animation', require('./a2d'))

new Vue({
	el: 'html',
	data: {
		apps: ['Home', 'Page1', 'Map', 'Animation'],
		currentApp: 'Animation',
	},
	methods: {
		changeApp: function(id) {
			this.currentApp = id;
			if (this.currentApp == 'Map') {
				Vue.nextTick((function() {
					this.$[this.currentApp].$emit('load', '/data/map.json');
				}).bind(this));
			}
		},
		undo: function() {
			console.log('undo', this.jjjjjjjjjj);
			this.$[this.currentApp].$emit('undo', 1);
		},
		redo: function() {
			console.log('redo', this.currentApp);
			this.$[this.currentApp].$emit('redo', 1);
		},
	},
})
