module.exports = {
	replace: true,
	template: require('./dir.html'),
	data: {open: false, rename: false},
	methods: {
		swapStuff: function(index1, index2) {
			//console.log('swap %s -> %s', index1, index2, this.$parent);
			//swap(this.$parent.$data.children, +index1, +index2);
		},
	},
	created: function() {
		console.log('created', this.$index, this.model.type, this.model.name);
		var vm = this;
		var start = function(event) { // this / e.target is the source node.
			event.dataTransfer.setData('$index', vm.$index);
			event.dataTransfer.setData('type', vm.model.type);
			event.dataTransfer.setData('name', vm.model.name);
			event.dataTransfer.dropEffect = 'copy';
			vm.$dispatch('drag', vm.model);
			event.stopPropagation();
		}
		var over = function(event) {
			if (event.preventDefault) {
				event.preventDefault(); // Necessary. Allows us to drop.
			}
			event.dataTransfer.dropeffect = 'copy';
			return false;
		}
		var enter = function(event) { // this / e.target is the current hover target.
			event.target.classList.add('over');
		}
		var leave = function(event) { // this / e.target is previous target element.
			event.target.classList.remove('over');
		}
		var drop = function(event) {
			event.preventDefault && event.preventDefault();
			event.stopPropagation();
			event.target.classList.remove('over');
			event.target.opacity = '0.4';
			var $index = event.dataTransfer.getData('$index');
			var type = event.dataTransfer.getData('type');
			var name = event.dataTransfer.getData('name');

			vm.$dispatch('drop', vm.model, type, name, $index);
			vm.swapStuff($index, vm.$index);
		}

		if (this.model.draggable) {
			this.$el.setAttribute('draggable', 'true');
		}

		this.$el.addEventListener('dragstart', start, false);
		this.$el.addEventListener('dragenter', enter, false);
		this.$el.addEventListener('dragover', over, false);
		this.$el.addEventListener('dragleave', leave, false);
		this.$el.addEventListener('drop', drop, false);
	},
};

