(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function Delete(id) {
	var obj;
	this.redo = function(map) {
		obj = map.objects.splice(id, 1);
	};
	this.undo = function(map) {
		var left = map.objects.slice(0, id),
			right = map.objects.slice(id);
		map.objects = [].concat(left, obj, right)
	};
}

function AddPrism(pos, size, color) {
	this.redo = function(map) {
		map.objects.push({
			type: 'prism',
			pos: pos || [0, 0, 0],
			size: size || [1, 1, 1],
			yaw: 0,
			color: color || [0, 0, 0, 0],
			modificators: [],
		});
	};
	this.undo = function(map) {
		map.objects.pop();
	};
}

function AddPyramid(pos, size, color) {
	this.redo = function(map) {
		map.objects.push({
			type: 'pyramid',
			pos: pos || [0, 0, 0],
			size: size || [1, 1, 1],
			yaw: 0,
			color: color || [0, 0, 0, 0],
			modificators: [],
		});
	};
	this.undo = function(map) {
		map.objects.pop();
	};
}

function AddCylinder(pos, size, vertices, color) {
	this.redo = function(map) {
		map.objects.push({
			type: 'cylinder',
			pos: pos || [0, 0, 0],
			size: size || [1, 1, 1],
			yaw: 0,
			vertices: vertices || 30,
			color: color || [0, 0, 0, 0],
			modificators: [],
		});
	};
	this.undo = function(map) {
		map.objects.pop();
	};
}

function AddPath(path, pos, size, color) {
	this.redo = function(map) {
		map.objects.push({
			type: 'path',
			path: path,
			pos: pos || [0, 0, 0],
			size: size || [1, 1, 1],
			yaw: 0,
			color: color || [0, 0, 0, 0],
			modificators: [],
		});
	};
	this.undo = function(map) {
		map.objects.pop();
	};
}

function AddShape(path, height, pos, size, color) {
	this.redo = function(map) {
		map.objects.push({
			type: 'shape',
			path: path,
			height: height,
			pos: pos || [0, 0, 0],
			size: size || [1, 1, 1],
			yaw: 0,
			color: color || [0, 0, 0, 0],
			modificators: [],
		});
	};
	this.undo = function(map) {
		map.objects.pop();
	};
}

function SetColor(id, color) {
	var old;
	this.redo = function(map) {
		var obj = map.objects[id];
		old = obj.color;
		obj.color = color;
	};
	this.undo = function(map) {
		var obj = map.objects[id];
		obj.color = old;
	};
}

function Resize(id, size, vertices) {
	var old, old_vertices;
	this.redo = function(map) {
		var obj = map.objects[id];
		if (obj.size !== undefined) {
			old = obj.size;
			obj.size = size;
		}
		if (obj.vertices !== undefined) {
			old_vertices = obj.vertices;
			obj.vertices = vertices;
		}
	};
	this.undo = function(map) {
		var obj = map.objects[id];
		if (obj.size !== undefined) {
			obj.size = old;
		}
		if (obj.vertices !== undefined) {
			obj.vertices = old_vertices;
		}
	};
}

function Rotate(id, yaw) {
	var old;
	this.redo = function(map) {
		var obj = map.objects[id];
		old = obj.yaw;
		obj.yaw = yaw;
	};
	this.undo = function(map) {
		var obj = map.objects[id];
		obj.yaw = old;
	};
}

function Move(id, pos) {
	var old;
	this.redo = function(map) {
		var obj = map.objects[id];
		old = obj.pos;
		obj.pos = pos;
	};
	this.undo = function(map) {
		map.objects[id].pos = old;
	};
}

module.exports = {
	Delete: Delete,
	AddPrism: AddPrism,
	AddPyramid: AddPyramid,
	AddCylinder: AddCylinder,
	AddPath: AddPath,
	AddShape: AddShape,

	SetColor: SetColor,
	Resize: Resize,
	Rotate: Rotate,
	Move: Move,
};

},{}],2:[function(require,module,exports){
'use strict';

console.log('start');

window.Isomer = require('isomer');

window.commands = require('./commands');
var Redactor = require('./redactor'),
	Map = require('./map'),
	w = $('#canvas').width(),
	h = $('#canvas').height(),
	stage = new PIXI.Stage(0xFFFFFF, true),
	renderer = PIXI.autoDetectRenderer(w, h);

$('#canvas').append(renderer.view);

window.iso = new Isomer(renderer.view);
iso.canvas = new PIXI.Graphics();
stage.addChild(iso.canvas);

iso.canvas.path_line = function(points) {
	this.moveTo(points[0].x, points[0].y);

	for (var i = 1; i < points.length; i++) {
		this.lineTo(points[i].x, points[i].y);
	}

	this.lineTo(points[0].x, points[0].y);
}

iso.canvas.path = function(points, color) {
	var c = color.r * 256 * 256 + color.g * 256 + color.b,
		graphics = this; // for moar speed
	graphics.beginFill(c, color.a).moveTo(points[0].x, points[0].y);
	for (var i = 1; i < points.length; i++) {
		graphics.lineTo(points[i].x, points[i].y);
	}
	// XXX hack for pixi v1.6.0
	if (points.length % 2) {
		graphics.lineTo(points[0].x, points[0].y);
	}
	graphics.endFill();
}

var originX = 0,
	originY = 0,
	moveSpeed = 30,
	keyCodes = {
	37: function(event) {
		originX += moveSpeed;
		resize();
	},
	38: function(event) {
		originY += moveSpeed;
		resize();
	},
	39: function(event) {
		originX -= moveSpeed;
		resize();
	},
	40: function(event) {
		originY -= moveSpeed;
		resize();
	},
}
document.onkeydown = function(event) {
	var f = keyCodes[event.keyCode];
	if (f) {
		event.preventDefault();
		f(event);
	}
}

window.onresize = resize;
resize();

function resize() {
	w = $('#canvas').width();
	h = $('#canvas').height();

	renderer.resize(w, h);
	//iso.canvas._width = w;
	//iso.canvas._height = h;
	iso.originX = w / 2 + originX;
	iso.originY = h * 0.9 + originY;
}

window.redactor = new Redactor(new Map(iso));

redactor.run(new commands.AddPrism([1, 0, 0], [4, 4, 2]));
redactor.run(new commands.AddPrism([0, 0, 0], [1, 4, 1]));
redactor.run(new commands.AddPrism([-1, 1, 0], [1, 2, 1]));

redactor.run(new commands.AddPyramid([2, 3, 3], [1, 1, 1]));
redactor.run(new commands.SetColor(redactor.map.objects.length - 1, [180, 180, 0, 0]));
redactor.run(new commands.Resize(redactor.map.objects.length - 1, [0.5, 0.5, 0.5]));

redactor.run(new commands.AddPyramid([4, 3, 3], [1, 1, 1]));
redactor.run(new commands.SetColor(redactor.map.objects.length - 1, [180, 0, 180, 0]));
redactor.run(new commands.Resize(redactor.map.objects.length - 1, [0.5, 0.5, 0.5]));

redactor.run(new commands.AddPyramid([4, 1, 3], [1, 1, 1]));
redactor.run(new commands.SetColor(redactor.map.objects.length - 1, [0, 180, 0, 0]));
redactor.run(new commands.Resize(redactor.map.objects.length - 1, [0.5, 0.5, 0.5]));

redactor.run(new commands.AddPyramid([2, 1, 3], [1, 1, 1]));
redactor.run(new commands.SetColor(redactor.map.objects.length - 1, [40, 180, 40, 0]));
redactor.run(new commands.Resize(redactor.map.objects.length - 1, [0.5, 0.5, 0.5]));

redactor.run(new commands.Delete(2));
redactor.run(new commands.Resize(1, [1, 3, 1]));
redactor.run(new commands.Rotate(1, 15));

redactor.run(new commands.AddCylinder([0, 2, 0], [1, 1, 2], 30));

redactor.run(new commands.AddPrism([0, 0, 0], [3, 3, 1]));
redactor.run(new commands.AddPath([
	[1, 1, 1],
	[2, 1, 1],
	[2, 2, 1],
	[1, 2, 1],
], [0, 0, 0], [1, 1, 1], [50, 160, 60, 0]));

redactor.run(new commands.AddShape([
	[1, 1, 1],
	[2, 1, 1],
	[2, 3, 1],
], 0.3, [0, 0, 0], [1, 1, 1], [50, 160, 60, 0]));

requestAnimFrame(animate);

function animate() {
	redactor.render();

	renderer.render(stage);
	requestAnimFrame(animate);
}

},{"./commands":1,"./map":3,"./redactor":4,"isomer":6}],3:[function(require,module,exports){
'use strict';

var Isomer = require('isomer');

function Map(iso) {
	this.iso = iso;
	this.objects = [];

	var mod = function(add, obj) {
		for (var i = 0, l = obj.modificators.length; i < l; i++) {
			var mod = obj.modificators[i],
				point = Isomer.Point.apply(null, mod.point);

			switch (mod.type) {
				case 'rotateZ':
					add = add.rotateZ(point, mod.yaw);
					break;
				case 'scale':
					add = add.scale(point, mod.x, mod.y, mod.z);
					break;
				case 'translate':
					add = add.translate(mod.x, mod.y, mod.z);
					break;
				default:
					console.warn('fail mod.type', mod);
			}
		}
		return add;
	};
	this._render_one = function(obj) {
		var add = null;

		switch (obj.type) {
			case 'prism':
				var pos = obj.pos;
				//add = Isomer.Shape.Prism(Isomer.Point.ORIGIN, obj.dx, obj.dy, obj.dz);
				add = Isomer.Shape.Prism(Isomer.Point.ORIGIN, 1, 1, 1);
				//add = add.translate(pos[0], pos[1], pos[2]);
				//add = add.scale(Isomer.Point.apply(null, pos), obj.dx, obj.dy, obj.dz);
				break;
			case 'pyramid':
				var pos = obj.pos;
				add = Isomer.Shape.Pyramid(Isomer.Point.ORIGIN, 1, 1, 1);
				//add = add.translate(pos[0], pos[1], pos[2]);
				//add = add.scale(Isomer.Point.apply(null, pos), obj.dx, obj.dy, obj.dz);
				break;
			case 'cylinder':
				var pos = obj.pos;
				add = Isomer.Shape.Cylinder(Isomer.Point.ORIGIN, 1, obj.vertices, 1);
				//add = add.translate(pos[0], pos[1], pos[2]);
				break;
			case 'path':
				add = new Isomer.Path(obj.path.map(function(el) {
					return Isomer.Point.apply(null, el);
				}));
				break;
			case 'shape':
				add = Isomer.Shape.extrude(new Isomer.Path(obj.path.map(function(el) {
					return Isomer.Point.apply(null, el);
				})), obj.height);
				break;
			default:
				console.warn('fail obj.type', obj);
		}
		if (obj.pos !== undefined) {
			var pos = obj.pos,
				point = Isomer.Point.apply(null, pos);
			add = add.translate(pos[0], pos[1], pos[2]);
			if (obj.size !== undefined) {
				add = add.scale(point, obj.size[0], obj.size[1], obj.size[2]);
			}
			if (obj.yaw !== undefined) {
				add = add.rotateZ(point, obj.yaw * (Math.PI / 180));
			}
		}

		return (add && mod(add, obj)) || null;
	}

	this.render = function() {
		for (var i = 0, l = this.objects.length; i < l; i++) {
			var obj = this.objects[i],
				add = this._render_one(obj),
				color = new Isomer.Color(obj.color[0], obj.color[1], obj.color[2], obj.color[3]);
			add && this.iso.add(add, color);
		}
	};
}

module.exports = Map;

},{"isomer":6}],4:[function(require,module,exports){
'use strict';

var commands = require('./commands'),
	saveAs = require('filesaver.js');

window.save = function() {
	var blob = new Blob(['Hello, world!'], {
		type: 'text/plain;charset=utf-8'
	});
	saveAs(blob, 'hello world.txt');
}

function Redactor(map) {
	this.commands = [];
	this.current = 0;
	this.map = map;
	this.active = -1;

	var that = this;

	this.render = function() {
		var iso = this.map.iso,
			ctx = iso.canvas;

		ctx.clear();
		ctx.lineStyle(1, 0xCCCCCC, 1);
		var gridSize = 10;
		for (var x = -gridSize; x <= gridSize; x++) {
			var s1 = this.map.iso._translatePoint(Isomer.Point(x, -gridSize, 0)),
				e1 = this.map.iso._translatePoint(Isomer.Point(x, +gridSize, 0)),
				s2 = this.map.iso._translatePoint(Isomer.Point(-gridSize, x, 0)),
				e2 = this.map.iso._translatePoint(Isomer.Point(+gridSize, x, 0));
			ctx.moveTo(s1.x, s1.y);
			ctx.lineTo(e1.x, e1.y);
			ctx.moveTo(s2.x, s2.y);
			ctx.lineTo(e2.x, e2.y);
		}

		x = 0

		var s1 = this.map.iso._translatePoint(Isomer.Point(x, -gridSize, 0)),
			e1 = this.map.iso._translatePoint(Isomer.Point(x, +gridSize, 0)),
			s2 = this.map.iso._translatePoint(Isomer.Point(-gridSize, x, 0)),
			e2 = this.map.iso._translatePoint(Isomer.Point(+gridSize, x, 0));
		ctx.lineStyle(1, 0x00CC00, 1);
		ctx.moveTo(s1.x, s1.y);
		ctx.lineTo(e1.x, e1.y);
		ctx.lineStyle(1, 0xCC0000, 1);
		ctx.moveTo(s2.x, s2.y);
		ctx.lineTo(e2.x, e2.y);

		ctx.lineStyle(0);
		this.map.render();

		ctx.lineStyle(3, 0xCC0000, 1);
		var obj = this.map.objects[this.active];
		if (obj) {
			var item = this.map._render_one(obj);
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
				var pos = this.map.iso._translatePoint(Isomer.Point.apply(null, obj.pos)),
					n = 4;
				ctx.moveTo(pos.x - n, pos.y - n);
				ctx.lineStyle(n * 2, 0x0000CC, 1);
				ctx.lineTo(pos.x - n, pos.y + n);
				ctx.lineTo(pos.x + n, pos.y + n);
				ctx.lineTo(pos.x + n, pos.y - n);
				ctx.lineTo(pos.x - n, pos.y - n);
			}
		}

		var s3 = this.map.iso._translatePoint(Isomer.Point(0, 0, -gridSize)),
			e3 = this.map.iso._translatePoint(Isomer.Point(0, 0, +gridSize));
		ctx.lineStyle(1, 0x0000CC, 1);
		ctx.moveTo(s3.x, s3.y);
		ctx.lineTo(e3.x, e3.y);
	}

	$.UIkit.notify({
		message: 'Hello Kitty!',
		status: 'info',
		timeout: 5000,
		pos: 'top-center'
	});

	this._initUI();

	var listClass = '#obj-list',
		$list = $(listClass);
	this.setActive = function(id) {
		console.info('setActive', id);
		this.active = id;
		$(listClass + ' li a').each(function(index, element) {
			var $el = $(element);
			// XXX hack
			if ($el.attr('id') != 'obj' + id) {
				$el.parent().removeClass('uk-active');
			} else {
				$el.parent().addClass('uk-active');
			}
		});

		var obj = that.map.objects[id];
		if (!obj) {
			// hide all
			$('#obj').text('Select any object');
			$('#pos').hide();
			$('#size').hide();
			$('#color').hide();
			$('#rotateZ').hide();
		} else {
			$('#obj').text('' + id + ' ' + obj.type);
			var c = obj.color,
				cc = new Isomer.Color(c[0], c[1], c[2], c[3]);
			that.Color.$data.color = cc.toHex();
			that.Color.$data.alpha = c[3];

			$('#rotateZ').show();
			$('#pos').show();
			$('#size').show();
			$('#color').show();

			that.Position.$data.x = obj.pos[0];
			that.Position.$data.y = obj.pos[1];
			that.Position.$data.z = obj.pos[2];
			that.Resize.$data.x = obj.size[0];
			that.Resize.$data.y = obj.size[1];
			that.Resize.$data.z = obj.size[2];
			that.Rotate.$data.yaw = obj.yaw;

			if (obj.type === 'cylinder') {
				$('#size #v').show();
				that.Resize.$data.v = obj.vertices;
			} else {
				$('#size #v').hide();
			}
		}
	};
	this.syncList = function() {
		$list.html('');
		for (var i = 0, l = that.map.objects.length; i < l; i++) {
			var obj = that.map.objects[i],
				// XXX hack
				a = $('<a id="obj' + i + '" href="#">' + i + ' ' + obj.type + '</a>');
			a.click(function() {
				var $this = $(this),
					// XXX hack
					id = $this.attr('id').slice(3) | 0
				that.setActive(id);
				console.info('click', id);
			});
			var li = $('<li></li>');
			$list.append(li.append(a));
		}
	};
	this.syncList();

	var msgSuccess = {
		pos: 'top-right',
		timeout: 150,
		status: 'success'
	},
	msgDanger = {
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

	this.run = function(command) {
		console.log('spliceX', this.current, this.commands.length - 1);
		if (this.current < this.commands.length - 1) {
			this.commands.splice(this.current);
			console.log('splice');
		}
		command.redo(this.map);
		this.commands.push(command);
		this.current++;
		$.UIkit.notify(command.constructor.name, msgSuccess);
		console.info('run', command.constructor.name)
		this.syncList();
		this.setActive(this.active);
	};

	this.undo = function(levels) {
		var count = 0;
		for (var i = 0; i < levels; i++) {
			if (this.current > 0) {
				this.commands[--this.current].undo(this.map);
				count++;
			}
		}
		console.info('undo ' + count + '(' + levels + ')');
		this.syncList();
		this.setActive(this.active);
		return count;
	};

	this.redo = function(levels) {
		var count = 0;
		for (var i = 0; i < levels; i++) {
			if (this.current < this.commands.length) {
				this.commands[this.current++].redo(this.map);
				count++;
			}
		}
		console.info('redo ' + count + '(' + levels + ')');
		this.syncList();
		this.setActive(this.active);
		return count;
	};
}

Redactor.prototype._initUI = function() {
	var that = this;

	$('#download').click(function() {
		var blob = new Blob([JSON.stringify({
			objects: that.map.objects
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
			that.map.objects = JSON.parse(e.target.result).objects;
		};
		reader.readAsDataURL(f);

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

	this.Color = new Vue({
		el: '#color',
		data: {
			color: '#000000',
			alpha: 0,
		},
		methods: {
			setColor: function(e) {
				var c = parseInt(this.$data.color.slice(1), 16),
					r = (c >> 16) & 0xff,
					g = (c >> 8) & 0xff,
					b = c & 0xff;
				that.run(new commands.SetColor(that.active, [r, g, b, +this.$data.alpha]));
			},
		},
	});

	this.Position = new Vue({
		el: '#pos',
		data: {
			x: 0,
			y: 0,
			z: 0,
		},
		methods: {
			move: function(e) {
				that.run(new commands.Move(
					that.active, [+this.$data.x, +this.$data.y, +this.$data.z]
				));
			},
		},
	});

	this.Resize = new Vue({
		el: '#size',
		data: {
			x: 0,
			y: 0,
			z: 0,
			v: 0,
		},
		methods: {
			resize: function(e) {
				that.run(new commands.Resize(
					that.active, [+this.$data.x, +this.$data.y, +this.$data.z], +this.$data.v
				));
			},
		},
	});

	this.Rotate = new Vue({
		el: '#rotateZ',
		data: {
			yaw: 0,
		},
		methods: {
			rotate: function(e) {
				that.run(new commands.Rotate(
					that.active, +this.$data.yaw
				));
			},
		},
	});

	new Vue({
		el: '#AddPrismModal',
		data: {
			x: 0,
			y: 0,
			z: 0,
			dx: 1,
			dy: 1,
			dz: 1,
		},
		methods: {
			add: function(e) {
				that.run(new commands.AddPrism(
					[+this.$data.x, +this.$data.y, +this.$data.z], [+this.$data.dx, +this.$data.dy, +this.$data.dz]
				));
			},
		},
	});

	new Vue({
		el: '#AddPyramidModal',
		data: {
			x: 0,
			y: 0,
			z: 0,
			dx: 1,
			dy: 1,
			dz: 1,
		},
		methods: {
			add: function(e) {
				that.run(new commands.AddPyramid(
					[+this.$data.x, +this.$data.y, +this.$data.z], [+this.$data.dx, +this.$data.dy, +this.$data.dz]
				));
			},
		},
	});

	new Vue({
		el: '#AddCylinderModal',
		data: {
			x: 0,
			y: 0,
			z: 0,
			dx: 1,
			dy: 1,
			dz: 1,
			vertices: 30,
		},
		methods: {
			add: function(e) {
				that.run(new commands.AddCylinder(
					[+this.$data.x, +this.$data.y, +this.$data.z], [+this.$data.dx, +this.$data.dy, +this.$data.dz], +this.$data.vertices
				));
			},
		},
	});

	new Vue({
		el: '#AddShapeModal',
		data: {
			height: 1,
			points: [
				{
					x: 0,
					y: 0,
					z: 0
			}],
		},
		methods: {
			add: function(e) {
				var path = [];
				for (var i = 0, l = this.$data.points.length; i < l; i++) {
					var p = this.$data.points[i];
					path.push([+p.x, +p.y, +p.z]);
				}
				that.run(new commands.AddShape(path, +this.$data.height));
			},
		},
	});

	new Vue({
		el: '#AddPathModal',
		data: {
			points: [
				{
					x: 0,
					y: 0,
					z: 0
			}],
		},
		methods: {
			add: function(e) {
				var path = [];
				for (var i = 0, l = this.$data.points.length; i < l; i++) {
					var p = this.$data.points[i];
					path.push([+p.x, +p.y, +p.z]);
				}
				that.run(new commands.AddPath(path));
			},
		},
	});
}

module.exports = Redactor;

},{"./commands":1,"filesaver.js":5}],5:[function(require,module,exports){
/* FileSaver.js
 *  A saveAs() FileSaver implementation.
 *  2014-05-27
 *
 *  By Eli Grey, http://eligrey.com
 *  License: X11/MIT
 *    See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs
  // IE 10+ (native saveAs)
  || (typeof navigator !== "undefined" &&
      navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))
  // Everyone else
  || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof navigator !== "undefined" &&
	    /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = !view.externalHost && "download" in save_link
		, click = function(node) {
			var event = doc.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, view, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			node.dispatchEvent(event);
		}
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		, deletion_queue = []
		, process_deletion_queue = function() {
			var i = deletion_queue.length;
			while (i--) {
				var file = deletion_queue[i];
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			}
			deletion_queue.length = 0; // clear queue
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, FileSaver = function(blob, name) {
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, get_object_url = function() {
					var object_url = get_URL().createObjectURL(blob);
					deletion_queue.push(object_url);
					return object_url;
				}
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_object_url(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
						window.open(object_url, "_blank");
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_object_url(blob);
				save_link.href = object_url;
				save_link.download = name;
				click(save_link);
				filesaver.readyState = filesaver.DONE;
				dispatch_all();
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									deletion_queue.push(file);
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name) {
			return new FileSaver(blob, name);
		}
	;
	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	view.addEventListener("unload", process_deletion_queue, false);
	saveAs.unload = function() {
		process_deletion_queue();
		view.removeEventListener("unload", process_deletion_queue, false);
	};
	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module !== null) {
  module.exports = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function() {
    return saveAs;
  });
}

},{}],6:[function(require,module,exports){
/**
 * Entry point for the Isomer API
 */
module.exports = require('./js/isomer');

},{"./js/isomer":9}],7:[function(require,module,exports){
function Canvas(elem) {
  this.elem = elem;
  this.ctx = this.elem.getContext('2d');

  this.width = elem.width;
  this.height = elem.height;
}

Canvas.prototype.clear = function () {
  this.ctx.clearRect(0, 0, this.width, this.height);
};

Canvas.prototype.path = function (points, color) {
  this.ctx.beginPath();
  this.ctx.moveTo(points[0].x, points[0].y);

  for (var i = 1; i < points.length; i++) {
    this.ctx.lineTo(points[i].x, points[i].y);
  }

  this.ctx.closePath();

  /* Set the strokeStyle and fillStyle */
  this.ctx.save()

  this.ctx.globalAlpha = color.a;
  this.ctx.fillStyle = this.ctx.strokeStyle = color.toHex();
  this.ctx.stroke();
  this.ctx.fill();
  this.ctx.restore();
};

module.exports = Canvas;

},{}],8:[function(require,module,exports){
/**
 * A color instantiated with RGB between 0-255
 *
 * Also holds HSL values
 */
function Color(r, g, b, a) {
  this.r = parseInt(r || 0);
  this.g = parseInt(g || 0);
  this.b = parseInt(b || 0);
  this.a = parseFloat((Math.round(a * 100) / 100 || 1));

  this.loadHSL();
};

Color.prototype.toHex = function () {
  // Pad with 0s
  var hex = (this.r * 256 * 256 + this.g * 256 + this.b).toString(16);

  if (hex.length < 6) {
    hex = new Array(6 - hex.length + 1).join('0') + hex;
  }

  return '#' + hex;
};


/**
 * Returns a lightened color based on a given percentage and an optional
 * light color
 */
Color.prototype.lighten = function (percentage, lightColor) {
  lightColor = lightColor || new Color(255, 255, 255);

  var newColor = new Color(
    (lightColor.r / 255) * this.r,
    (lightColor.g / 255) * this.g,
    (lightColor.b / 255) * this.b,
    this.a
  );

  newColor.l = Math.min(newColor.l + percentage, 1);

  newColor.loadRGB();
  return newColor;
};


/**
 * Loads HSL values using the current RGB values
 * Converted from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype.loadHSL = function () {
  var r = this.r / 255;
  var g = this.g / 255;
  var b = this.b / 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);

  var h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;  // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  this.h = h;
  this.s = s;
  this.l = l;
};


/**
 * Reloads RGB using HSL values
 * Converted from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype.loadRGB = function () {
  var r, g, b;
  var h = this.h;
  var s = this.s;
  var l = this.l;

  if (s === 0) {
    r = g = b = l;  // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = this._hue2rgb(p, q, h + 1/3);
    g = this._hue2rgb(p, q, h);
    b = this._hue2rgb(p, q, h - 1/3);
  }

  this.r = parseInt(r * 255);
  this.g = parseInt(g * 255);
  this.b = parseInt(b * 255);
};


/**
 * Helper function to convert hue to rgb
 * Taken from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype._hue2rgb = function (p, q, t){
  if(t < 0) t += 1;
  if(t > 1) t -= 1;
  if(t < 1/6) return p + (q - p) * 6 * t;
  if(t < 1/2) return q;
  if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
};

module.exports = Color;

},{}],9:[function(require,module,exports){
var Canvas = require('./canvas');
var Color = require('./color');
var Path = require('./path');
var Point = require('./point');
var Shape = require('./shape');
var Vector = require('./vector');


/**
 * The Isomer class
 *
 * This file contains the Isomer base definition
 */
function Isomer(canvasId, options) {
  options = options || {};

  this.canvas = new Canvas(canvasId);
  this.angle = Math.PI / 6;

  this.scale = options.scale || 70;

  this._calculateTransformation();

  this.originX = options.originX || this.canvas.width / 2;
  this.originY = options.originY || this.canvas.height * 0.9;

  /**
   * Light source as defined as the angle from
   * the object to the source.
   *
   * We'll define somewhat arbitrarily for now.
   */
  this.lightPosition = options.lightPosition || new Vector(2, -1, 3);
  this.lightAngle = this.lightPosition.normalize();

  /**
   * The maximum color difference from shading
   */
  this.colorDifference = 0.20;
  this.lightColor = options.lightColor || new Color(255, 255, 255);
}

/**
 * Sets the light position for drawing.
 */
Isomer.prototype.setLightPosition = function (x, y, z) {
  this.lightPosition = new Vector(x, y, z);
  this.lightAngle = this.lightPosition.normalize();
}

Isomer.prototype._translatePoint = function (point) {
  /**
   * X rides along the angle extended from the origin
   * Y rides perpendicular to this angle (in isometric view: PI - angle)
   * Z affects the y coordinate of the drawn point
   */
  var xMap = new Point(point.x * this.transformation[0][0],
                       point.x * this.transformation[0][1]);

  var yMap = new Point(point.y * this.transformation[1][0],
                       point.y * this.transformation[1][1]);

  var x = this.originX + xMap.x + yMap.x;
  var y = this.originY - xMap.y - yMap.y - (point.z * this.scale);
  return new Point(x, y);
};


/**
 * Adds a shape or path to the scene
 *
 * This method also accepts arrays
 */
Isomer.prototype.add = function (item, baseColor) {
  if (Object.prototype.toString.call(item) == '[object Array]') {
    for (var i = 0; i < item.length; i++) {
      this.add(item[i], baseColor);
    }
  } else if (item instanceof Path) {
    this._addPath(item, baseColor);
  } else if (item instanceof Shape) {
    /* Fetch paths ordered by distance to prevent overlaps */
    var paths = item.orderedPaths();
    for (var i in paths) {
      this._addPath(paths[i], baseColor);
    }
  }
};


/**
 * Adds a path to the scene
 */
Isomer.prototype._addPath = function (path, baseColor) {
  /* Default baseColor */
  baseColor = baseColor || new Color(120, 120, 120);

  /* Compute color */
  var v1 = Vector.fromTwoPoints(path.points[1], path.points[0]);
  var v2 = Vector.fromTwoPoints(path.points[2], path.points[1]);

  var normal = Vector.crossProduct(v1, v2).normalize();

  /**
   * Brightness is between -1 and 1 and is computed based
   * on the dot product between the light source vector and normal.
   */
  var brightness = Vector.dotProduct(normal, this.lightAngle);
  color = baseColor.lighten(brightness * this.colorDifference, this.lightColor);

  this.canvas.path(path.points.map(this._translatePoint.bind(this)), color);
};

/**
 * Precalculates transformation values based on the current angle and scale
 * which in theory reduces costly cos and sin calls
 */
Isomer.prototype._calculateTransformation = function () {
  this.transformation = [
    [
      this.scale * Math.cos(this.angle),
      this.scale * Math.sin(this.angle)
    ],
    [
      this.scale * Math.cos(Math.PI - this.angle),
      this.scale * Math.sin(Math.PI - this.angle)
    ]
  ];
}

/* Namespace our primitives */
Isomer.Canvas = Canvas;
Isomer.Color = Color;
Isomer.Path = Path;
Isomer.Point = Point;
Isomer.Shape = Shape;
Isomer.Vector = Vector;

/* Expose Isomer API */
module.exports = Isomer;

},{"./canvas":7,"./color":8,"./path":10,"./point":11,"./shape":12,"./vector":13}],10:[function(require,module,exports){
var Point = require('./point');

/**
 * Path utility class
 *
 * An Isomer.Path consists of a list of Isomer.Point's
 */
function Path(points) {
  if (Object.prototype.toString.call(points) === '[object Array]') {
    this.points = points;
  } else {
    this.points = Array.prototype.slice.call(arguments);
  }
}


/**
 * Pushes a point onto the end of the path
 */
Path.prototype.push = function (point) {
  this.points.push(point);
};


/**
 * Returns a new path with the points in reverse order
 */
Path.prototype.reverse = function () {
  var points = Array.prototype.slice.call(this.points);

  return new Path(points.reverse());
};


/**
 * Translates a given path
 *
 * Simply a forward to Point#translate
 */
Path.prototype.translate = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.translate.apply(point, args);
  }));
};


/**
 * Returns a new path rotated along the Z axis by a given origin
 *
 * Simply a forward to Point#rotateZ
 */
Path.prototype.rotateZ = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.rotateZ.apply(point, args);
  }));
};


