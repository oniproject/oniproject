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
			var cc = new Isomer.Color(c[0], c[1], c[2], c[3])
			$('#color #hex-color').val(cc.toHex());
			$('#color #alpha').val(c[3]);

			$('#rotateZ').show();
			$('#pos').show();
			$('#size').show();
			$('#color').show();

			$('#pos #x').val(obj.pos[0]);
			$('#pos #y').val(obj.pos[1]);
			$('#pos #z').val(obj.pos[2]);
			$('#size #x').val(obj.size[0]);
			$('#size #y').val(obj.size[1]);
			$('#size #z').val(obj.size[2]);
			$('#rotateZ #yaw').val(obj.yaw);
			switch(obj.type) {
			case 'pyramid':
			case 'prism':
				$('#size #v').hide();
				break;
			case 'cylinder':
				$('#size #v').show();
				$('#size #v').val(obj.vertices);
				break;
			case 'path':
			case 'shape':
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

	$('#SetColor').click(function() {
		var color = $('#color #hex-color').val(),
			alpha = $('#color #alpha').val(),
			c = parseInt(color.slice(1), 16),
			r = (c >> 16) & 0xff,
			g = (c >> 8) & 0xff,
			b = c & 0xff;

		if(that.map.objects[that.active]) {
			that.run(new commands.SetColor(that.active, [r, g, b, +alpha]));
		}
	});
	$('#Move').click(function() {
		var x = $('#pos #x').val(),
			y = $('#pos #y').val(),
			z = $('#pos #z').val();
		if(that.map.objects[that.active]) {
			that.run(new commands.Move(that.active, [+x, +y, +z]));
		}
	});

	$('#Resize').click(function() {
		var x = $('#size #x').val(),
			y = $('#size #y').val(),
			z = $('#size #z').val(),
			v = $('#size #v').val();
		if(that.map.objects[that.active]) {
			that.run(new commands.Resize(that.active, [+x, +y, +z], +v));
		}
	});

	$('#Rotate').click(function() {
		var yaw = $('#rotateZ #yaw').val();
		if(that.map.objects[that.active]) {
			that.run(new commands.Rotate(that.active, +yaw));
		}
	});

	$('#AddPrism').click(function() {
		var x = $('#AddPrismModal #x').val(),
			y = $('#AddPrismModal #y').val(),
			z = $('#AddPrismModal #z').val(),
			dx = $('#AddPrismModal #dx').val(),
			dy = $('#AddPrismModal #dy').val(),
			dz = $('#AddPrismModal #dz').val();
		that.run(new commands.AddPrism([+x, +y, +z], [+dx, +dy, +dz]));
	});

	$('#AddPyramid').click(function() {
		var x = $('#AddPyramidModal #x').val(),
			y = $('#AddPyramidModal #y').val(),
			z = $('#AddPyramidModal #z').val(),
			dx = $('#AddPyramidModal #dx').val(),
			dy = $('#AddPyramidModal #dy').val(),
			dz = $('#AddPyramidModal #dz').val();
		that.run(new commands.AddPyramid([+x, +y, +z], [+dx, +dy, +dz]));
	});

	$('#AddCylinder').click(function() {
		var x = $('#AddCylinderModal #x').val(),
			y = $('#AddCylinderModal #y').val(),
			z = $('#AddCylinderModal #z').val(),
			dx = $('#AddPyramidModal #dx').val(),
			dy = $('#AddPyramidModal #dy').val(),
			dz = $('#AddPyramidModal #dz').val();

			vertices = $('#AddCylinderModal #vertices').val(),
		that.run(new commands.AddCylinder([+x, +y, +z], [+dx, +dy, +dz], +vertices));
	});

	$('#AddShape').click(function() {
		var height = $('#AddShapeModal #x').val();
		var path=[];
		$('#AddShapeModal #shape-list .uk-form-row').each(function() {
			var $this = $(this);
			var x = $this.find('input[name|=x]').val(),
				y = $this.find('input[name|=y]').val(),
				z = $this.find('input[name|=z]').val();
			console.log(+x, +y, +z);
			path.push([+x, +y, +z]);
		});
		that.run(new commands.AddShape(path, height));
	});

	$('#AddPath').click(function() {
		var path=[];
		$('#AddPathModal #path-list .uk-form-row').each(function() {
			var $this = $(this);
			var x = $this.find('input[name|=x]').val(),
				y = $this.find('input[name|=y]').val(),
				z = $this.find('input[name|=z]').val();
			console.log(+x, +y, +z);
			path.push([+x, +y, +z]);
		});
		that.run(new commands.AddPath(path));
	});
}

module.exports = Redactor;
