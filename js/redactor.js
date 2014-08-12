'use strict';

var commands = require('./commands');
var saveAs = require('filesaver.js');

window.save = function() {
	var blob = new Blob(['Hello, world!'], {type: 'text/plain;charset=utf-8'});
	saveAs(blob, 'hello world.txt');
}

function Redactor(map) {
	this.commands = [];
	this.current = 0;
	this.map = map;
	this.active = -1;

	var that = this;

	this.render = function() {
		var iso = this.map.iso;

		var ctx = iso.canvas;
		ctx.clear();
		ctx.lineStyle(1, 0xCCCCCC, 1);
		var gridSize = 10;
		for(var x=-gridSize; x<=gridSize; x++) {
				var s1 = this.map.iso._translatePoint(Isomer.Point(x, -gridSize, 0));
				var e1 = this.map.iso._translatePoint(Isomer.Point(x, +gridSize, 0));
				var s2 = this.map.iso._translatePoint(Isomer.Point(-gridSize, x, 0));
				var e2 = this.map.iso._translatePoint(Isomer.Point(+gridSize, x, 0));
				ctx.moveTo(s1.x, s1.y);
				ctx.lineTo(e1.x, e1.y);
				ctx.moveTo(s2.x, s2.y);
				ctx.lineTo(e2.x, e2.y);
		}

		x=0

		var s1 = this.map.iso._translatePoint(Isomer.Point(x, -gridSize, 0));
		var e1 = this.map.iso._translatePoint(Isomer.Point(x, +gridSize, 0));
		var s2 = this.map.iso._translatePoint(Isomer.Point(-gridSize, x, 0));
		var e2 = this.map.iso._translatePoint(Isomer.Point(+gridSize, x, 0));
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
		if(obj) {
			var item = this.map._render_one(obj);
			if (item instanceof Isomer.Shape) {
				var paths = item.orderedPaths();
				for (var i in paths) {
					ctx.path_line(paths[i].points.map(iso._translatePoint.bind(iso)));
				}
			}
			if (item instanceof Isomer.Path) {
				ctx.path_line(item.points.map(iso._translatePoint.bind(iso)));
			}

			if(obj.pos) {
				var pos = this.map.iso._translatePoint(Isomer.Point.apply(null, obj.pos));
				var n = 4;
				ctx.moveTo(pos.x-n, pos.y-n);
				ctx.lineStyle(n*2, 0x0000CC, 1);
				ctx.lineTo(pos.x-n, pos.y+n);
				ctx.lineTo(pos.x+n, pos.y+n);
				ctx.lineTo(pos.x+n, pos.y-n);
				ctx.lineTo(pos.x-n, pos.y-n);
			}
		}

		var s3 = this.map.iso._translatePoint(Isomer.Point(0,0, -gridSize));
		var e3 = this.map.iso._translatePoint(Isomer.Point(0,0, +gridSize));
		ctx.lineStyle(1, 0x0000CC, 1);
		ctx.moveTo(s3.x, s3.y);
		ctx.lineTo(e3.x, e3.y);
	}

	// FIXME add Backbone or other for UI and move all to other files

	$.UIkit.notify({
		message : 'Hello Kitty!',
		status  : 'info',
		timeout : 5000,
		pos     : 'top-center'
	});

	this._initUI();

	var list_class = '#obj-list';
	var $list = $(list_class);
	this.set_active = function(id) {
		console.info('set_active', id);
		this.active = id;
		$(list_class+' li a').each(function(index, element){
			var $el = $(element);
			// XXX hack
			if($el.attr('id') != 'obj' + id) {
				$el.parent().removeClass('uk-active');
			} else {
				$el.parent().addClass('uk-active');
			}
		});

		var obj = that.map.objects[id];
		if(!obj) {
			// hide all
			$('#obj').text('Select any object');
			$('#pos').hide();
			$('#size').hide();
			$('#color').hide();
			$('#rotateZ').hide();
		} else {
			$('#obj').text(''+id+' '+obj.type);
			var c = obj.color;
			var cc = new Isomer.Color(c[0], c[1], c[2], c[3]);
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

			if(obj.type === 'cylinder') {
				$('#size #v').show();
				that.Resize.$data.v = obj.vertices;
			} else {
				$('#size #v').hide();
			}
		}
	};
	this.sync_list = function() {
		$list.html('');
		for(var i=0, l=that.map.objects.length; i<l; i++) {
			var obj = that.map.objects[i];
			// XXX hack
			var a = $('<a id="obj'+i+'" href="#">'+ i +' '+ obj.type +'</a>');
			a.click(function(){
				var $this = $(this);
				// XXX hack
				var id = $this.attr('id').slice(3) |0
				that.set_active(id);
				console.info('click', id);
			});
			var li = $('<li></li>');
			$list.append(li.append(a));
		}
	};
	this.sync_list();

	var msg_success = {pos:'top-right', timeout:150, status:'success'};
	var msg_danger  = {pos:'top-right', timeout:150, status:'danger'};
	$('#undo').click(function(event) {
		event.preventDefault();
		if(that.undo(1)) {
			$.UIkit.notify('undo', msg_success);
		} else {
			$.UIkit.notify('undo empty', msg_danger);
		}
	});
	$('#redo').click(function(event) {
		event.preventDefault();
		if(that.redo(1)) {
			$.UIkit.notify('redo', msg_success);
		} else {
			$.UIkit.notify('redo empty', msg_danger);
		}
	});

	this.run = function(command) {
		console.log('spliceX', this.current, this.commands.length -1);
		if (this.current < this.commands.length-1) {
			this.commands.splice(this.current);
			console.log('splice');
		}
		command.redo(this.map);
		this.commands.push(command);
		this.current++;
		$.UIkit.notify(command.constructor.name, msg_success);
		console.info('run', command.constructor.name)
		this.sync_list();
		this.set_active(this.active);
	};

	this.undo = function(levels) {
		var count=0;
		for (var i=0; i < levels; i++) {
			if (this.current > 0) {
				this.commands[--this.current].undo(this.map);
				count++;
			}
		}
		console.info('undo '+ count +'('+ levels +')');
		this.sync_list();
		this.set_active(this.active);
		return count;
	};

	this.redo = function(levels) {
		var count=0;
		for (var i=0; i<levels; i++) {
			if (this.current < this.commands.length) {
				this.commands[this.current++].redo(this.map);
				count++;
			}
		}
		console.info('redo '+ count +'('+ levels +')');
		this.sync_list();
		this.set_active(this.active);
		return count;
	};
}

