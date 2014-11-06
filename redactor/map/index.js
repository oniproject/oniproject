'use strict';

var Vue = require('vue'),
	Isomer = require('isomer'),
	saveAs = require('filesaver.js'),
	commands = require('./commands'),
	Map = require('../../js/map');

console.log('start');


//var app = new Vue({
module.exports = {
	//el: '#Redactor',
	template: require('./app.html'),
	data: {
		active: -1,
		origin: {
			x: 0,
			y: 0
		},
		current: 0,
		commands: [],
	},
	iso: null,
	renderer: null,
	map: null,
	stage: null,
	computed: {
		originX: {
			$get: function() {
				return this.origin.x;
			},
			$set: function(val) {
				this.origin.x = val; this.resize();
			}
		},
		originY: {
			$get: function() {
				return this.origin.y;
			},
			$set: function(val) {
				this.origin.y = val; this.resize();
			}
		},
	},
	components: {
		objList: require('./obj-list'),
		Tools: require('./tools'),
		prism: require('./modals/prism'),
		pyramid: require('./modals/pyramid'),
		cylinder: require('./modals/cylinder'),
		shape: require('./modals/shape'),
		path: require('./modals/path'),
	},
	methods: {
		render: function() {
			var iso = this.$options.iso,
				ctx = iso.canvas;

			ctx.clear();
			ctx.lineStyle(1, 0xCCCCCC, 1);
			var gridSize = 10;
			for (var x = -gridSize; x <= gridSize; x++) {
				var s1 = iso._translatePoint(Isomer.Point(x, -gridSize, 0)),
					e1 = iso._translatePoint(Isomer.Point(x, +gridSize, 0)),
					s2 = iso._translatePoint(Isomer.Point(-gridSize, x, 0)),
					e2 = iso._translatePoint(Isomer.Point(+gridSize, x, 0));
				ctx.moveTo(s1.x, s1.y);
				ctx.lineTo(e1.x, e1.y);
				ctx.moveTo(s2.x, s2.y);
				ctx.lineTo(e2.x, e2.y);
			}

			x = 0;

			var s1 = iso._translatePoint(Isomer.Point(x, -gridSize, 0)),
				e1 = iso._translatePoint(Isomer.Point(x, +gridSize, 0)),
				s2 = iso._translatePoint(Isomer.Point(-gridSize, x, 0)),
				e2 = iso._translatePoint(Isomer.Point(+gridSize, x, 0));
			ctx.lineStyle(1, 0x00CC00, 1);
			ctx.moveTo(s1.x, s1.y);
			ctx.lineTo(e1.x, e1.y);
			ctx.lineStyle(1, 0xCC0000, 1);
			ctx.moveTo(s2.x, s2.y);
			ctx.lineTo(e2.x, e2.y);

			ctx.lineStyle(0);
			this.$options.map.render();

			ctx.lineStyle(3, 0xCC0000, 1);
			var obj = this.$options.map.objects[this.active];
			if (obj) {
				var item = this.$options.map._render_one(obj);
				if (item instanceof Isomer.Shape) {
					var paths = item.orderedPaths();
					for (var i in paths) {
						ctx.pathLine(paths[i].points.map(iso._translatePoint.bind(iso)));
					}
				}
				if (item instanceof Isomer.Path) {
					ctx.pathLine(item.points.map(iso._translatePoint.bind(iso)));
				}

				if (obj.pos) {
					var pos = iso._translatePoint(Isomer.Point.apply(null, obj.pos)),
						n = 4;
					ctx.moveTo(pos.x - n, pos.y - n);
					ctx.lineStyle(n * 2, 0x0000CC, 1);
					ctx.lineTo(pos.x - n, pos.y + n);
					ctx.lineTo(pos.x + n, pos.y + n);
					ctx.lineTo(pos.x + n, pos.y - n);
					ctx.lineTo(pos.x - n, pos.y - n);
				}
			}

			var s3 = iso._translatePoint(Isomer.Point(0, 0, -gridSize)),
				e3 = iso._translatePoint(Isomer.Point(0, 0, +gridSize));
			ctx.lineStyle(1, 0x0000CC, 1);
			ctx.moveTo(s3.x, s3.y);
			ctx.lineTo(e3.x, e3.y);
		},
		resize: function() {
			var w = $('#canvas').width(),
				h = $('#canvas').height();
			this.$options.renderer.resize(w, h);
			this.$options.iso.originX = w / 2 + this.originX;
			this.$options.iso.originY = h * 0.9 + this.originY;
		},
		run: function(command) {
			if (this.current < this.commands.length - 1) {
				this.commands.splice(this.current);
				console.log('splice');
			}
			command.redo(this.$options.map);
			this.commands.push(command);
			this.current++;
			console.info('run', command.constructor.name);
			this.syncList();
			this.setActive(this.active);
		},
		syncList: function() {
			if (this.$.objList) {
				this.$.objList.list = this.$options.map.objects;
			}
		},
		undo: function(levels) {
			var count = 0;
			for (var i = 0; i < levels; i++) {
				if (this.current > 0) {
					this.commands[--this.current].undo(this.$options.map);
					count++;
				}
			}
			console.info('undo ' + count + '(' + levels + ')');
			this.syncList();
			this.setActive(this.active);
			return count;
		},
		redo: function(levels) {
			var count = 0;
			for (var i = 0; i < levels; i++) {
				if (this.current < this.commands.length) {
					this.commands[this.current++].redo(this.$options.map);
					count++;
				}
			}
			console.info('redo ' + count + '(' + levels + ')');
			this.syncList();
			this.setActive(this.active);
			return count;
		},
		setActive: function(id) {
			this.active = id;

			var obj = this.$options.map.objects[id];
			if (!obj) {
				// hide all
				this.$.Tools.text = 'Select any object';
				this.$.Tools.isPos = this.$.Tools.isRotate = this.$.Tools.isSize = this.$.Tools.isColor = false
			} else {
				this.$.Tools.text = '' + id + ' ' + obj.type;
				var c = obj.color,
					cc = new Isomer.Color(c[0], c[1], c[2], c[3]);
				this.$.Tools.color = cc.toHex();
				this.$.Tools.alpha = c[3];

				this.$.Tools.isPos = this.$.Tools.isRotate = this.$.Tools.isSize = this.$.Tools.isColor = true

				this.$.Tools.pos.x = obj.pos[0];
				this.$.Tools.pos.y = obj.pos[1];
				this.$.Tools.pos.z = obj.pos[2];
				this.$.Tools.size.x = obj.size[0];
				this.$.Tools.size.y = obj.size[1];
				this.$.Tools.size.z = obj.size[2];
				this.$.Tools.z = obj.yaw;

				if (obj.type === 'cylinder') {
					this.$.Tools.isVertices = true
					this.$.Tools.size.v = obj.vertices;
				} else {
					this.$.Tools.isVertices = false
				}
			}
		},
		load: function(url) {
			console.log('load start');
			var r = new XMLHttpRequest();
			r.open('GET', url, true);
			var that = this;
			r.onreadystatechange = function() {
				if (r.readyState != 4 || r.status != 200) {
					return;
				}
				var json = JSON.parse(r.responseText);
				console.log('load end', json);
				that.$options.map.objects = json.objects;
				that.syncList();
			};
			r.send();
		},
	},
	attached: function() {
		Vue.nextTick(this.resize.bind(this));
	},
	created: function() {
		this.$on('undo', this.undo);
		this.$on('redo', this.redo);
		this.$on('load', this.load);

		var stage = this.$options.stage = new PIXI.Stage(0xFFFFFF, true);
		var renderer = this.$options.renderer = PIXI.autoDetectRenderer(1, 1, this.$el.getElementsByTagName('canvas')[0], true, true);

		var iso = this.$options.iso = new Isomer(renderer.view);
		iso.canvas = new PIXI.Graphics();
		stage.addChild(iso.canvas);

		iso.canvas.path_line = iso.canvas.pathLine = function(points) {
			this.moveTo(points[0].x, points[0].y);
			for (var i = 1; i < points.length; i++) {
				this.lineTo(points[i].x, points[i].y);
			}
			this.lineTo(points[0].x, points[0].y);
		}

		iso.canvas.path = function(points, color) {
			var c = color.r * 256 * 256 + color.g * 256 + color.b;
			this.beginFill(c, color.a).moveTo(points[0].x, points[0].y);
			for (var i = 1; i < points.length; i++) {
				this.lineTo(points[i].x, points[i].y);
			}
			// XXX hack for pixi v1.6.0
			if (points.length % 2) {
				this.lineTo(points[0].x, points[0].y);
			}
			this.endFill();
		}

		var map = this.$options.map = new Map(iso);

		_initUI(this);

		// test map
		/*Vue.nextTick((function() {
			this.resize();
			this.run(new commands.AddPrism([1, 0, 0], [4, 4, 2]));
			this.run(new commands.AddPrism([0, 0, 0], [1, 4, 1]));
			this.run(new commands.AddPrism([-1, 1, 0], [1, 2, 1]));

			this.run(new commands.AddPyramid([2, 3, 3], [1, 1, 1]));
			this.run(new commands.SetColor(map.objects.length - 1, [180, 180, 0, 0]));
			this.run(new commands.Resize(map.objects.length - 1, [0.5, 0.5, 0.5]));

			this.run(new commands.AddPyramid([4, 3, 3], [1, 1, 1]));
			this.run(new commands.SetColor(map.objects.length - 1, [180, 0, 180, 0]));
			this.run(new commands.Resize(map.objects.length - 1, [0.5, 0.5, 0.5]));

			this.run(new commands.AddPyramid([4, 1, 3], [1, 1, 1]));
			this.run(new commands.SetColor(map.objects.length - 1, [0, 180, 0, 0]));
			this.run(new commands.Resize(map.objects.length - 1, [0.5, 0.5, 0.5]));

			this.run(new commands.AddPyramid([2, 1, 3], [1, 1, 1]));
			this.run(new commands.SetColor(map.objects.length - 1, [40, 180, 40, 0]));
			this.run(new commands.Resize(map.objects.length - 1, [0.5, 0.5, 0.5]));

			this.run(new commands.Delete(2));
			this.run(new commands.Resize(1, [1, 3, 1]));
			this.run(new commands.Rotate(1, 15));

			this.run(new commands.AddCylinder([0, 2, 0], [1, 1, 2], 30));

			this.run(new commands.AddPrism([0, 0, 0], [3, 3, 1]));
			this.run(new commands.AddPath([
				[1, 1, 1],
				[2, 1, 1],
				[2, 2, 1],
				[1, 2, 1],
			], [0, 0, 0], [1, 1, 1], [50, 160, 60, 0]));

			this.run(new commands.AddShape([
				[1, 1, 1],
				[2, 1, 1],
				[2, 3, 1],
			], 0.3, [0, 0, 0], [1, 1, 1], [50, 160, 60, 0]));
		}).bind(this))*/
	},
} //);