/**
 * Scales a path about a given origin
 *
 * Simply a forward to Point#scale
 */
Path.prototype.scale = function () {
  var args = arguments;

  return new Path(this.points.map(function (point) {
    return point.scale.apply(point, args);
  }));
};


/**
 * The estimated depth of a path as defined by the average depth
 * of its points
 */
Path.prototype.depth = function () {
  var i, total = 0;
  for (i = 0; i < this.points.length; i++) {
    total += this.points[i].depth();
  }

  return total / (this.points.length || 1);
};


/**
 * Some paths to play with
 */

/**
 * A rectangle with the bottom-left corner in the origin
 */
Path.Rectangle = function (origin, width, height) {
  if (width === undefined) width = 1;
  if (height === undefined) height = 1;

  var path = new Path([
    origin,
    new Point(origin.x + width, origin.y, origin.z),
    new Point(origin.x + width, origin.y + height, origin.z),
    new Point(origin.x, origin.y + height, origin.z)
  ]);

  return path;
};


/**
 * A circle centered at origin with a given radius and number of vertices
 */
Path.Circle = function (origin, radius, vertices) {
  vertices = vertices || 20;
  var i, path = new Path();

  for (i = 0; i < vertices; i++) {
    path.push(new Point(
      radius * Math.cos(i * 2 * Math.PI / vertices),
      radius * Math.sin(i * 2 * Math.PI / vertices),
      0));
  }

  return path.translate(origin.x, origin.y, origin.z);
};