Redactor.prototype._initUI = function() {
	var that = this;

	$('#download').click(function() {
		var blob = new Blob([JSON.stringify({objects:that.map.objects})], {type: 'text/json;charset=utf-8'});
		saveAs(blob, 'map.json');
	});

	function handleFileSelect(event) {
		event.stopPropagation();
		event.preventDefault();

		var files = event.dataTransfer.files;

		var f = files[0];
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
			x:0, y:0, z:0,
		},
		methods: {
			move: function(e) {
				that.run(new commands.Move(
					that.active,
					[+this.$data.x, +this.$data.y, +this.$data.z]
				));
			},
		},
	});

	this.Resize = new Vue({
		el: '#size',
		data: {
			x:0, y:0, z:0,
			v:0,
		},
		methods: {
			resize: function(e) {
				that.run(new commands.Resize(
					that.active,
					[+this.$data.x, +this.$data.y, +this.$data.z],
					+this.$data.v
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
					that.active,
					+this.$data.yaw
				));
			},
		},
	});

	new Vue({
		el: '#AddPrismModal',
		data: {
			x:0, y:0, z:0,
			dx:1, dy:1, dz:1,
		},
		methods: {
			add: function(e) {
				that.run(new commands.AddPrism(
					[+this.$data.x, +this.$data.y, +this.$data.z],
					[+this.$data.dx, +this.$data.dy, +this.$data.dz]
				));
			},
		},
	});

	new Vue({
		el: '#AddPyramidModal',
		data: {
			x:0, y:0, z:0,
			dx:1, dy:1, dz:1,
		},
		methods: {
			add: function(e) {
				that.run(new commands.AddPyramid(
					[+this.$data.x, +this.$data.y, +this.$data.z],
					[+this.$data.dx, +this.$data.dy, +this.$data.dz]
				));
			},
		},
	});

	new Vue({
		el: '#AddCylinderModal',
		data: {
			x:0, y:0, z:0,
			dx:1, dy:1, dz:1,
			vertices: 30,
		},
		methods: {
			add: function(e) {
				that.run(new commands.AddCylinder(
					[+this.$data.x, +this.$data.y, +this.$data.z],
					[+this.$data.dx, +this.$data.dy, +this.$data.dz],
					+this.$data.vertices
				));
			},
		},
	});


	new Vue({
		el: '#AddShapeModal',
		data: {
			height: 1,
			points: [{x:0, y:0, z:0}],
		},
		methods: {
			add: function(e) {
				var path=[];
				for(var i=0,l=this.$data.points.length;i<l;i++) {
					var p=this.$data.points[i];
					path.push([+p.x, +p.y, +p.z]);
				}
				that.run(new commands.AddShape(path, +this.$data.height));
			},
		},
	});

	new Vue({
		el: '#AddPathModal',
		data: {
			points: [{x:0, y:0, z:0}],
		},
		methods: {
			add: function(e) {
				var path=[];
				for(var i=0,l=this.$data.points.length;i<l;i++) {
					var p=this.$data.points[i];
					path.push([+p.x, +p.y, +p.z]);
				}
				that.run(new commands.AddPath(path));
			},
		},
	});
}

module.exports = Redactor;