function _initUI(that) {
	/*
	var msgSuccess = {
		pos: 'top-right',
		timeout: 150,
		status: 'success'
	};
	var msgDanger = {
		pos: 'top-right',
		timeout: 150,
		status: 'danger'
	};
	$('#undo').click(function(event) {
		event.preventDefault();
		if (that.undo(1)) {
			$.UIkit.notify('undo', msgSuccess);
		} else {
			$.UIkit.notify('undo empty', msgDanger);
		}
	});
	$('#redo').click(function(event) {
		event.preventDefault();
		if (that.redo(1)) {
			$.UIkit.notify('redo', msgSuccess);
		} else {
			$.UIkit.notify('redo empty', msgDanger);
		}
	});

	$('#download').click(function() {
		var blob = new Blob([JSON.stringify({
			objects: that.$options.map.objects
		})], {
			type: 'text/json;charset=utf-8'
		});
		saveAs(blob, 'map.json');
	});

	function handleFileSelect(event) {
		event.stopPropagation();
		event.preventDefault();

		var files = event.dataTransfer.files,
			f = files[0];
		console.log(f.name, f.size, f.lastModifiedDate);

		var reader = new FileReader();
		reader.onload = function(e) {
			that.$options.map.objects = JSON.parse(e.target.result).objects;
		};
		reader.readAsText(f);

		$('#UploadModal a.uk-close').click();
	}

	function handleDragOver(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
		$('#upload-drop').addClass('uk-dragover');
	}

	function handleDragLeave(event) {
		$('#upload-drop').removeClass('uk-dragover');
	}

	// Setup the dnd listeners.
	var dropZone = document.getElementById('upload-drop');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('dragleave', handleDragLeave, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
	*/

	var app = that;

	var originX = 0,
		originY = 0,
		moveSpeed = 30,
		keyCodes = {
			37: function(event) {
				app.originX += moveSpeed;
			},
			38: function(event) {
				app.originY += moveSpeed;
			},
			39: function(event) {
				app.originX -= moveSpeed;
			},
			40: function(event) {
				app.originY -= moveSpeed;
			},
		}
	document.onkeydown = function(event) {
		var f = keyCodes[event.keyCode];
		if (f) {
			event.preventDefault();
			f(event);
		}
	}
	window.onresize = app.resize.bind(app);
	app.resize();


	function animate() {
		app.render();
		app.$options.renderer.render(app.$options.stage);
		requestAnimFrame(animate);
	}
	requestAnimFrame(animate);
}