/**
 * A star centered at origin with a given outer radius, inner
 * radius, and number of points
 *
 * Buggy - concave polygons are difficult to draw with our method
 */
Path.Star = function (origin, outerRadius, innerRadius, points) {
  var i, r, path = new Path();

  for (i = 0; i < points * 2; i++) {
    r = (i % 2 === 0) ? outerRadius : innerRadius;

    path.push(new Point(
      r * Math.cos(i * Math.PI / points),
      r * Math.sin(i * Math.PI / points),
      0));
  }

  return path.translate(origin.x, origin.y, origin.z);
};


/* Expose the Path constructor */
module.exports = Path;

},{"./point":11}],11:[function(require,module,exports){
function Point(x, y, z) {
  if (this instanceof Point) {
    this.x = (typeof x === 'number') ? x : 0;
    this.y = (typeof y === 'number') ? y : 0;
    this.z = (typeof z === 'number') ? z : 0;
  } else {
    return new Point(x, y, z);
  }
}


Point.ORIGIN = new Point(0, 0, 0);


/**
 * Translate a point from a given dx, dy, and dz
 */
Point.prototype.translate = function (dx, dy, dz) {
  return new Point(
    this.x + dx,
    this.y + dy,
    this.z + dz);
};


/**
 * Scale a point about a given origin
 */
Point.prototype.scale = function (origin, dx, dy, dz) {
  var p = this.translate(-origin.x, -origin.y, -origin.z);

  if (dy === undefined && dz === undefined) {
    /* If both dy and dz are left out, scale all coordinates equally */
    dy = dz = dx;
    /* If just dz is missing, set it equal to 1 */
  } else {
    dz = (typeof dz === 'number') ? dz : 1;
  }

  p.x *= dx;
  p.y *= dy;
  p.z *= dz;

  return p.translate(origin.x, origin.y, origin.z);
};


/**
 * Rotate about origin on the Z axis
 */
Point.prototype.rotateZ = function (origin, angle) {
  var p = this.translate(-origin.x, -origin.y, -origin.z);

  var x = p.x * Math.cos(angle) - p.y * Math.sin(angle);
  var y = p.x * Math.sin(angle) + p.y * Math.cos(angle);
  p.x = x;
  p.y = y;

  return p.translate(origin.x, origin.y, origin.z);
};


/**
 * The depth of a point in the isometric plane
 */
Point.prototype.depth = function () {
  /* z is weighted slightly to accomodate |_ arrangements */
    return this.x + this.y - 2*this.z;
};


/**
 * Distance between two points
 */
Point.distance = function (p1, p2) {
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  var dz = p2.z - p1.z;

  return Math.sqrt(dx*dx + dy*dy + dz*dz);
};


module.exports = Point;

},{}],12:[function(require,module,exports){
var Path = require('./path');
var Point = require('./point');

/**
 * Shape utility class
 *
 * An Isomer.Shape consists of a list of Isomer.Path's
 */
function Shape(paths) {
  if (Object.prototype.toString.call(paths) === '[object Array]') {
    this.paths = paths;
  } else {
    this.paths = Array.prototype.slice.call(arguments);
  }
}


/**
 * Pushes a path onto the end of the Shape
 */
Shape.prototype.push = function (path) {
  this.paths.push(path);
};


/**
 * Translates a given shape
 *
 * Simply a forward to Path#translate
 */
Shape.prototype.translate = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.translate.apply(path, args);
  }));
};


/**
 * Rotates a given shape along the Z axis around a given origin
 *
 * Simply a forward to Path#rotateZ
 */
Shape.prototype.rotateZ = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.rotateZ.apply(path, args);
  }));
};


/**
 * Scales a path about a given origin
 *
 * Simply a forward to Point#scale
 */
Shape.prototype.scale = function () {
  var args = arguments;

  return new Shape(this.paths.map(function (path) {
    return path.scale.apply(path, args);
  }));
};


/**
 * Produces a list of the shape's paths ordered by distance to
 * prevent overlaps when drawing
 */
Shape.prototype.orderedPaths = function () {
  var paths = this.paths.slice();

  /**
   * Sort the list of faces by distance then map the entries, returning
   * only the path and not the added "further point" from earlier.
   */
  return paths.sort(function (pathA, pathB) {
    return pathB.depth() - pathA.depth();
  });
};


/**
 * Utility function to create a 3D object by raising a 2D path
 * along the z-axis
 */
Shape.extrude = function (path, height) {
  height = (typeof height === 'number') ? height : 1;

  var i, topPath = path.translate(0, 0, height);
  var shape = new Shape();

  /* Push the top and bottom faces, top face must be oriented correctly */
  shape.push(path.reverse());
  shape.push(topPath);

  /* Push each side face */
  for (i = 0; i < path.points.length; i++) {
    shape.push(new Path([
      topPath.points[i],
      path.points[i],
      path.points[(i + 1) % path.points.length],
      topPath.points[(i + 1) % topPath.points.length]
    ]));
  }

  return shape;
};


/**
 * Some shapes to play with
 */

/**
 * A prism located at origin with dimensions dx, dy, dz
 */
Shape.Prism = function (origin, dx, dy, dz) {
  dx = (typeof dx === 'number') ? dx : 1;
  dy = (typeof dy === 'number') ? dy : 1;
  dz = (typeof dz === 'number') ? dz : 1;

  /* The shape we will return */
  var prism = new Shape();

  /* Squares parallel to the x-axis */
  var face1 = new Path([
    origin,
    new Point(origin.x + dx, origin.y, origin.z),
    new Point(origin.x + dx, origin.y, origin.z + dz),
    new Point(origin.x, origin.y, origin.z + dz)
  ]);

  /* Push this face and its opposite */
  prism.push(face1);
  prism.push(face1.reverse().translate(0, dy, 0));

  /* Square parallel to the y-axis */
  var face2 = new Path([
    origin,
    new Point(origin.x, origin.y, origin.z + dz),
    new Point(origin.x, origin.y + dy, origin.z + dz),
    new Point(origin.x, origin.y + dy, origin.z)
  ]);
  prism.push(face2);
  prism.push(face2.reverse().translate(dx, 0, 0));

  /* Square parallel to the xy-plane */
  var face3 = new Path([
    origin,
    new Point(origin.x + dx, origin.y, origin.z),
    new Point(origin.x + dx, origin.y + dy, origin.z),
    new Point(origin.x, origin.y + dy, origin.z)
  ]);
  /* This surface is oriented backwards, so we need to reverse the points */
  prism.push(face3.reverse());
  prism.push(face3.translate(0, 0, dz));

  return prism;
};


Shape.Pyramid = function (origin, dx, dy, dz) {
  dx = (typeof dx === 'number') ? dx : 1;
  dy = (typeof dy === 'number') ? dy : 1;
  dz = (typeof dz === 'number') ? dz : 1;

  var pyramid = new Shape();

  /* Path parallel to the x-axis */
  var face1 = new Path([
    origin,
    new Point(origin.x + dx, origin.y, origin.z),
    new Point(origin.x + dx / 2, origin.y + dy / 2, origin.z + dz)
  ]);
  /* Push the face, and its opposite face, by rotating around the Z-axis */
  pyramid.push(face1);
  pyramid.push(face1.rotateZ(origin.translate(dx/2, dy/2), Math.PI));

  /* Path parallel to the y-axis */
  var face2 = new Path([
    origin,
    new Point(origin.x + dx / 2, origin.y + dy / 2, origin.z + dz),
    new Point(origin.x, origin.y + dy, origin.z)
  ]);
  pyramid.push(face2);
  pyramid.push(face2.rotateZ(origin.translate(dx/2, dy/2), Math.PI));

  return pyramid;
};


Shape.Cylinder = function (origin, radius, vertices, height) {
  radius = (typeof radius === 'number') ? radius : 1;

  var circle = Path.Circle(origin, radius, vertices);
  var cylinder = Shape.extrude(circle, height);

  return cylinder;
};


module.exports = Shape;

},{"./path":10,"./point":11}],13:[function(require,module,exports){
function Vector(i, j, k) {
  this.i = (typeof i === 'number') ? i : 0;
  this.j = (typeof j === 'number') ? j : 0;
  this.k = (typeof k === 'number') ? k : 0;
}

/**
 * Alternate constructor
 */
Vector.fromTwoPoints = function (p1, p2) {
  return new Vector(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
};

Vector.crossProduct = function (v1, v2) {
  var i = v1.j * v2.k - v2.j * v1.k;
  var j = -1 * (v1.i * v2.k - v2.i * v1.k);
  var k = v1.i * v2.j - v2.i * v1.j;

  return new Vector(i, j, k);
};

Vector.dotProduct = function (v1, v2) {
  return v1.i * v2.i + v1.j * v2.j + v1.k * v2.k;
};

Vector.prototype.magnitude = function () {
  return Math.sqrt(this.i*this.i + this.j*this.j + this.k*this.k);
};

Vector.prototype.normalize = function () {
  var magnitude = this.magnitude();
  return new Vector(this.i / magnitude, this.j / magnitude, this.k / magnitude);
};

module.exports = Vector;

},{}]},{},[2])